import { z } from "zod";

export const orderItemSchema = z.object({
  product_id: z.string().uuid("Elegí un producto"),
  quantity: z.coerce.number().positive("Tiene que ser mayor a 0"),
  unit_price: z.coerce.number().min(0, "No puede ser negativo"),
});

export const orderSchema = z.object({
  customer_id: z.string().uuid("Elegí un cliente"),
  discount: z.coerce.number().min(0, "No puede ser negativo").default(0),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Agregá al menos un producto"),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
