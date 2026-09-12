import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listProducts } from "@/lib/actions/products";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/pricing";

export default async function ProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const products = await listProducts();

  return (
    <AppShell>
      <PageHeader
        title="Productos"
        description="Tus productos y sus precios."
        action={
          <Link href="/products/new">
            <Button>Agregar producto</Button>
          </Link>
        }
      />

      <div className="mt-6">
        {products.length === 0 ? (
          <EmptyState
            title="Acá van a aparecer tus productos."
            description="Agregá el primero y empecemos a ordenar tu negocio."
            action={
              <Link href="/products/new">
                <Button>Agregar producto</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const isLowStock = product.stock <= product.minimum_stock;
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex gap-3 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm transition-colors hover:border-primary-200"
                >
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 text-neutral-500">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs">Sin foto</span>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <p className="truncate text-sm font-medium text-neutral-700">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-sm text-neutral-500">
                        {formatCurrency(product.sale_price)}
                      </p>
                    </div>
                    <div>
                      <Badge variant={isLowStock ? "warning" : "neutral"}>
                        {isLowStock ? "Stock bajo" : `Stock: ${product.stock}`}
                      </Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
