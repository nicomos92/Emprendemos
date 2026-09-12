"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { requestPasswordReset } from "@/lib/actions/auth";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordInput) {
    setFormError(null);
    const result = await requestPasswordReset(values.email);
    if ("error" in result) {
      setFormError(result.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <Card className="w-full max-w-sm text-center">
          <h1 className="text-xl font-semibold text-neutral-700">Revisá tu email</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Te enviamos un link para elegir una nueva contraseña.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm text-primary-600 hover:underline">
            Volver a iniciar sesión
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-neutral-700">Recuperar contraseña</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Ingresá tu email y te mandamos un link
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          {formError && <p className="text-sm text-danger-600">{formError}</p>}

          <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
            Enviar link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link href="/login" className="text-primary-600 hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
