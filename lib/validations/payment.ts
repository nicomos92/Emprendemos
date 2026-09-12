import { z } from "zod";
import type { PaymentMethod } from "@/types/database";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  mercadopago: "Mercado Pago",
  other: "Otro",
};

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export const paymentSchema = z.object({
  order_id: z.string().uuid("Pedido inválido"),
  amount: z.coerce.number().positive("Tiene que ser mayor a 0"),
  payment_method: z.enum(["cash", "transfer", "mercadopago", "other"], {
    message: "Elegí una forma de pago",
  }),
  payment_date: z.string().min(1, "Elegí una fecha").default(todayDateString),
  notes: z.string().optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
