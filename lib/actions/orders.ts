"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/auth/get-current-business-id";
import { getQuote } from "@/lib/actions/quotes";
import { orderSchema } from "@/lib/validations/order";
import type { Order, OrderItem, Customer, OrderStatus } from "@/types/database";

type ActionResult<T extends object = object> = { error: string } | ({ success: true } & T);

function genericError(message = "Algo salió mal. Probá de nuevo en un momento.") {
  return { error: message } as const;
}

const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];

export interface OrderWithCustomerName extends Order {
  customer_name: string;
  pendingToCollect: number;
}

export async function listOrders(): Promise<OrderWithCustomerName[]> {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (!orders || orders.length === 0) return [];

  const customerIds = [...new Set(orders.map((order) => order.customer_id))];
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .in("id", customerIds);

  const nameById = new Map((customers ?? []).map((customer) => [customer.id, customer.name]));

  const orderIds = orders.map((order) => order.id);
  let payments: { order_id: string; amount: number }[] = [];
  if (orderIds.length > 0) {
    const { data } = await supabase.from("payments").select("order_id, amount").in("order_id", orderIds);
    payments = data ?? [];
  }

  const paidByOrderId = new Map<string, number>();
  for (const payment of payments) {
    paidByOrderId.set(payment.order_id, (paidByOrderId.get(payment.order_id) ?? 0) + payment.amount);
  }

  return orders.map((order) => ({
    ...order,
    customer_name: nameById.get(order.customer_id) ?? "",
    pendingToCollect: order.total - (paidByOrderId.get(order.id) ?? 0),
  }));
}

export interface OrderItemWithProduct extends OrderItem {
  product_name: string;
}

export interface OrderDetails {
  order: Order;
  customer: Customer;
  items: OrderItemWithProduct[];
  totalPaid: number;
  pendingToCollect: number;
}

export async function getOrder(id: string): Promise<OrderDetails | null> {
  const supabase = await createClient();

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) return null;

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", order.customer_id)
    .maybeSingle();
  if (!customer) return null;

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);

  const productIds = [...new Set((items ?? []).map((item) => item.product_id))];
  let products: { id: string; name: string }[] = [];
  if (productIds.length > 0) {
    const { data } = await supabase.from("products").select("id, name").in("id", productIds);
    products = data ?? [];
  }
  const nameById = new Map(products.map((product) => [product.id, product.name]));

  const items_with_product: OrderItemWithProduct[] = (items ?? []).map((item) => ({
    ...item,
    product_name: nameById.get(item.product_id) ?? "",
  }));

  const { data: payments } = await supabase.from("payments").select("amount").eq("order_id", id);
  const totalPaid = (payments ?? []).reduce((sum, payment) => sum + payment.amount, 0);
  const pendingToCollect = order.total - totalPaid;

  return { order, customer, items: items_with_product, totalPaid, pendingToCollect };
}

interface OrderLineItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

interface InsertOrderParams {
  businessId: string;
  customerId: string;
  quoteId: string | null;
  items: OrderLineItem[];
  discount: number;
  notes?: string;
}

// Known MVP limitation: Supabase JS doesn't expose a multi-statement
// transaction API, so the order and its items are inserted sequentially.
// If the items insert fails we delete the order row right after to avoid
// leaving an orphaned order with no line items.
async function insertOrderWithItems(
  params: InsertOrderParams,
): Promise<ActionResult<{ order: Order }>> {
  const supabase = await createClient();

  const itemsWithSubtotal = params.items.map((item) => ({
    ...item,
    subtotal: item.quantity * item.unit_price,
  }));
  const subtotal = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal - params.discount;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      business_id: params.businessId,
      customer_id: params.customerId,
      quote_id: params.quoteId,
      subtotal,
      discount: params.discount,
      total,
      notes: params.notes || null,
    })
    .select("*")
    .single();

  if (orderError || !order) {
    return genericError("No pudimos crear el pedido. Probá de nuevo en un momento.");
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    itemsWithSubtotal.map((item) => ({
      order_id: order.id,
      business_id: params.businessId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
    })),
  );

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return genericError("No pudimos guardar los productos del pedido. Probá de nuevo.");
  }

  revalidatePath("/orders");
  return { success: true, order };
}

export async function createOrderFromQuote(
  quoteId: string,
): Promise<ActionResult<{ order: Order }>> {
  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return genericError("Tu sesión expiró. Iniciá sesión de nuevo.");
  }

  const details = await getQuote(quoteId);
  if (!details) {
    return genericError("No encontramos el presupuesto.");
  }

  if (details.quote.status !== "accepted") {
    return genericError("Solo podés convertir presupuestos aceptados en pedidos.");
  }

  return insertOrderWithItems({
    businessId,
    customerId: details.quote.customer_id,
    quoteId: details.quote.id,
    items: details.items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
    discount: details.quote.discount,
    notes: details.quote.notes ?? undefined,
  });
}

interface OrderFormFields {
  customer_id: string;
  discount?: number;
  notes?: string;
  items: { product_id: string; quantity: number; unit_price: number }[];
}

export async function createDirectOrder(
  input: OrderFormFields,
): Promise<ActionResult<{ order: Order }>> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    return genericError(parsed.error.issues[0]?.message);
  }

  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return genericError("Tu sesión expiró. Iniciá sesión de nuevo.");
  }

  const data = parsed.data;

  return insertOrderWithItems({
    businessId,
    customerId: data.customer_id,
    quoteId: null,
    items: data.items,
    discount: data.discount,
    notes: data.notes,
  });
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ActionResult<{ order: Order }>> {
  if (!ORDER_STATUSES.includes(status)) {
    return genericError("Estado inválido.");
  }

  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !order) {
    return genericError("No pudimos actualizar el estado del pedido.");
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
  return { success: true, order };
}
