"use client";

import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative w-full rounded-t-xl bg-white p-6 shadow-md",
          "max-h-[85vh] overflow-y-auto",
          "md:h-full md:max-h-none md:w-96 md:rounded-t-none md:rounded-l-xl",
        )}
      >
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-neutral-700">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
