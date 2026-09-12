"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { updateOrderStatus } from "@/lib/actions/orders";
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE } from "@/lib/order-status";
import type { OrderStatus } from "@/types/database";

interface OrderStatusActionsProps {
  orderId: string;
  status: OrderStatus;
}

export function OrderStatusActions({ orderId, status }: OrderStatusActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  async function changeStatus(nextStatus: OrderStatus) {
    setIsUpdating(true);
    setError(null);
    const result = await updateOrderStatus(orderId, nextStatus);
    setIsUpdating(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setCancelOpen(false);
    router.refresh();
  }

  if (status === "cancelled" || status === "delivered") {
    return null;
  }

  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(status);
  const nextStatus = ORDER_STATUS_SEQUENCE[currentIndex + 1];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        {nextStatus && (
          <Button className="w-full" loading={isUpdating} onClick={() => changeStatus(nextStatus)}>
            Marcar como {ORDER_STATUS_LABELS[nextStatus].toLowerCase()}
          </Button>
        )}
        <Button
          variant="secondary"
          className="w-full"
          disabled={isUpdating}
          onClick={() => setCancelOpen(true)}
        >
          Cancelar pedido
        </Button>
      </div>
      {error && <p className="text-sm text-danger-600">{error}</p>}

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => changeStatus("cancelled")}
        title="¿Cancelar este pedido?"
        description="El pedido va a quedar marcado como cancelado."
        confirmLabel="Cancelar pedido"
        cancelLabel="Volver"
        loading={isUpdating}
      />
    </div>
  );
}
