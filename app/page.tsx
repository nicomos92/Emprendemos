import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Inicio"
          description="Un resumen rápido de tu negocio."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Ventas de hoy" value="$0" sublabel="Sin movimientos aún" />
          <StatCard label="Productos activos" value="0" sublabel="Agregá tu primer producto" />
          <StatCard label="Clientes" value="0" sublabel="Sin clientes cargados" />
        </div>

        <EmptyState
          title="Todavía no hay ventas"
          description="Cuando registres tu primera venta, la vas a ver acá."
          action={<Button>Registrar venta</Button>}
        />
      </div>
    </AppShell>
  );
}
