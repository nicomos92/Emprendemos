"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { signIn } from "@/lib/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetOk = searchParams.get("reset") === "ok";
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const result = await signIn(values.email, values.password);
    if ("error" in result) {
      setFormError(result.error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-neutral-700">EmprendeMos</h1>
        <p className="mt-1 text-sm text-neutral-500">Entrá a tu cuenta</p>
      </div>

      {resetOk && (
        <p className="mb-4 rounded-xl bg-primary-50 px-3 py-2 text-sm text-primary-700">
          Tu contraseña se actualizó. Iniciá sesión con la nueva.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        {formError && <p className="text-sm text-danger-600">{formError}</p>}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Entrar
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-sm">
        <Link href="/forgot-password" className="text-primary-600 hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
        <p className="text-neutral-500">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="text-primary-600 hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
