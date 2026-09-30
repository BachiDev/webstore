// src/lib/format.ts — locale-aware formatting helpers.

const DEFAULT_LOCALE = "de-AT";

/** Format a Stripe `unit_amount` (minor units) + currency as a price string. */
export function formatPrice(
  unitAmount: number | null | undefined,
  currency = "eur",
  locale: string = DEFAULT_LOCALE,
): string {
  if (unitAmount == null || !Number.isFinite(unitAmount)) {
    return "—";
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(unitAmount / 100);
  } catch {
    return `${(unitAmount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

/** Format a Stripe timestamp (seconds or ms) or ISO string as a date. */
export function formatDate(
  value: number | string | null | undefined,
  locale: string = DEFAULT_LOCALE,
): string {
  if (value == null) return "—";
  const ms = typeof value === "number" ? (value < 1e12 ? value * 1000 : value) : Date.parse(value);
  if (!Number.isFinite(ms)) return "—";
  return new Date(ms).toLocaleDateString(locale);
}
