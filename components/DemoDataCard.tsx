"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { loadDemoData } from "@/lib/actions/demo-data";

export function DemoDataCard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    const result = await loadDemoData();
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <div className="mt-4 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-neutral-700">¿Querés ver un ejemplo primero?</h3>
      <p className="mt-1 text-sm text-neutral-500">
        ¿Querés ver cómo funciona antes de cargar tus datos reales? Cargamos unos productos y
        ventas de ejemplo que después podés borrar.
      </p>
      {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}
      <Button variant="secondary" size="sm" className="mt-3" onClick={() => setOpen(true)}>
        Cargar datos de ejemplo
      </Button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Cargar datos de ejemplo"
        description="Vamos a crear productos, clientes, presupuestos y ventas de ejemplo en tu negocio. Todos van a decir '(ejemplo)' en el nombre, así los distinguís fácil, y podés borrarlos cuando quieras."
        confirmLabel="Cargar ejemplo"
        cancelLabel="Cancelar"
        loading={loading}
      />
    </div>
  );
}
