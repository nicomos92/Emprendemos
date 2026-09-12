import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listCashMovements, getCashSummary } from "@/lib/actions/cash";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { RegisterMovementButton } from "@/app/cash/RegisterMovementButton";
import { formatCurrency } from "@/lib/pricing";

export default async function CashPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [movements, summary] = await Promise.all([listCashMovements(), getCashSummary()]);

  return (
    <AppShell>
      <PageHeader
        title="Caja"
        description="Lo que entró y salió este mes."
        action={<RegisterMovementButton />}
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Entró" value={formatCurrency(summary.totalIn)} trend="up" />
        <StatCard label="Salió" value={formatCurrency(summary.totalOut)} trend="down" />
        <StatCard
          label="Resultado"
          value={formatCurrency(summary.balance)}
          trend={summary.balance >= 0 ? "up" : "down"}
        />
      </div>

      <div className="mt-6">
        {movements.length === 0 ? (
          <EmptyState
            title="Todavía no hay movimientos este mes."
            description="Los cobros que registres en tus pedidos van a aparecer acá solos. También podés cargar gastos a mano."
            action={<RegisterMovementButton />}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {movements.map((movement) => {
              const isIncome = movement.type === "income";
              const isAutomatic = movement.reference_type === "payment";

              return (
                <div
                  key={movement.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-neutral-700">
                        {movement.description || "Sin descripción"}
                      </p>
                      <Badge variant={isAutomatic ? "neutral" : "warning"}>
                        {isAutomatic ? "Cobro de venta" : "Manual"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      {new Date(`${movement.movement_date}T00:00:00`).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <p
                    className={
                      isIncome
                        ? "shrink-0 text-base font-semibold text-success-600"
                        : "shrink-0 text-base font-semibold text-danger-600"
                    }
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(movement.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
