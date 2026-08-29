/**
 * Name a card type from its number, the way base did.
 *
 * Base ran cleave.js over the number field and wrote the result into a hidden
 * `cardType` input, which its route then looked up with
 * `PaymentMgr.getPaymentCard(...)`. The names below are base's own mapping
 * (components/cleave.js) and have to stay exactly these strings: they are the
 * IDs the platform knows the cards by, not labels.
 *
 * The prefixes are the standard issuer ranges cleave detects. Anything else
 * is "Unknown", which is what base sent too — and the server refuses it,
 * which is the correct place for that judgment.
 */
const PATTERNS: Array<[RegExp, string]> = [
  [/^4/, "Visa"],
  [/^(5[1-5]|2(2[2-9]|[3-6]|7[01]|720))/, "Master Card"],
  [/^3[47]/, "Amex"],
  [/^(6011|65|64[4-9]|622)/, "Discover"],
];

export function detectCardType(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, "");
  if (!digits) return "";

  for (const [pattern, name] of PATTERNS) {
    if (pattern.test(digits)) return name;
  }

  return "Unknown";
}
