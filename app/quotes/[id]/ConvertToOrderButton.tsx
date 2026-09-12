"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createOrderFromQuote } from "@/lib/actions/orders";

interface ConvertToOrderButtonProps {
  quoteId: string;
}

export function ConvertToOrderButton({ quoteId }: ConvertToOrderButtonProps) {
  const router = useRouter();
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConvert() {
    setIsConverting(true);
    setError(null);
    const result = await createOrderFromQuote(quoteId);
    setIsConverting(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    router.push(`/orders/${result.order.id}`);
  }

  return (
    <div>
      <Button variant="secondary" className="w-full" loading={isConverting} onClick={handleConvert}>
        Convertir en pedido
      </Button>
      {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
    </div>
  );
}
