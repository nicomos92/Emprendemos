import type { OrderStatus } from "@/types/database";

type BadgeVariant = "neutral" | "success" | "warning" | "danger";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Nuevo",
  confirmed: "Confirmado",
  preparing: "En preparación",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const ORDER_STATUS_VARIANTS: Record<OrderStatus, BadgeVariant> = {
  new: "neutral",
  confirmed: "warning",
  preparing: "warning",
  ready: "warning",
  delivered: "success",
  cancelled: "danger",
};

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "new",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
];
