"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { updateQuoteStatus } from "@/lib/actions/quotes";
import type { QuoteStatus } from "@/types/database";

interface QuoteStatusActionsProps {
  quoteId: string;
  status: QuoteStatus;
}

export function QuoteStatusActions({ quoteId, status }: QuoteStatusActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(nextStatus: QuoteStatus) {
    setIsUpdating(true);
    setError(null);
    const result = await updateQuoteStatus(quoteId, nextStatus);
    setIsUpdating(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  if (status === "draft") {
    return (
      <div className="flex flex-col gap-2">
        <Button className="w-full" loading={isUpdating} onClick={() => changeStatus("sent")}>
          Marcar como enviado
        </Button>
        {error && <p className="text-sm text-danger-600">{error}</p>}
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="w-full" loading={isUpdating} onClick={() => changeStatus("accepted")}>
            Marcar como aceptado
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            loading={isUpdating}
            onClick={() => changeStatus("rejected")}
          >
            Marcar como rechazado
          </Button>
        </div>
        {error && <p className="text-sm text-danger-600">{error}</p>}
      </div>
    );
  }

  return null;
}
