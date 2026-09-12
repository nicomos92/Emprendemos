import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrder } from "@/lib/actions/orders";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/pricing";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from "@/lib/order-status";
import { OrderStatusActions } from "@/app/orders/[id]/OrderStatusActions";
import { RegisterPaymentButton } from "@/app/orders/[id]/RegisterPaymentButton";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const details = await getOrder(id);

  if (!details) {
    notFound();
  }

  const { order, customer, items, totalPaid, pendingToCollect } = details;

  return (
    <AppShell>
      <div className="flex max-w-2xl flex-col gap-4">
        <Card className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-neutral-700">Pedido</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Creado el {new Date(order.created_at).toLocaleDateString("es-AR")}
              </p>
              {order.quote_id && (
                <p className="text-sm text-neutral-500">
                  Viene del{" "}
                  <Link href={`/quotes/${order.quote_id}`} className="text-primary-600 hover:underline">
                    presupuesto
                  </Link>
                </p>
              )}
            </div>
            <Badge variant={ORDER_STATUS_VARIANTS[order.status]}>
              {ORDER_STATUS_LABELS[order.status]}
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
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-neutral-600">
              <span>Descuento</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold text-neutral-700">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase text-neutral-500">Notas</p>
              <p className="mt-1 text-sm text-neutral-700">{order.notes}</p>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-neutral-700">Cobro</h2>
          <div className="mt-3">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Total pagado</span>
              <span>{formatCurrency(totalPaid)}</span>
            </div>
            <div className="mt-1 flex justify-between text-base font-semibold text-neutral-700">
              <span>Pendiente de cobrar</span>
              <span>{formatCurrency(pendingToCollect)}</span>
            </div>
          </div>
          <div className="mt-4">
            <RegisterPaymentButton orderId={order.id} pendingToCollect={pendingToCollect} />
          </div>
        </Card>

        <Card>
          <OrderStatusActions orderId={order.id} status={order.status} />
        </Card>
      </div>
    </AppShell>
  );
}
