"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/auth/get-current-business-id";
import { cashMovementSchema } from "@/lib/validations/cash-movement";
import type { CashMovement } from "@/types/database";

type ActionResult<T extends object = object> = { error: string } | ({ success: true } & T);

function genericError(message = "Algo salió mal. Probá de nuevo en un momento.") {
  return { error: message } as const;
}

function currentMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { dateFrom: from.toISOString().slice(0, 10), dateTo: to.toISOString().slice(0, 10) };
}

export async function listCashMovements(dateFrom?: string, dateTo?: string): Promise<CashMovement[]> {
  const supabase = await createClient();
  const range = dateFrom && dateTo ? { dateFrom, dateTo } : currentMonthRange();

  const { data } = await supabase
    .from("cash_movements")
    .select("*")
    .gte("movement_date", range.dateFrom)
    .lte("movement_date", range.dateTo)
    .order("movement_date", { ascending: false })
    .order("created_at", { ascending: false });

  return data ?? [];
}

interface CashMovementFormFields {
  type: string;
  amount: number;
  description: string;
  movement_date?: string;
}

export async function createCashMovement(
  input: CashMovementFormFields,
): Promise<ActionResult<{ movement: CashMovement }>> {
  const parsed = cashMovementSchema.safeParse(input);
  if (!parsed.success) {
    return genericError(parsed.error.issues[0]?.message);
  }

  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return genericError("Tu sesión expiró. Iniciá sesión de nuevo.");
  }

  const supabase = await createClient();
  const data = parsed.data;

  const { data: movement, error } = await supabase
    .from("cash_movements")
    .insert({
      business_id: businessId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      movement_date: data.movement_date,
    })
    .select("*")
    .single();

  if (error || !movement) {
    return genericError("No pudimos registrar el movimiento. Probá de nuevo en un momento.");
  }

  revalidatePath("/cash");
  return { success: true, movement };
}

export interface CashSummary {
  totalIn: number;
  totalOut: number;
  balance: number;
}

export async function getCashSummary(dateFrom?: string, dateTo?: string): Promise<CashSummary> {
  const movements = await listCashMovements(dateFrom, dateTo);

  const totalIn = movements
    .filter((movement) => movement.type === "income")
    .reduce((sum, movement) => sum + movement.amount, 0);
  const totalOut = movements
    .filter((movement) => movement.type === "expense")
    .reduce((sum, movement) => sum + movement.amount, 0);

  return { totalIn, totalOut, balance: totalIn - totalOut };
}
