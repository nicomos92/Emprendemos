import { createClient } from "@/lib/supabase/server";
import type { Business, Category, Product } from "@/types/database";

export interface CatalogCategoryGroup {
  category: Category | null;
  products: Product[];
}

export interface PublicCatalog {
  business: Business;
  groups: CatalogCategoryGroup[];
}

export type PublicCatalogResult = { notFound: true } | { notFound: false; catalog: PublicCatalog };

/**
 * Public, unauthenticated catalog lookup by slug. Runs on the regular anon
 * Supabase client and relies entirely on the anon-read RLS policies added
 * in supabase/migrations/0004_public_catalog.sql — no service role key, no
 * auth bypass. Only reads businesses/categories/products; never touches
 * customers/quotes/orders/payments/cash_movements.
 */
export async function getPublicCatalog(slug: string): Promise<PublicCatalogResult> {
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!business) {
    return { notFound: true };
  }

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("business_id", business.id)
      .order("name"),
    supabase
      .from("products")
      .select("*")
      .eq("business_id", business.id)
      .order("name"),
  ]);

  const groups: CatalogCategoryGroup[] = [];
  const productsByCategory = new Map<string, Product[]>();
  const uncategorized: Product[] = [];

  for (const product of products ?? []) {
    if (product.category_id) {
      const existing = productsByCategory.get(product.category_id) ?? [];
      existing.push(product);
      productsByCategory.set(product.category_id, existing);
    } else {
      uncategorized.push(product);
    }
  }

  for (const category of categories ?? []) {
    const categoryProducts = productsByCategory.get(category.id) ?? [];
    if (categoryProducts.length > 0) {
      groups.push({ category, products: categoryProducts });
    }
  }

  if (uncategorized.length > 0) {
    groups.push({ category: null, products: uncategorized });
  }

  return { notFound: false, catalog: { business, groups } };
}
