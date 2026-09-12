import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listOrders } from "@/lib/actions/orders";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/pricing";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from "@/lib/order-status";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const orders = await listOrders();

  return (
    <AppShell>
      <PageHeader
        title="Pedidos"
        description="Ventas confirmadas a tus clientes."
        action={
          <Link href="/orders/new">
            <Button>Registrar venta</Button>
          </Link>
        }
      />

      <div className="mt-6">
        {orders.length === 0 ? (
          <EmptyState
            title="Todavía no registraste ninguna venta."
            description="Registrá tu primer pedido para empezar a llevar el control."
            action={
              <Link href="/orders/new">
                <Button>Registrar venta</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm transition-colors hover:border-primary-200"
              >
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-neutral-700">
                    {order.customer_name}
                  </p>
                  <Badge variant={ORDER_STATUS_VARIANTS[order.status]}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-neutral-700">
                  {formatCurrency(order.total)}
                </p>
                {order.pendingToCollect > 0 && (
                  <Badge variant="warning" className="self-start">
                    Pendiente: {formatCurrency(order.pendingToCollect)}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
