import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { createClient } from "@/lib/supabase/server";
import { getQuote } from "@/lib/actions/quotes";
import { getCurrentBusiness } from "@/lib/actions/business";
import { QuotePdf } from "@/lib/pdf/QuotePdf";

// @react-pdf/renderer relies on Node APIs (fs, streams) that aren't
// available on the Edge runtime.
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const details = await getQuote(id);

  if (!details) {
    return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
  }

  const business = await getCurrentBusiness();

  const buffer = await renderToBuffer(
    createElement(QuotePdf, {
      business,
      customer: details.customer,
      quote: details.quote,
      items: details.items,
    }) as unknown as Parameters<typeof renderToBuffer>[0],
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="presupuesto-${details.quote.number ?? id}.pdf"`,
    },
  });
}
