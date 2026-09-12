"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createQuote } from "@/lib/actions/quotes";
import { quoteSchema, type QuoteInput } from "@/lib/validations/quote";
import { formatCurrency } from "@/lib/pricing";
import type { Customer, Product } from "@/types/database";

type QuoteFormValues = z.input<typeof quoteSchema>;

interface QuoteFormProps {
  customers: Customer[];
  products: Product[];
}

export function QuoteForm({ customers, products }: QuoteFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuoteFormValues, unknown, QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      customer_id: "",
      valid_until: "",
      discount: 0,
      notes: "",
      items: [{ product_id: "", quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const items = watch("items");
  const discount = Number(watch("discount")) || 0;

  const productById = new Map(products.map((product) => [product.id, product]));

  const lineSubtotals = items.map((item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    return quantity * unitPrice;
  });
  const subtotal = lineSubtotals.reduce((sum, value) => sum + value, 0);
  const total = subtotal - discount;

  function handleProductChange(index: number, productId: string) {
    const product = productById.get(productId);
    setValue(`items.${index}.unit_price`, product ? product.sale_price : 0);
  }

  async function onSubmit(values: QuoteInput) {
    setFormError(null);
    setIsSubmitting(true);

    const result = await createQuote(values);

    setIsSubmitting(false);

    if ("error" in result) {
      setFormError(result.error);
      return;
    }

    router.push(`/quotes/${result.quote.id}`);
  }

  return (
    <Card className="max-w-2xl">
      <h1 className="text-xl font-semibold text-neutral-700">Crear presupuesto</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <Select
          label="Cliente"
          required
          error={errors.customer_id?.message}
          {...register("customer_id")}
        >
          <option value="">Elegí un cliente</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </Select>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-neutral-700">Productos</h2>

          {fields.map((field, index) => {
            const lineSubtotal = lineSubtotals[index] ?? 0;
            return (
              <div
                key={field.id}
                className="flex flex-col gap-3 rounded-xl border border-neutral-100 p-3 sm:flex-row sm:items-end"
              >
                <div className="flex-1">
                  <Select
                    label="Producto"
                    error={errors.items?.[index]?.product_id?.message}
                    {...register(`items.${index}.product_id`, {
                      onChange: (event) => handleProductChange(index, event.target.value),
                    })}
                  >
                    <option value="">Elegí un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="w-full sm:w-24">
                  <Input
                    label="Cantidad"
                    type="number"
                    min="0"
                    step="1"
                    error={errors.items?.[index]?.quantity?.message}
                    {...register(`items.${index}.quantity`)}
                  />
                </div>
                <div className="w-full sm:w-32">
                  <Input
                    label="Precio unitario"
                    type="number"
                    min="0"
                    step="0.01"
                    error={errors.items?.[index]?.unit_price?.message}
                    {...register(`items.${index}.unit_price`)}
                  />
                </div>
                <div className="flex w-full items-center justify-between gap-2 sm:w-32 sm:flex-col sm:items-end">
                  <p className="text-sm font-medium text-neutral-700">
                    {formatCurrency(lineSubtotal)}
                  </p>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      className="text-xs font-medium text-danger-600 hover:underline"
                      onClick={() => remove(index)}
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {errors.items?.root?.message && (
            <p className="text-sm text-danger-600">{errors.items.root.message}</p>
          )}

          <button
            type="button"
            className="self-start text-sm font-medium text-primary-600 hover:underline"
            onClick={() => append({ product_id: "", quantity: 1, unit_price: 0 })}
          >
            + Agregar producto
          </button>
        </div>

        <Input
          label="Descuento"
          type="number"
          min="0"
          step="0.01"
          error={errors.discount?.message}
          {...register("discount")}
        />

        <Input
          label="Válido hasta"
          type="date"
          error={errors.valid_until?.message}
          {...register("valid_until")}
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

        <div className="rounded-xl bg-neutral-50 p-4">
          <div className="flex justify-between text-sm text-neutral-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-neutral-600">
            <span>Descuento</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
          <div className="mt-2 flex justify-between text-base font-semibold text-neutral-700">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {formError && <p className="text-sm text-danger-600">{formError}</p>}

        <Button type="submit" className="mt-2 w-full" loading={isSubmitting}>
          Crear presupuesto
        </Button>
      </form>
    </Card>
  );
}
