"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createCustomer, updateCustomer } from "@/lib/actions/customers";
import { customerSchema, type CustomerInput } from "@/lib/validations/customer";
import type { Customer } from "@/types/database";

type CustomerFormValues = z.input<typeof customerSchema>;

interface CustomerFormProps {
  customer?: Customer;
  heading: string;
}

export function CustomerForm({ customer, heading }: CustomerFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues, unknown, CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      address: customer?.address ?? "",
      notes: customer?.notes ?? "",
    },
  });

  async function onSubmit(values: CustomerInput) {
    setFormError(null);
    setIsSubmitting(true);

    const result = customer
      ? await updateCustomer(customer.id, values)
      : await createCustomer(values);

    setIsSubmitting(false);

    if ("error" in result) {
      setFormError(result.error);
      return;
    }

    router.push("/customers");
    router.refresh();
  }

  return (
    <Card className="max-w-xl">
      <h1 className="text-xl font-semibold text-neutral-700">{heading}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <Input
          label="Nombre"
          required
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Teléfono"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Dirección"
          error={errors.address?.message}
          {...register("address")}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700" htmlFor="notes">
            Notas
          </label>
          <textarea
            id="notes"
            rows={3}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            {...register("notes")}
          />
        </div>

        {formError && <p className="text-sm text-danger-600">{formError}</p>}

        <Button type="submit" className="mt-2 w-full" loading={isSubmitting}>
          {customer ? "Guardar cambios" : "Agregar cliente"}
        </Button>
      </form>
    </Card>
  );
}
