"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { updatePassword } from "@/lib/actions/auth";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values: ResetPasswordInput) {
    setFormError(null);
    const result = await updatePassword(values.password);
    if ("error" in result) {
      setFormError(result.error);
      return;
    }
    router.push("/login?reset=ok");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-neutral-700">Nueva contraseña</h1>
          <p className="mt-1 text-sm text-neutral-500">Elegí una contraseña nueva</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Contraseña nueva"
            type="password"
            autoComplete="new-password"
            helperText="Al menos 6 caracteres"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {formError && <p className="text-sm text-danger-600">{formError}</p>}

          <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
            Guardar contraseña
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
