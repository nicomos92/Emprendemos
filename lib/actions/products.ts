"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/auth/get-current-business-id";
import { productSchema, categorySchema, NEW_CATEGORY_VALUE } from "@/lib/validations/product";
import { calculateTotalCost, calculateSuggestedPrice } from "@/lib/pricing";
import type { Product, Category } from "@/types/database";

type ActionResult<T extends object = object> = { error: string } | ({ success: true } & T);

function genericError(message = "Algo salió mal. Probá de nuevo en un momento.") {
  return { error: message } as const;
}

export async function listProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function listCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return data ?? [];
}

export async function createCategory(name: string): Promise<ActionResult<{ category: Category }>> {
  const parsed = categorySchema.safeParse({ name });
  if (!parsed.success) {
    return genericError(parsed.error.issues[0]?.message);
  }

  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return genericError("Tu sesión expiró. Iniciá sesión de nuevo.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ business_id: businessId, name: parsed.data.name })
    .select("*")
    .single();

  if (error || !data) {
    return genericError("No pudimos crear la categoría. Probá de nuevo.");
  }

  revalidatePath("/products");
  return { success: true, category: data };
}

interface ProductFormFields {
  name: string;
  description?: string;
  category_id?: string;
  new_category_name?: string;
  material_cost?: number;
  labor_cost?: number;
  other_cost?: number;
  desired_margin?: number;
  sale_price?: number;
  stock?: number;
  minimum_stock?: number;
}

export async function createProduct(
  input: ProductFormFields,
): Promise<ActionResult<{ product: Product }>> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return genericError(parsed.error.issues[0]?.message);
  }

  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return genericError("Tu sesión expiró. Iniciá sesión de nuevo.");
  }

  const supabase = await createClient();
  const data = parsed.data;

  let categoryId =
    data.category_id && data.category_id !== "" && data.category_id !== NEW_CATEGORY_VALUE
      ? data.category_id
      : null;
  if (!categoryId && data.new_category_name?.trim()) {
    const { data: newCategory, error: categoryError } = await supabase
      .from("categories")
      .insert({ business_id: businessId, name: data.new_category_name.trim() })
      .select("id")
      .single();

    if (categoryError || !newCategory) {
      return genericError("No pudimos crear la categoría. Probá de nuevo.");
    }
    categoryId = newCategory.id;
  }

  const totalCost = calculateTotalCost({
    materialCost: data.material_cost,
    laborCost: data.labor_cost,
    otherCost: data.other_cost,
  });
  const suggestedPrice = calculateSuggestedPrice({
    totalCost,
    desiredMarginPercent: data.desired_margin,
  });
  const salePrice = data.sale_price ?? suggestedPrice;

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      business_id: businessId,
      category_id: categoryId,
      name: data.name,
      description: data.description || null,
      material_cost: data.material_cost,
      labor_cost: data.labor_cost,
      other_cost: data.other_cost,
      total_cost: totalCost,
      desired_margin: data.desired_margin,
      suggested_price: suggestedPrice,
      sale_price: salePrice,
      stock: data.stock,
      minimum_stock: data.minimum_stock,
    })
    .select("*")
    .single();

  if (error || !product) {
    return genericError("No pudimos crear el producto. Probá de nuevo en un momento.");
  }

  revalidatePath("/products");
  return { success: true, product };
}

export async function updateProduct(
  id: string,
  input: ProductFormFields,
): Promise<ActionResult<{ product: Product }>> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return genericError(parsed.error.issues[0]?.message);
  }

  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return genericError("Tu sesión expiró. Iniciá sesión de nuevo.");
  }

  const supabase = await createClient();
  const data = parsed.data;

  let categoryId =
    data.category_id && data.category_id !== "" && data.category_id !== NEW_CATEGORY_VALUE
      ? data.category_id
      : null;
  if (!categoryId && data.new_category_name?.trim()) {
    const { data: newCategory, error: categoryError } = await supabase
      .from("categories")
      .insert({ business_id: businessId, name: data.new_category_name.trim() })
      .select("id")
      .single();

    if (categoryError || !newCategory) {
      return genericError("No pudimos crear la categoría. Probá de nuevo.");
    }
    categoryId = newCategory.id;
  }

  const totalCost = calculateTotalCost({
    materialCost: data.material_cost,
    laborCost: data.labor_cost,
    otherCost: data.other_cost,
  });
  const suggestedPrice = calculateSuggestedPrice({
    totalCost,
    desiredMarginPercent: data.desired_margin,
  });
  const salePrice = data.sale_price ?? suggestedPrice;

  const { data: product, error } = await supabase
    .from("products")
    .update({
      category_id: categoryId,
      name: data.name,
      description: data.description || null,
      material_cost: data.material_cost,
      labor_cost: data.labor_cost,
      other_cost: data.other_cost,
      total_cost: totalCost,
      desired_margin: data.desired_margin,
      suggested_price: suggestedPrice,
      sale_price: salePrice,
      stock: data.stock,
      minimum_stock: data.minimum_stock,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !product) {
    return genericError("No pudimos guardar los cambios. Probá de nuevo en un momento.");
  }

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  return { success: true, product };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return genericError("No pudimos eliminar el producto. Probá de nuevo.");
  }

  revalidatePath("/products");
  return { success: true };
}
