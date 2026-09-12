import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listCategories } from "@/lib/actions/products";
import { AppShell } from "@/components/layout/AppShell";
import { ProductForm } from "@/app/products/ProductForm";

interface NewProductPageProps {
  searchParams: Promise<{ onboarding?: string }>;
}

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { onboarding } = await searchParams;
  const isOnboarding = onboarding === "1";
  const categories = await listCategories();

  return (
    <AppShell>
      <ProductForm
        categories={categories}
        heading={isOnboarding ? "Empecemos agregando tu primer producto" : "Agregar producto"}
        onboarding={isOnboarding}
      />
    </AppShell>
  );
}
