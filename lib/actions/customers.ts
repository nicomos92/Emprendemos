"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/auth/get-current-business-id";
import { customerSchema } from "@/lib/validations/customer";
import type { Customer, Quote, Order } from "@/types/database";

type ActionResult<T extends object = object> = { error: string } | ({ success: true } & T);

function genericError(message = "Algo salió mal. Probá de nuevo en un momento.") {
  return { error: message } as const;
}

interface CustomerFormFields {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export async function listCustomers(): Promise<Customer[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export interface CustomerWithPending extends Customer {
  pendingToCollect: number;
}

export async function listCustomersWithPending(): Promise<CustomerWithPending[]> {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (!customers || customers.length === 0) return [];

  const { data: orders } = await supabase
    .from("orders")
    .select("id, customer_id, total, status")
    .neq("status", "cancelled");

  const orderIds = (orders ?? []).map((order) => order.id);
  let payments: { order_id: string; amount: number }[] = [];
  if (orderIds.length > 0) {
    const { data } = await supabase.from("payments").select("order_id, amount").in("order_id", orderIds);
    payments = data ?? [];
  }

  const paidByOrderId = new Map<string, number>();
  for (const payment of payments) {
    paidByOrderId.set(payment.order_id, (paidByOrderId.get(payment.order_id) ?? 0) + payment.amount);
  }

  const pendingByCustomerId = new Map<string, number>();
  for (const order of orders ?? []) {
    const paid = paidByOrderId.get(order.id) ?? 0;
    const pending = order.total - paid;
    pendingByCustomerId.set(
      order.customer_id,
      (pendingByCustomerId.get(order.customer_id) ?? 0) + pending,
    );
  }

  return customers.map((customer) => ({
    ...customer,
    pendingToCollect: pendingByCustomerId.get(customer.id) ?? 0,
  }));
}

export async function createCustomer(
  input: CustomerFormFields,
): Promise<ActionResult<{ customer: Customer }>> {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    return genericError(parsed.error.issues[0]?.message);
  }

  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return genericError("Tu sesión expiró. Iniciá sesión de nuevo.");
  }

  const supabase = await createClient();
  const data = parsed.data;

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      business_id: businessId,
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      notes: data.notes || null,
    })
    .select("*")
    .single();

  if (error || !customer) {
    return genericError("No pudimos crear el cliente. Probá de nuevo en un momento.");
  }

  revalidatePath("/customers");
  return { success: true, customer };
}

export async function updateCustomer(
  id: string,
  input: CustomerFormFields,
): Promise<ActionResult<{ customer: Customer }>> {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    return genericError(parsed.error.issues[0]?.message);
  }

  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return genericError("Tu sesión expiró. Iniciá sesión de nuevo.");
  }

  const supabase = await createClient();
  const data = parsed.data;

  const { data: customer, error } = await supabase
    .from("customers")
    .update({
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      notes: data.notes || null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !customer) {
    return genericError("No pudimos guardar los cambios. Probá de nuevo en un momento.");
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return { success: true, customer };
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    return genericError("No pudimos eliminar el cliente. Probá de nuevo.");
  }

  revalidatePath("/customers");
  return { success: true };
}

export interface CustomerWithHistory {
  customer: Customer;
  quotes: Quote[];
  orders: Order[];
  totalPurchased: number;
  pendingToCollect: number;
}

export async function getCustomerWithHistory(id: string): Promise<CustomerWithHistory | null> {
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!customer) return null;

  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  const activeOrders = (orders ?? []).filter((order) => order.status !== "cancelled");
  const totalPurchased = activeOrders.reduce((sum, order) => sum + order.total, 0);

  const orderIds = activeOrders.map((order) => order.id);
  let totalPaid = 0;
  if (orderIds.length > 0) {
    const { data: payments } = await supabase
      .from("payments")
      .select("amount")
      .in("order_id", orderIds);
    totalPaid = (payments ?? []).reduce((sum, payment) => sum + payment.amount, 0);
  }

  const pendingToCollect = totalPurchased - totalPaid;

  return {
    customer,
    quotes: quotes ?? [],
    orders: orders ?? [],
    totalPurchased,
    pendingToCollect,
  };
}
