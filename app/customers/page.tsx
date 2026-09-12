import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listCustomersWithPending } from "@/lib/actions/customers";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/pricing";

export default async function CustomersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const customers = await listCustomersWithPending();

  return (
    <AppShell>
      <PageHeader
        title="Clientes"
        description="Tus clientes y sus datos de contacto."
        action={
          <Link href="/customers/new">
            <Button>Agregar cliente</Button>
          </Link>
        }
      />

      <div className="mt-6">
        {customers.length === 0 ? (
          <EmptyState
            title="Todavía no tenés clientes."
            description="Cuando hagas tu primera venta podés guardarlo acá."
            action={
              <Link href="/customers/new">
                <Button>Agregar cliente</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm transition-colors hover:border-primary-200"
              >
                <p className="truncate text-sm font-medium text-neutral-700">{customer.name}</p>
                <p className="text-sm text-neutral-500">{customer.phone || "Sin teléfono"}</p>
                {customer.pendingToCollect > 0 && (
                  <div>
                    <Badge variant="warning">
                      Pendiente: {formatCurrency(customer.pendingToCollect)}
                    </Badge>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
