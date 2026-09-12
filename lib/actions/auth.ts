"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createBusinessSchema,
} from "@/lib/validations/auth";

type ActionResult<T extends object = object> = { error: string } | ({ success: true } & T);

function genericError(message = "Algo salió mal. Probá de nuevo en un momento.") {
  return { error: message } as const;
}

async function getSiteUrl() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return process.env.NEXT_PUBLIC_SITE_URL ?? `${protocol}://${host}`;
}

export async function signUp(
  email: string,
  password: string,
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({ email, password, confirmPassword: password });
  if (!parsed.success) {
    return genericError(parsed.error.issues[0]?.message);
  }

  const siteUrl = await getSiteUrl();
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return genericError("Ese email ya está registrado. Probá iniciar sesión.");
    }
    return genericError("No pudimos crear tu cuenta. Probá de nuevo.");
  }

  return { success: true };
}

export async function signIn(
  email: string,
  password: string,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return genericError(parsed.error.issues[0]?.message);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return genericError("Email o contraseña incorrectos.");
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(email: string): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    return genericError(parsed.error.issues[0]?.message);
  }

  const siteUrl = await getSiteUrl();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return genericError("No pudimos enviar el email. Probá de nuevo.");
  }

  return { success: true };
}

export async function updatePassword(newPassword: string): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    password: newPassword,
    confirmPassword: newPassword,
  });
  if (!parsed.success) {
    return genericError(parsed.error.issues[0]?.message);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return genericError("No pudimos actualizar tu contraseña. Probá de nuevo.");
  }

  return { success: true };
}

function generateSlug(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "negocio"}-${suffix}`;
}

export async function createBusiness(
  name: string,
  sellsWhat: string,
): Promise<ActionResult<{ businessId: string }>> {
  const parsed = createBusinessSchema.safeParse({ name, sellsWhat });
  if (!parsed.success) {
    return genericError(parsed.error.issues[0]?.message);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return genericError("Tu sesión expiró. Iniciá sesión de nuevo.");
  }

  let businessId: string | null = null;
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, error } = await supabase
      .from("businesses")
      .insert({
        name: parsed.data.name,
        slug: generateSlug(parsed.data.name),
        sells_what: parsed.data.sellsWhat,
      })
      .select("id")
      .single();

    if (!error && data) {
      businessId = data.id;
      break;
    }

    lastError = error?.message ?? "unknown error";
    // Retry once in case of a slug collision; otherwise stop.
    if (!lastError.toLowerCase().includes("slug")) {
      break;
    }
  }

  if (!businessId) {
    return genericError(
      lastError?.toLowerCase().includes("slug")
        ? "No pudimos crear tu negocio, probá de nuevo."
        : "No pudimos crear tu negocio. Probá de nuevo en un momento.",
    );
  }

  const displayName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Dueño/a";

  const { error: profileError } = await supabase.from("profiles").insert({
    user_id: user.id,
    business_id: businessId,
    role: "owner",
    name: displayName,
  });

  if (profileError) {
    return genericError("Creamos tu negocio pero no pudimos guardar tu perfil. Contactanos.");
  }

  return { success: true, businessId };
}
