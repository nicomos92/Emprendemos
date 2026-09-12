"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-6">
      <ErrorState message="Algo salió mal. Probá de nuevo." onRetry={reset} />
    </div>
  );
}
