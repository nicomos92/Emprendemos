import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getDashboardSummary } from "@/lib/actions/dashboard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { CatalogLinkCard } from "@/components/CatalogLinkCard";
import { formatCurrency } from "@/lib/pricing";

interface DashboardPageProps {
  searchParams: Promise<{ welcome?: string }>;
}

const quickLinks = [
  { href: "/products", label: "Productos" },
  { href: "/orders", label: "Ventas" },
  { href: "/customers", label: "Clientes" },
  { href: "/cash", label: "Caja" },
];

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { welcome } = await searchParams;

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let businessName = "tu negocio";
  let catalogUrl: string | null = null;
  const summary = await getDashboardSummary();

  if (profile?.business_id) {
    const { data: business } = await supabase
      .from("businesses")
      .select("name, slug")
      .eq("id", profile.business_id)
      .maybeSingle();
    businessName = business?.name ?? businessName;

    if (business?.slug) {
      const headersList = await headers();
      const origin = headersList.get("origin");
      const host = headersList.get("host");
      const protocol = headersList.get("x-forwarded-proto") ?? "https";
      const base = origin ?? (host ? `${protocol}://${host}` : "");
      catalogUrl = `${base}/catalogo/${business.slug}`;
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="¡Bienvenido a EmprendeMos!"
        description={`Este es el panel de ${businessName}.`}
      />

      {catalogUrl && <CatalogLinkCard catalogUrl={catalogUrl} />}

      {welcome === "1" && (
        <div className="mt-4 rounded-xl border border-success-100 bg-success-100/40 p-4 text-sm text-success-700">
          ¡Tu negocio ya está listo! Ya podés seguir agregando productos y usar el resto de las
          herramientas.
        </div>
      )}

      {!summary.hasAnyOrders ? (
        <>
          <EmptyState
            className="mt-6"
            title="No hay ventas todavía."
            description="Cuando registres tu primera venta, vas a verla acá."
            action={
              <Link href="/orders">
                <Button variant="secondary">Registrar una venta</Button>
              </Link>
            }
          />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Productos" value={String(summary.productsCount)} />
          </div>
        </>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Ventas del mes" value={`Vendiste ${formatCurrency(summary.salesThisMonth)} este mes.`} />
          <StatCard
            label="Ganancia estimada"
            value={`Ganaste aproximadamente ${formatCurrency(summary.estimatedProfitThisMonth)}.`}
          />
          {summary.pendingToCollect > 0 && (
            <StatCard
              label="Pendiente de cobrar"
              value={`Tenés ${formatCurrency(summary.pendingToCollect)} pendientes de cobrar.`}
            />
          )}
          {summary.pendingOrdersCount > 0 && (
            <StatCard
              label="Pedidos en curso"
              value={`Tenés ${summary.pendingOrdersCount} pedidos en curso.`}
            />
          )}
        </div>
      )}

      {summary.lowStockProducts.length > 0 && (
        <div className="mt-6 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-700">Productos con poco stock</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {summary.lowStockProducts.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/products/${product.id}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-neutral-50"
                >
                  <span className="text-sm text-neutral-700">{product.name}</span>
                  <Badge variant="warning">
                    {product.stock} de {product.minimum_stock} mínimo
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Button variant="secondary" className="w-full">
              {link.label}
            </Button>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
