"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CashMovementDrawer } from "@/app/cash/CashMovementDrawer";

export function RegisterMovementButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Registrar movimiento</Button>
      <CashMovementDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
