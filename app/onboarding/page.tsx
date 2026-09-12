"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createBusiness } from "@/lib/actions/auth";
import type { CreateBusinessInput } from "@/lib/validations/auth";

const SELLS_WHAT_OPTIONS: { value: CreateBusinessInput["sellsWhat"]; label: string }[] = [
  { value: "productos", label: "Productos" },
  { value: "servicios", label: "Servicios" },
  { value: "ambos", label: "Productos y servicios" },
  { value: "otro", label: "Otro" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [sellsWhat, setSellsWhat] = useState<CreateBusinessInput["sellsWhat"] | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function goToStepTwo() {
    if (!name.trim()) {
      setNameError("Contanos cómo se llama tu negocio");
      return;
    }
    setNameError(null);
    setStep(2);
  }

  async function finish() {
    if (!sellsWhat) return;
    setFormError(null);
    setIsSubmitting(true);
    const result = await createBusiness(name.trim(), sellsWhat);
    setIsSubmitting(false);

    if ("error" in result) {
      setFormError(result.error);
      return;
    }

    router.push("/products/new?onboarding=1");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6">
          <p className="text-xs font-medium text-primary-600">Paso {step} de 2</p>
          <div className="mt-2 flex gap-1">
            <span className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-primary-600" : "bg-neutral-100"}`} />
            <span className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-primary-600" : "bg-neutral-100"}`} />
          </div>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-xl font-semibold text-neutral-700">
                ¿Cómo se llama tu negocio?
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Es el nombre que van a ver tus clientes.
              </p>
            </div>
            <Input
              label="Nombre del negocio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError ?? undefined}
            />
            <Button type="button" className="mt-2 w-full" onClick={goToStepTwo}>
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-xl font-semibold text-neutral-700">¿Qué vendés?</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Así te mostramos las herramientas justas para vos.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {SELLS_WHAT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm ${
                    sellsWhat === option.value
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-neutral-200 text-neutral-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="sellsWhat"
                    value={option.value}
                    checked={sellsWhat === option.value}
                    onChange={() => setSellsWhat(option.value)}
                    className="h-4 w-4"
                  />
                  {option.label}
                </label>
              ))}
            </div>

            {formError && <p className="text-sm text-danger-600">{formError}</p>}

            <div className="mt-2 flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                Atrás
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={!sellsWhat}
                loading={isSubmitting}
                onClick={finish}
              >
                Terminar
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
