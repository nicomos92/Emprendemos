"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteCustomer } from "@/lib/actions/customers";

interface DeleteCustomerButtonProps {
  customerId: string;
  customerName: string;
}

export function DeleteCustomerButton({ customerId, customerName }: DeleteCustomerButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsDeleting(true);
    const result = await deleteCustomer(customerId);
    setIsDeleting(false);

    if ("error" in result) {
      setError(result.error);
      setOpen(false);
      return;
    }

    router.push("/customers");
    router.refresh();
  }

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Eliminar cliente
      </Button>
      {error && <p className="text-sm text-danger-600">{error}</p>}
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="¿Eliminar este cliente?"
        description={`"${customerName}" se va a eliminar y no vas a poder recuperarlo.`}
        loading={isDeleting}
      />
    </>
  );
}
