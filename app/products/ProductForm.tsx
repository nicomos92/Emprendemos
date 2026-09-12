"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { productSchema, NEW_CATEGORY_VALUE, type ProductInput } from "@/lib/validations/product";
import {
  calculateTotalCost,
  calculateSuggestedPrice,
  calculateProfit,
  formatCurrency,
} from "@/lib/pricing";
import type { Category, Product } from "@/types/database";

// react-hook-form works with the pre-coercion "input" shape (raw form
// strings), while onSubmit receives the post-coercion "output" shape
// (ProductInput) once zodResolver has parsed it.
type ProductFormValues = z.input<typeof productSchema>;

interface ProductFormProps {
  categories: Category[];
  product?: Product;
  heading: string;
  onboarding?: boolean;
}

export function ProductForm({ categories, product, heading, onboarding }: ProductFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceTouched, setPriceTouched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues, unknown, ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      category_id: product?.category_id ?? "",
      new_category_name: "",
      material_cost: product?.material_cost ?? 0,
      labor_cost: product?.labor_cost ?? 0,
      other_cost: product?.other_cost ?? 0,
      desired_margin: product?.desired_margin ?? 30,
      sale_price: product?.sale_price ?? undefined,
      stock: product?.stock ?? 0,
      minimum_stock: product?.minimum_stock ?? 0,
    },
  });

  const materialCost = Number(watch("material_cost")) || 0;
  const laborCost = Number(watch("labor_cost")) || 0;
  const otherCost = Number(watch("other_cost")) || 0;
  const desiredMargin = Number(watch("desired_margin")) || 0;
  const salePriceValue = watch("sale_price");
  const categoryId = watch("category_id");
  const addingCategory = categoryId === NEW_CATEGORY_VALUE;

  const totalCost = useMemo(
    () => calculateTotalCost({ materialCost, laborCost, otherCost }),
    [materialCost, laborCost, otherCost],
  );
  const suggestedPrice = useMemo(
    () => calculateSuggestedPrice({ totalCost, desiredMarginPercent: desiredMargin }),
    [totalCost, desiredMargin],
  );

  const effectiveSalePrice =
    priceTouched && salePriceValue !== undefined && salePriceValue !== null && !Number.isNaN(salePriceValue)
      ? Number(salePriceValue)
      : suggestedPrice;
  const profit = calculateProfit({ salePrice: effectiveSalePrice, totalCost });

  function useSuggestedPrice() {
    setPriceTouched(false);
    setValue("sale_price", undefined);
  }

  async function onSubmit(values: ProductInput) {
    setFormError(null);
    setIsSubmitting(true);

    const payload = {
      ...values,
      category_id: values.category_id === NEW_CATEGORY_VALUE ? "" : values.category_id,
      sale_price: priceTouched ? values.sale_price : undefined,
    };

    const result = product
      ? await updateProduct(product.id, payload)
      : await createProduct(payload);

    setIsSubmitting(false);

    if ("error" in result) {
      setFormError(result.error);
      return;
    }

    if (!product && onboarding) {
      router.push("/dashboard?welcome=1");
      return;
    }

    router.push("/products");
    router.refresh();
  }

  return (
    <Card className="max-w-xl">
      <h1 className="text-xl font-semibold text-neutral-700">{heading}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <Input
          label="Nombre del producto"
          required
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700" htmlFor="description">
            Descripción
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            {...register("description")}
          />
        </div>

        <div>
          <Select label="Categoría" {...register("category_id")}>
            <option value="">Sin categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
            <option value={NEW_CATEGORY_VALUE}>+ Otra categoría...</option>
          </Select>
          {addingCategory && (
            <div className="mt-2">
              <Input
                label="Nombre de la nueva categoría"
                {...register("new_category_name")}
              />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-primary-100 bg-primary-50 p-4">
          <h2 className="text-sm font-semibold text-primary-700">Costos y precio</h2>
          <p className="mt-1 text-xs text-primary-700">
            Contanos cuánto te cuesta hacer este producto. Nosotros te ayudamos a calcular un
            precio que te convenga.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Materiales"
              type="number"
              step="0.01"
              min="0"
              error={errors.material_cost?.message}
              {...register("material_cost")}
            />
            <Input
              label="Mano de obra"
              type="number"
              step="0.01"
              min="0"
              error={errors.labor_cost?.message}
              {...register("labor_cost")}
            />
            <Input
              label="Otros gastos"
              type="number"
              step="0.01"
              min="0"
              error={errors.other_cost?.message}
              {...register("other_cost")}
            />
          </div>

          <p className="mt-4 text-sm text-neutral-700">
            Costo total: <span className="font-semibold">{formatCurrency(totalCost)}</span>
          </p>

          <div className="mt-4">
            <Input
              label="¿Qué margen de ganancia querés?"
              helperText="Por ejemplo, 30 significa que un 30% del precio final es tu ganancia."
              type="number"
              min="0"
              max="99"
              error={errors.desired_margin?.message}
              {...register("desired_margin")}
            />
          </div>

          <div className="mt-4 rounded-lg bg-white p-3">
            <p className="text-sm text-neutral-700">
              Precio sugerido:{" "}
              <span className="font-semibold text-primary-700">
                {formatCurrency(suggestedPrice)}
              </span>
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Con este precio vas a ganar aproximadamente {formatCurrency(profit)} por unidad.
            </p>
          </div>

          <div className="mt-4">
            <Input
              label="Precio de venta"
              helperText="Podés usar el precio sugerido o poner el tuyo."
              type="number"
              step="0.01"
              min="0"
              placeholder={suggestedPrice.toFixed(2)}
              error={errors.sale_price?.message}
              {...register("sale_price", {
                onChange: () => setPriceTouched(true),
              })}
            />
            {priceTouched && (
              <button
                type="button"
                className="mt-1 text-xs font-medium text-primary-600 hover:underline"
                onClick={useSuggestedPrice}
              >
                Usar el precio sugerido
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Stock actual"
            type="number"
            min="0"
            error={errors.stock?.message}
            {...register("stock")}
          />
          <Input
            label="Stock mínimo"
            helperText="Te avisamos cuando llegue a este número."
            type="number"
            min="0"
            error={errors.minimum_stock?.message}
            {...register("minimum_stock")}
          />
        </div>

        {formError && <p className="text-sm text-danger-600">{formError}</p>}

        <Button type="submit" className="mt-2 w-full" loading={isSubmitting}>
          {product ? "Guardar cambios" : "Agregar producto"}
        </Button>
      </form>
    </Card>
  );
}
