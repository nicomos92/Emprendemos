"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createCashMovement } from "@/lib/actions/cash";
import { cashMovementSchema } from "@/lib/validations/cash-movement";
import type { CashMovementInput } from "@/lib/validations/cash-movement";

type CashMovementFormValues = z.input<typeof cashMovementSchema>;

interface CashMovementDrawerProps {
  open: boolean;
  onClose: () => void;
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function CashMovementDrawer({ open, onClose }: CashMovementDrawerProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CashMovementFormValues, unknown, CashMovementInput>({
    resolver: zodResolver(cashMovementSchema),
    defaultValues: {
      type: "expense",
      amount: undefined,
      description: "",
      movement_date: todayDateString(),
    },
  });

  async function onSubmit(values: CashMovementInput) {
    setFormError(null);
    setIsSubmitting(true);

    const result = await createCashMovement(values);

    setIsSubmitting(false);

    if ("error" in result) {
      setFormError(result.error);
      return;
    }

    reset();
    onClose();
    router.refresh();
  }

  return (
    <Drawer open={open} onClose={onClose} title="Registrar movimiento">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select label="Tipo" required error={errors.type?.message} {...register("type")}>
          <option value="expense">Salida (compra, gasto)</option>
          <option value="income">Entrada (ingreso manual)</option>
        </Select>

        <Input
          label="Monto"
          type="number"
          step="0.01"
          required
          error={errors.amount?.message}
          {...register("amount")}
        />

        <Input
          label="Descripción"
          required
          error={errors.description?.message}
          {...register("description")}
        />

        <Input
          label="Fecha"
          type="date"
          required
          error={errors.movement_date?.message}
          {...register("movement_date")}
        />

        {formError && <p className="text-sm text-danger-600">{formError}</p>}

        <Button type="submit" className="mt-2 w-full" loading={isSubmitting}>
          Registrar movimiento
        </Button>
      </form>
    </Drawer>
  );
}
