/**
 * Strips everything but digits from a phone number so it can be used in a
 * wa.me link (spaces, dashes, parens, leading +, etc. are all removed).
 */
export function normalizePhoneForWhatsApp(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function buildWhatsAppLink(phone: string): string {
  return `https://wa.me/${normalizePhoneForWhatsApp(phone)}`;
}
