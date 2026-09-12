import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listCustomers } from "@/lib/actions/customers";
import { listProducts } from "@/lib/actions/products";
import { AppShell } from "@/components/layout/AppShell";
import { OrderForm } from "@/app/orders/OrderForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default async function NewOrderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [customers, products] = await Promise.all([listCustomers(), listProducts()]);

  if (customers.length === 0) {
    return (
      <AppShell>
        <EmptyState
          title="Necesitás al menos un cliente para registrar una venta."
          description="Agregá tu primer cliente y volvé para registrarla."
          action={
            <Link href="/customers/new">
              <Button>Agregar cliente</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <OrderForm customers={customers} products={products} />
    </AppShell>
  );
}
