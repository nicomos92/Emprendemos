import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listCustomers } from "@/lib/actions/customers";
import { listProducts } from "@/lib/actions/products";
import { AppShell } from "@/components/layout/AppShell";
import { QuoteForm } from "@/app/quotes/QuoteForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default async function NewQuotePage() {
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
          title="Necesitás al menos un cliente para crear un presupuesto."
          description="Agregá tu primer cliente y volvé para armarlo."
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
      <QuoteForm customers={customers} products={products} />
    </AppShell>
  );
}
