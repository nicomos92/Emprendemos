import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { Business, Customer, Quote } from "@/types/database";
import type { QuoteItemWithProduct } from "@/lib/actions/quotes";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("es-AR");
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#262626",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  logo: {
    width: 56,
    height: 56,
    marginBottom: 8,
    objectFit: "contain",
  },
  businessName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  muted: {
    color: "#737373",
    marginTop: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    color: "#737373",
    marginBottom: 4,
  },
  table: {
    marginTop: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 6,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
    paddingBottom: 6,
    fontWeight: "bold",
  },
  colProduct: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colSubtotal: { flex: 1.5, textAlign: "right" },
  totals: {
    marginTop: 12,
    alignSelf: "flex-end",
    width: 220,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  totalsLabel: { color: "#737373" },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#262626",
    fontSize: 12,
    fontWeight: "bold",
  },
});

interface QuotePdfProps {
  business: Business | null;
  customer: Customer;
  quote: Quote;
  items: QuoteItemWithProduct[];
}

export function QuotePdf({ business, customer, quote, items }: QuotePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {business?.logo_url && (
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image has no alt prop
              <Image src={business.logo_url} style={styles.logo} />
            )}
            <Text style={styles.businessName}>{business?.name ?? "Mi negocio"}</Text>
            {business?.phone && <Text style={styles.muted}>{business.phone}</Text>}
            {business?.email && <Text style={styles.muted}>{business.email}</Text>}
          </View>
          <View>
            <Text style={styles.title}>Presupuesto N° {quote.number ?? "-"}</Text>
            <Text style={styles.muted}>Fecha: {formatDate(quote.created_at)}</Text>
            {quote.valid_until && (
              <Text style={styles.muted}>Válido hasta: {formatDate(quote.valid_until)}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <Text>{customer.name}</Text>
          {customer.phone && <Text style={styles.muted}>{customer.phone}</Text>}
          {customer.email && <Text style={styles.muted}>{customer.email}</Text>}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.colProduct}>Producto</Text>
            <Text style={styles.colQty}>Cantidad</Text>
            <Text style={styles.colPrice}>Precio unit.</Text>
            <Text style={styles.colSubtotal}>Subtotal</Text>
          </View>
          {items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colProduct}>{item.product_name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.unit_price)}</Text>
              <Text style={styles.colSubtotal}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text>{formatCurrency(quote.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Descuento</Text>
            <Text>-{formatCurrency(quote.discount)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text>Total</Text>
            <Text>{formatCurrency(quote.total)}</Text>
          </View>
        </View>

        {quote.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <Text>{quote.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
