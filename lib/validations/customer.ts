import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Contanos cómo se llama el cliente"),
  phone: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Ingresá un email válido",
    }),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
