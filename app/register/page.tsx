"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { signUp } from "@/lib/actions/auth";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    const result = await signUp(values.email, values.password);
    if ("error" in result) {
      setFormError(result.error);
      return;
    }
    setRegistered(true);
  }

  if (registered) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <Card className="w-full max-w-sm text-center">
          <h1 className="text-xl font-semibold text-neutral-700">¡Ya casi!</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Revisá tu email para confirmar tu cuenta.
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
          <h1 className="text-2xl font-semibold text-neutral-700">EmprendeMos</h1>
          <p className="mt-1 text-sm text-neutral-500">Creá tu cuenta</p>
        </div>

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
            Crear cuenta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-primary-600 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
