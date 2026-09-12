import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCustomerWithHistory } from "@/lib/actions/customers";
import { AppShell } from "@/components/layout/AppShell";
import { CustomerForm } from "@/app/customers/CustomerForm";
import { DeleteCustomerButton } from "@/app/customers/[id]/DeleteCustomerButton";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency } from "@/lib/pricing";

interface CustomerPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const history = await getCustomerWithHistory(id);

  if (!history) {
    notFound();
  }

  const { customer, quotes, orders, totalPurchased, pendingToCollect } = history;
  const hasHistory = quotes.length > 0 || orders.length > 0;

  return (
    <AppShell>
      <div className="flex max-w-xl flex-col gap-4">
        <CustomerForm customer={customer} heading="Editar cliente" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="Total comprado" value={formatCurrency(totalPurchased)} />
          <StatCard
            label="Pendiente de cobrar"
            value={formatCurrency(pendingToCollect)}
            trend={pendingToCollect > 0 ? "down" : "neutral"}
          />
        </div>

        <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-700">Presupuestos y pedidos</h2>
          {!hasHistory ? (
            <p className="mt-2 text-sm text-neutral-500">
              Todavía no tiene presupuestos ni pedidos.
            </p>
          ) : (
            <div className="mt-3 flex flex-col gap-4">
              {quotes.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase text-neutral-500">Presupuestos</p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {quotes.map((quote) => (
                      <li key={quote.id} className="text-sm text-neutral-700">
                        {formatCurrency(quote.total)} — {quote.status}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {orders.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase text-neutral-500">Pedidos</p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {orders.map((order) => (
                      <li key={order.id} className="text-sm text-neutral-700">
                        {formatCurrency(order.total)} — {order.status}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DeleteCustomerButton customerId={customer.id} customerName={customer.name} />
      </div>
    </AppShell>
  );
}
