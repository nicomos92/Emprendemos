"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/auth/get-current-business-id";
import { getOrder } from "@/lib/actions/orders";
import { paymentSchema } from "@/lib/validations/payment";
import type { Payment } from "@/types/database";

type ActionResult<T extends object = object> = { error: string } | ({ success: true } & T);

function genericError(message = "Algo salió mal. Probá de nuevo en un momento.") {
  return { error: message } as const;
}

interface PaymentFormFields {
  order_id: string;
  amount: number;
  payment_method: string;
  payment_date?: string;
  notes?: string;
}

export async function createPayment(
  input: PaymentFormFields,
): Promise<ActionResult<{ payment: Payment; cashMovementWarning?: string }>> {
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) {
    return genericError(parsed.error.issues[0]?.message);
  }

  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return genericError("Tu sesión expiró. Iniciá sesión de nuevo.");
  }

  const data = parsed.data;

  const orderDetails = await getOrder(data.order_id);
  if (!orderDetails) {
    return genericError("No encontramos el pedido.");
  }

  const supabase = await createClient();

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      business_id: businessId,
      order_id: data.order_id,
      amount: data.amount,
      payment_method: data.payment_method,
      payment_date: data.payment_date,
      notes: data.notes || null,
    })
    .select("*")
    .single();

  if (error || !payment) {
    return genericError("No pudimos registrar el cobro. Probá de nuevo en un momento.");
  }

  let cashMovementWarning: string | undefined;
  const { error: cashMovementError } = await supabase.from("cash_movements").insert({
    business_id: businessId,
    type: "income",
    amount: data.amount,
    description: `Cobro pedido #${orderDetails.order.id.slice(0, 8)}`,
    reference_type: "payment",
    reference_id: payment.id,
    movement_date: data.payment_date,
  });

  if (cashMovementError) {
    cashMovementWarning =
      "El cobro se registró, pero no pudimos reflejarlo en la caja automáticamente.";
  }

  revalidatePath(`/orders/${data.order_id}`);
  revalidatePath("/orders");
  revalidatePath("/cash");

  return { success: true, payment, cashMovementWarning };
}

export async function listPaymentsForOrder(orderId: string): Promise<Payment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("payment_date", { ascending: false });
  return data ?? [];
}
