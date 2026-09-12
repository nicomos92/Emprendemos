"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface CatalogLinkCardProps {
  catalogUrl: string;
}

export function CatalogLinkCard({ catalogUrl }: CatalogLinkCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(catalogUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail (permissions, insecure context); the URL
      // is still visible on screen so the owner can copy it manually.
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-neutral-700">Tu catálogo público</h3>
      <p className="mt-1 truncate text-sm text-neutral-500">{catalogUrl}</p>
      <Button variant="secondary" size="sm" className="mt-3" onClick={handleCopy}>
        {copied ? "¡Copiado!" : "Copiar link"}
      </Button>
    </div>
  );
}
