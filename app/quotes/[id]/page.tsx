import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getQuote } from "@/lib/actions/quotes";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/pricing";
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_VARIANTS } from "@/lib/quote-status";
import { QuoteStatusActions } from "@/app/quotes/[id]/QuoteStatusActions";
import { DeleteQuoteButton } from "@/app/quotes/[id]/DeleteQuoteButton";

interface QuotePageProps {
  params: Promise<{ id: string }>;
}

export default async function QuoteDetailPage({ params }: QuotePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const details = await getQuote(id);

  if (!details) {
    notFound();
  }

  const { quote, customer, items } = details;

  return (
    <AppShell>
      <div className="flex max-w-2xl flex-col gap-4">
        <Card className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-neutral-700">
                Presupuesto N° {quote.number ?? "-"}
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Creado el {new Date(quote.created_at).toLocaleDateString("es-AR")}
              </p>
              {quote.valid_until && (
                <p className="text-sm text-neutral-500">
                  Válido hasta {new Date(quote.valid_until).toLocaleDateString("es-AR")}
                </p>
              )}
            </div>
            <Badge variant={QUOTE_STATUS_VARIANTS[quote.status]}>
              {QUOTE_STATUS_LABELS[quote.status]}
            </Badge>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-neutral-500">Cliente</p>
            <p className="text-sm text-neutral-700">{customer.name}</p>
            {customer.phone && <p className="text-sm text-neutral-500">{customer.phone}</p>}
            {customer.email && <p className="text-sm text-neutral-500">{customer.email}</p>}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-neutral-700">Productos</h2>

          <div className="mt-3 hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left text-neutral-500">
                  <th className="py-2">Producto</th>
                  <th className="py-2">Cantidad</th>
                  <th className="py-2">Precio unitario</th>
                  <th className="py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-50">
                    <td className="py-2 text-neutral-700">{item.product_name}</td>
                    <td className="py-2 text-neutral-700">{item.quantity}</td>
                    <td className="py-2 text-neutral-700">{formatCurrency(item.unit_price)}</td>
                    <td className="py-2 text-right text-neutral-700">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:hidden">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-neutral-100 p-3">
                <p className="text-sm font-medium text-neutral-700">{item.product_name}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {item.quantity} x {formatCurrency(item.unit_price)}
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-700">
                  {formatCurrency(item.subtotal)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-neutral-100 pt-4">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Subtotal</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-neutral-600">
              <span>Descuento</span>
              <span>-{formatCurrency(quote.discount)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold text-neutral-700">
              <span>Total</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>

          {quote.notes && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase text-neutral-500">Notas</p>
              <p className="mt-1 text-sm text-neutral-700">{quote.notes}</p>
            </div>
          )}
        </Card>

        <Card className="flex flex-col gap-3">
          <QuoteStatusActions quoteId={quote.id} status={quote.status} />

          <a href={`/quotes/${quote.id}/pdf`} target="_blank" rel="noreferrer">
            <Button variant="secondary" className="w-full">
              Descargar PDF
            </Button>
          </a>

          {quote.status === "accepted" && (
            <div>
              <Button
                variant="secondary"
                className="w-full"
                disabled
                title="Disponible próximamente"
              >
                Convertir en pedido
              </Button>
              <p className="mt-1 text-xs text-neutral-500">Disponible próximamente.</p>
            </div>
          )}
        </Card>

        {quote.status === "draft" && (
          <DeleteQuoteButton quoteId={quote.id} quoteNumber={quote.number} />
        )}
      </div>
    </AppShell>
  );
}
