interface CostInput {
  materialCost: number;
  laborCost: number;
  otherCost: number;
}

export function calculateTotalCost({ materialCost, laborCost, otherCost }: CostInput): number {
  return materialCost + laborCost + otherCost;
}

interface SuggestedPriceInput {
  totalCost: number;
  desiredMarginPercent: number;
}

export function calculateSuggestedPrice({
  totalCost,
  desiredMarginPercent,
}: SuggestedPriceInput): number {
  // A margin of 100% or more makes the markup formula divide by zero or go
  // negative. This is just a fallback so the UI never shows garbage — it is
  // not a claim about what the "correct" price should be at that margin.
  if (desiredMarginPercent >= 100) {
    return totalCost * 2;
  }
  return totalCost / (1 - desiredMarginPercent / 100);
}

interface ProfitInput {
  salePrice: number;
  totalCost: number;
}

export function calculateProfit({ salePrice, totalCost }: ProfitInput): number {
  return salePrice - totalCost;
}

export function calculateMarginPercent({ salePrice, totalCost }: ProfitInput): number {
  if (salePrice === 0) return 0;
  return ((salePrice - totalCost) / salePrice) * 100;
}

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}
