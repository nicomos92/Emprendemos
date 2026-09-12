"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/auth/get-current-business-id";
import { quoteSchema } from "@/lib/validations/quote";
import type { Quote, QuoteItem, Customer, QuoteStatus } from "@/types/database";

type ActionResult<T extends object = object> = { error: string } | ({ success: true } & T);

function genericError(message = "Algo salió mal. Probá de nuevo en un momento.") {
  return { error: message } as const;
}

const QUOTE_STATUSES: QuoteStatus[] = ["draft", "sent", "accepted", "rejected"];

export interface QuoteWithCustomerName extends Quote {
  customer_name: string;
}

export async function listQuotes(): Promise<QuoteWithCustomerName[]> {
  const supabase = await createClient();
  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (!quotes || quotes.length === 0) return [];

  const customerIds = [...new Set(quotes.map((quote) => quote.customer_id))];
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .in("id", customerIds);

  const nameById = new Map((customers ?? []).map((customer) => [customer.id, customer.name]));

  return quotes.map((quote) => ({
    ...quote,
    customer_name: nameById.get(quote.customer_id) ?? "",
  }));
}

export interface QuoteItemWithProduct extends QuoteItem {
  product_name: string;
}

export interface QuoteDetails {
  quote: Quote;
  customer: Customer;
  items: QuoteItemWithProduct[];
}

export async function getQuote(id: string): Promise<QuoteDetails | null> {
  const supabase = await createClient();

  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle();
  if (!quote) return null;

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", quote.customer_id)
    .maybeSingle();
  if (!customer) return null;

  const { data: items } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", id);

  const productIds = [...new Set((items ?? []).map((item) => item.product_id))];
  let products: { id: string; name: string }[] = [];
  if (productIds.length > 0) {
    const { data } = await supabase.from("products").select("id, name").in("id", productIds);
    products = data ?? [];
  }
  const nameById = new Map(products.map((product) => [product.id, product.name]));

  const items_with_product: QuoteItemWithProduct[] = (items ?? []).map((item) => ({
    ...item,
    product_name: nameById.get(item.product_id) ?? "",
  }));

  return { quote, customer, items: items_with_product };
}

interface QuoteFormFields {
  customer_id: string;
  valid_until?: string;
  discount?: number;
  notes?: string;
  items: { product_id: string; quantity: number; unit_price: number }[];
}

export async function createQuote(
  input: QuoteFormFields,
): Promise<ActionResult<{ quote: Quote }>> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) {
    return genericError(parsed.error.issues[0]?.message);
  }

  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return genericError("Tu sesión expiró. Iniciá sesión de nuevo.");
  }

  const supabase = await createClient();
  const data = parsed.data;

  const itemsWithSubtotal = data.items.map((item) => ({
    ...item,
    subtotal: item.quantity * item.unit_price,
  }));
  const subtotal = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal - data.discount;

  const { data: existingQuotes } = await supabase
    .from("quotes")
    .select("number")
    .eq("business_id", businessId)
    .order("number", { ascending: false })
    .limit(1);

  const nextNumber = (existingQuotes?.[0]?.number ?? 0) + 1;

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      business_id: businessId,
      customer_id: data.customer_id,
      number: nextNumber,
      valid_until: data.valid_until || null,
      subtotal,
      discount: data.discount,
      total,
      notes: data.notes || null,
    })
    .select("*")
    .single();

  if (quoteError || !quote) {
    return genericError("No pudimos crear el presupuesto. Probá de nuevo en un momento.");
  }

  // Known MVP limitation: Supabase JS doesn't expose a multi-statement
  // transaction API, so the quote and its items are inserted sequentially.
  // If the items insert fails we delete the quote row right after to avoid
  // leaving an orphaned quote with no line items.
  const { error: itemsError } = await supabase.from("quote_items").insert(
    itemsWithSubtotal.map((item) => ({
      quote_id: quote.id,
      business_id: businessId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
    })),
  );

  if (itemsError) {
    await supabase.from("quotes").delete().eq("id", quote.id);
    return genericError("No pudimos guardar los productos del presupuesto. Probá de nuevo.");
  }

  revalidatePath("/quotes");
  return { success: true, quote };
}

export async function updateQuoteStatus(
  id: string,
  status: QuoteStatus,
): Promise<ActionResult<{ quote: Quote }>> {
  if (!QUOTE_STATUSES.includes(status)) {
    return genericError("Estado inválido.");
  }

  const supabase = await createClient();
  const { data: quote, error } = await supabase
    .from("quotes")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !quote) {
    return genericError("No pudimos actualizar el estado del presupuesto.");
  }

  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);
  return { success: true, quote };
}

export async function deleteQuote(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (!quote) {
    return genericError("No encontramos el presupuesto.");
  }

  if (quote.status !== "draft") {
    return genericError("Solo podés eliminar presupuestos en borrador.");
  }

  const { error } = await supabase.from("quotes").delete().eq("id", id);

  if (error) {
    return genericError("No pudimos eliminar el presupuesto. Probá de nuevo.");
  }

  revalidatePath("/quotes");
  return { success: true };
}
