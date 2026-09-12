import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listCategories } from "@/lib/actions/products";
import { AppShell } from "@/components/layout/AppShell";
import { ProductForm } from "@/app/products/ProductForm";
import { DeleteProductButton } from "@/app/products/[id]/DeleteProductButton";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: ProductPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const { data: product } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

  if (!product) {
    notFound();
  }

  const categories = await listCategories();

  return (
    <AppShell>
      <div className="flex max-w-xl flex-col gap-4">
        <ProductForm categories={categories} product={product} heading="Editar producto" />
        <DeleteProductButton productId={product.id} productName={product.name} />
      </div>
    </AppShell>
  );
}
