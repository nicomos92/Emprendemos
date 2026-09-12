import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listQuotes } from "@/lib/actions/quotes";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/pricing";
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_VARIANTS } from "@/lib/quote-status";

export default async function QuotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const quotes = await listQuotes();

  return (
    <AppShell>
      <PageHeader
        title="Presupuestos"
        description="Presupuestos que armaste para tus clientes."
        action={
          <Link href="/quotes/new">
            <Button>Crear presupuesto</Button>
          </Link>
        }
      />

      <div className="mt-6">
        {quotes.length === 0 ? (
          <EmptyState
            title="Todavía no creaste ningún presupuesto."
            description="Armá uno para mandárselo a tu cliente."
            action={
              <Link href="/quotes/new">
                <Button>Crear presupuesto</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/quotes/${quote.id}`}
                className="flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm transition-colors hover:border-primary-200"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-700">
                    Presupuesto N° {quote.number ?? "-"}
                  </p>
                  <Badge variant={QUOTE_STATUS_VARIANTS[quote.status]}>
                    {QUOTE_STATUS_LABELS[quote.status]}
                  </Badge>
                </div>
                <p className="truncate text-sm text-neutral-500">{quote.customer_name}</p>
                <p className="text-sm font-semibold text-neutral-700">
                  {formatCurrency(quote.total)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
