import { z } from "zod";

export const quoteItemSchema = z.object({
  product_id: z.string().uuid("Elegí un producto"),
  quantity: z.coerce.number().positive("Tiene que ser mayor a 0"),
  unit_price: z.coerce.number().min(0, "No puede ser negativo"),
});

export const quoteSchema = z.object({
  customer_id: z.string().uuid("Elegí un cliente"),
  valid_until: z.string().optional(),
  discount: z.coerce.number().min(0, "No puede ser negativo").default(0),
  notes: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, "Agregá al menos un producto"),
});

export type QuoteItemInput = z.infer<typeof quoteItemSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
