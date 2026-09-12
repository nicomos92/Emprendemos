"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PaymentDrawer } from "@/app/orders/[id]/PaymentDrawer";

interface RegisterPaymentButtonProps {
  orderId: string;
  pendingToCollect: number;
}

export function RegisterPaymentButton({ orderId, pendingToCollect }: RegisterPaymentButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        className="w-full"
        disabled={pendingToCollect <= 0}
        onClick={() => setOpen(true)}
      >
        Registrar cobro
      </Button>
      {pendingToCollect <= 0 && (
        <p className="mt-1 text-xs text-neutral-500">Este pedido ya está cobrado.</p>
      )}

      <PaymentDrawer
        open={open}
        onClose={() => setOpen(false)}
        orderId={orderId}
        pendingToCollect={pendingToCollect}
      />
    </>
  );
}
