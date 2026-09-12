import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the PKCE code exchange for both email confirmation and password
// recovery links. `next` is our own query param (appended to `redirectTo`
// when the email was sent) telling us where to send the user once the
// session is established — recovery links pass `next=/reset-password`.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login`);
  }

  if (next === "/reset-password") {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || !profile.business_id) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
