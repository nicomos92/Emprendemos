import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";

interface DashboardPageProps {
  searchParams: Promise<{ welcome?: string }>;
}

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
  let productCount = 0;

  if (profile?.business_id) {
    const { data: business } = await supabase
      .from("businesses")
      .select("name")
      .eq("id", profile.business_id)
      .maybeSingle();
    businessName = business?.name ?? businessName;

    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true });
    productCount = count ?? 0;
  }

  return (
    <AppShell>
      <PageHeader
        title={`¡Bienvenido a EmprendeMos!`}
        description={`Este es el panel de ${businessName}.`}
      />

      {welcome === "1" && (
        <div className="mt-4 rounded-xl border border-success-100 bg-success-100/40 p-4 text-sm text-success-700">
          ¡Tu negocio ya está listo! Ya podés seguir agregando productos y usar el resto de las
          herramientas.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Productos" value={String(productCount)} />
        <Link href="/products">
          <Button variant="secondary" className="w-full">
            Ver productos
          </Button>
        </Link>
      </div>
    </AppShell>
  );
}
