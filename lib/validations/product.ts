import { z } from "zod";

// Sentinel value for the "+ Otra categoría..." option in the category select.
export const NEW_CATEGORY_VALUE = "__new__";

export const productSchema = z.object({
  name: z.string().min(1, "Contanos cómo se llama el producto"),
  description: z.string().optional(),
  category_id: z.string().optional(),
  new_category_name: z.string().optional(),
  material_cost: z.coerce.number().min(0, "No puede ser negativo").default(0),
  labor_cost: z.coerce.number().min(0, "No puede ser negativo").default(0),
  other_cost: z.coerce.number().min(0, "No puede ser negativo").default(0),
  desired_margin: z.coerce
    .number()
    .min(0, "Tiene que estar entre 0 y 99")
    .max(99, "Tiene que estar entre 0 y 99")
    .default(30),
  sale_price: z.coerce.number().min(0, "No puede ser negativo").optional(),
  stock: z.coerce.number().int("Tiene que ser un número entero").min(0, "No puede ser negativo").default(0),
  minimum_stock: z.coerce
    .number()
    .int("Tiene que ser un número entero")
    .min(0, "No puede ser negativo")
    .default(0),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Ingresá un nombre para la categoría"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
