"use server";

import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database";

const PENDING_STATUSES: OrderStatus[] = ["new", "confirmed", "preparing", "ready"];

function currentMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  return { from, to };
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  minimum_stock: number;
}

export interface DashboardSummary {
  salesThisMonth: number;
  estimatedProfitThisMonth: number;
  pendingOrdersCount: number;
  pendingToCollect: number;
  lowStockProducts: LowStockProduct[];
  productsCount: number;
  hasAnyOrders: boolean;
  hasAnyProducts: boolean;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient();
  const { from, to } = currentMonthRange();

  const { data: ordersThisMonth } = await supabase
    .from("orders")
    .select("id, total, status")
    .neq("status", "cancelled")
    .gte("created_at", from)
    .lt("created_at", to);

  const salesThisMonth = (ordersThisMonth ?? []).reduce((sum, order) => sum + order.total, 0);

  const orderIdsThisMonth = (ordersThisMonth ?? []).map((order) => order.id);
  let estimatedProfitThisMonth = 0;
  if (orderIdsThisMonth.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity, unit_price")
      .in("order_id", orderIdsThisMonth);

    const productIds = [...new Set((items ?? []).map((item) => item.product_id))];
    let costById = new Map<string, number>();
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from("products")
        .select("id, total_cost")
        .in("id", productIds);
      costById = new Map((products ?? []).map((product) => [product.id, product.total_cost]));
    }

    estimatedProfitThisMonth = (items ?? []).reduce((sum, item) => {
      const totalCost = costById.get(item.product_id) ?? 0;
      return sum + (item.unit_price - totalCost) * item.quantity;
    }, 0);
  }

  const { count: pendingOrdersCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("status", PENDING_STATUSES);

  const { data: allActiveOrders } = await supabase
    .from("orders")
    .select("id, total")
    .neq("status", "cancelled");

  let pendingToCollect = 0;
  const allOrderIds = (allActiveOrders ?? []).map((order) => order.id);
  if (allOrderIds.length > 0) {
    const { data: payments } = await supabase
      .from("payments")
      .select("order_id, amount")
      .in("order_id", allOrderIds);

    const paidByOrderId = new Map<string, number>();
    for (const payment of payments ?? []) {
      paidByOrderId.set(payment.order_id, (paidByOrderId.get(payment.order_id) ?? 0) + payment.amount);
    }

    pendingToCollect = (allActiveOrders ?? []).reduce(
      (sum, order) => sum + (order.total - (paidByOrderId.get(order.id) ?? 0)),
      0,
    );
  }

  const { count: totalOrdersCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true });

  const { data: products, count: totalProductsCount } = await supabase
    .from("products")
    .select("id, name, stock, minimum_stock", { count: "exact" });

  const lowStockProducts: LowStockProduct[] = (products ?? [])
    .filter((product) => product.minimum_stock > 0 && product.stock <= product.minimum_stock)
    .map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      minimum_stock: product.minimum_stock,
    }));

  return {
    salesThisMonth,
    estimatedProfitThisMonth,
    pendingOrdersCount: pendingOrdersCount ?? 0,
    pendingToCollect,
    lowStockProducts,
    productsCount: totalProductsCount ?? 0,
    hasAnyOrders: (totalOrdersCount ?? 0) > 0,
    hasAnyProducts: (totalProductsCount ?? 0) > 0,
  };
}
