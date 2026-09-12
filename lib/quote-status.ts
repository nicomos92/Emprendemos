import type { QuoteStatus } from "@/types/database";

type BadgeVariant = "neutral" | "success" | "warning" | "danger";

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Borrador",
  sent: "Enviado",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

export const QUOTE_STATUS_VARIANTS: Record<QuoteStatus, BadgeVariant> = {
  draft: "neutral",
  sent: "warning",
  accepted: "success",
  rejected: "danger",
};
