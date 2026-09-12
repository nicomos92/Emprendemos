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
import { createPayment } from "@/lib/actions/payments";
import { paymentSchema, PAYMENT_METHOD_LABELS } from "@/lib/validations/payment";
import type { PaymentInput } from "@/lib/validations/payment";

type PaymentFormValues = z.input<typeof paymentSchema>;

interface PaymentDrawerProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  pendingToCollect: number;
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function PaymentDrawer({ open, onClose, orderId, pendingToCollect }: PaymentDrawerProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues, unknown, PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      order_id: orderId,
      amount: pendingToCollect > 0 ? pendingToCollect : undefined,
      payment_method: "cash",
      payment_date: todayDateString(),
      notes: "",
    },
  });

  async function onSubmit(values: PaymentInput) {
    setFormError(null);
    setIsSubmitting(true);

    const result = await createPayment(values);

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
    <Drawer open={open} onClose={onClose} title="Registrar cobro">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input type="hidden" {...register("order_id")} />

        <Input
          label="Monto"
          type="number"
          step="0.01"
          required
          error={errors.amount?.message}
          {...register("amount")}
        />

        <Select
          label="Forma de pago"
          required
          error={errors.payment_method?.message}
          {...register("payment_method")}
        >
          {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Input
          label="Fecha"
          type="date"
          required
          error={errors.payment_date?.message}
          {...register("payment_date")}
        />

        <Input label="Notas" error={errors.notes?.message} {...register("notes")} />

        {formError && <p className="text-sm text-danger-600">{formError}</p>}

        <Button type="submit" className="mt-2 w-full" loading={isSubmitting}>
          Registrar cobro
        </Button>
      </form>
    </Drawer>
  );
}
