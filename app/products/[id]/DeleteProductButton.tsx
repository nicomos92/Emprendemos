"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteProduct } from "@/lib/actions/products";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsDeleting(true);
    const result = await deleteProduct(productId);
    setIsDeleting(false);

    if ("error" in result) {
      setError(result.error);
      setOpen(false);
      return;
    }

    router.push("/products");
    router.refresh();
  }

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Eliminar producto
      </Button>
      {error && <p className="text-sm text-danger-600">{error}</p>}
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="¿Eliminar este producto?"
        description={`"${productName}" se va a eliminar y no vas a poder recuperarlo.`}
        loading={isDeleting}
      />
    </>
  );
}
