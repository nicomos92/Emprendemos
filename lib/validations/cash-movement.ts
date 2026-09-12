import { z } from "zod";

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export const cashMovementSchema = z.object({
  type: z.enum(["income", "expense"], { message: "Elegí un tipo de movimiento" }),
  amount: z.coerce.number().positive("Tiene que ser mayor a 0"),
  description: z.string().min(1, "Contanos de qué se trata"),
  movement_date: z.string().min(1, "Elegí una fecha").default(todayDateString),
});

export type CashMovementInput = z.infer<typeof cashMovementSchema>;
