"use server";

// Demo data marking approach: every demo record's visible name carries a
// plain-language "(ejemplo)" suffix (e.g. "María López (ejemplo)"). This
// keeps demo data honestly labeled everywhere it appears — lists, PDFs,
// dashboard cards — without touching the `notes` column (which stays free
// for the merchant's own text) and without an ugly all-caps "[DEMO]" tag.
// Records are created by calling the same server actions the real UI uses
// (createCategory, createProduct, createCustomer, createQuote,
// createOrderFromQuote, createDirectOrder, createPayment, and the status
// updaters), so every insert goes through the exact same validation,
// business_id scoping, and RLS-compatible shape as user-entered data.
//
// Known limitation: this action always inserts a fresh batch. It does not
// check whether demo data (or any data) already exists, so calling it more
// than once creates duplicates. That is an accepted MVP tradeoff — the
// merchant can delete demo records the same way they delete any other
// record.

import { revalidatePath } from "next/cache";
import { getCurrentBusinessId } from "@/lib/auth/get-current-business-id";
import { createCategory, createProduct } from "@/lib/actions/products";
import { createCustomer } from "@/lib/actions/customers";
import { createQuote, updateQuoteStatus } from "@/lib/actions/quotes";
import { createOrderFromQuote, createDirectOrder, updateOrderStatus } from "@/lib/actions/orders";
import { createPayment } from "@/lib/actions/payments";

type ActionResult<T extends object = object> = { error: string } | ({ success: true } & T);

function genericError(message = "No pudimos cargar los datos de ejemplo. Probá de nuevo.") {
  return { error: message } as const;
}

export interface DemoDataCount {
  categories: number;
  products: number;
  customers: number;
  quotes: number;
  orders: number;
  payments: number;
}

export async function loadDemoData(): Promise<ActionResult<{ count: DemoDataCount }>> {
  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return genericError("Tu sesión expiró. Iniciá sesión de nuevo.");
  }

  const count: DemoDataCount = {
    categories: 0,
    products: 0,
    customers: 0,
    quotes: 0,
    orders: 0,
    payments: 0,
  };

  const categoryTortas = await createCategory("Tortas (ejemplo)");
  if ("error" in categoryTortas) return genericError();
  count.categories++;

  const categoryPanaderia = await createCategory("Panadería (ejemplo)");
  if ("error" in categoryPanaderia) return genericError();
  count.categories++;

  const tortaChocolate = await createProduct({
    name: "Torta de chocolate (ejemplo)",
    description: "Bizcochuelo de chocolate con ganache y dulce de leche.",
    category_id: categoryTortas.category.id,
    material_cost: 3500,
    labor_cost: 2000,
    other_cost: 500,
    desired_margin: 40,
    stock: 5,
    minimum_stock: 2,
  });
  if ("error" in tortaChocolate) return genericError();
  count.products++;

  const tortaVainilla = await createProduct({
    name: "Torta de vainilla (ejemplo)",
    description: "Bizcochuelo de vainilla con crema y frutas de estación.",
    category_id: categoryTortas.category.id,
    material_cost: 3200,
    labor_cost: 2000,
    other_cost: 400,
    desired_margin: 40,
    stock: 4,
    minimum_stock: 2,
  });
  if ("error" in tortaVainilla) return genericError();
  count.products++;

  const docenaFacturas = await createProduct({
    name: "Docena de facturas (ejemplo)",
    description: "Media docena de medialunas y media docena de vigilantes.",
    category_id: categoryPanaderia.category.id,
    material_cost: 900,
    labor_cost: 600,
    other_cost: 100,
    desired_margin: 50,
    stock: 20,
    minimum_stock: 5,
  });
  if ("error" in docenaFacturas) return genericError();
  count.products++;

  // Intentionally at (not below) minimum stock, so the dashboard's low-stock
  // warning has something to show right after loading the demo data.
  const panCasero = await createProduct({
    name: "Pan casero por kilo (ejemplo)",
    description: "Pan casero de campo horneado a leña.",
    category_id: categoryPanaderia.category.id,
    material_cost: 600,
    labor_cost: 400,
    other_cost: 100,
    desired_margin: 35,
    stock: 2,
    minimum_stock: 5,
  });
  if ("error" in panCasero) return genericError();
  count.products++;

  const comboCumpleanos = await createProduct({
    name: "Combo para cumpleaños (ejemplo)",
    description: "Torta más docena de facturas para eventos.",
    material_cost: 4400,
    labor_cost: 2600,
    other_cost: 600,
    desired_margin: 45,
    stock: 3,
    minimum_stock: 1,
  });
  if ("error" in comboCumpleanos) return genericError();
  count.products++;

  const mariaLopez = await createCustomer({
    name: "María López (ejemplo)",
    phone: "+54 11 5555-1111",
    email: "maria.lopez.ejemplo@example.com",
    address: "Av. Rivadavia 1234",
  });
  if ("error" in mariaLopez) return genericError();
  count.customers++;

  const juanPerez = await createCustomer({
    name: "Juan Pérez (ejemplo)",
    phone: "+54 11 5555-2222",
    email: "juan.perez.ejemplo@example.com",
    address: "Calle Falsa 456",
  });
  if ("error" in juanPerez) return genericError();
  count.customers++;

  const sofiaGomez = await createCustomer({
    name: "Sofía Gómez (ejemplo)",
    phone: "+54 11 5555-3333",
    email: "sofia.gomez.ejemplo@example.com",
    address: "Mitre 789",
  });
  if ("error" in sofiaGomez) return genericError();
  count.customers++;

  // Quote 1: stays in draft, so the "presupuestos" flow shows an unsent quote.
  const draftQuote = await createQuote({
    customer_id: mariaLopez.customer.id,
    notes: "Torta para cumpleaños de 15",
    items: [
      {
        product_id: tortaChocolate.product.id,
        quantity: 1,
        unit_price: tortaChocolate.product.sale_price,
      },
    ],
  });
  if ("error" in draftQuote) return genericError();
  count.quotes++;

  // Quote 2: accepted and converted into an order, so both quote flows show.
  const acceptedQuote = await createQuote({
    customer_id: juanPerez.customer.id,
    notes: "Facturas para reunión de oficina",
    items: [
      {
        product_id: docenaFacturas.product.id,
        quantity: 1,
        unit_price: docenaFacturas.product.sale_price,
      },
    ],
  });
  if ("error" in acceptedQuote) return genericError();
  count.quotes++;

  const acceptedQuoteUpdate = await updateQuoteStatus(acceptedQuote.quote.id, "accepted");
  if ("error" in acceptedQuoteUpdate) return genericError();

  const orderFromQuote = await createOrderFromQuote(acceptedQuote.quote.id);
  if ("error" in orderFromQuote) return genericError();
  count.orders++;

  // Direct order, already delivered, with a partial payment registered.
  const deliveredOrder = await createDirectOrder({
    customer_id: sofiaGomez.customer.id,
    notes: "Entrega el sábado a las 15hs",
    items: [
      {
        product_id: panCasero.product.id,
        quantity: 2,
        unit_price: panCasero.product.sale_price,
      },
      {
        product_id: comboCumpleanos.product.id,
        quantity: 1,
        unit_price: comboCumpleanos.product.sale_price,
      },
    ],
  });
  if ("error" in deliveredOrder) return genericError();
  count.orders++;

  const deliveredOrderUpdate = await updateOrderStatus(deliveredOrder.order.id, "delivered");
  if ("error" in deliveredOrderUpdate) return genericError();

  // Direct order still fresh ("new"), left unpaid so pending-to-collect
  // shows something after loading.
  const newOrder = await createDirectOrder({
    customer_id: mariaLopez.customer.id,
    items: [
      {
        product_id: tortaVainilla.product.id,
        quantity: 1,
        unit_price: tortaVainilla.product.sale_price,
      },
    ],
  });
  if ("error" in newOrder) return genericError();
  count.orders++;

  const partialPayment = await createPayment({
    order_id: deliveredOrder.order.id,
    amount: Math.round(deliveredOrder.order.total / 2),
    payment_method: "transfer",
    notes: "Seña del 50%",
  });
  if ("error" in partialPayment) return genericError();
  count.payments++;

  const fullPayment = await createPayment({
    order_id: orderFromQuote.order.id,
    amount: orderFromQuote.order.total,
    payment_method: "cash",
  });
  if ("error" in fullPayment) return genericError();
  count.payments++;

  revalidatePath("/dashboard");

  return { success: true, count };
}
