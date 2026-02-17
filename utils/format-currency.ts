/**
 * Utility to format currency amounts with symbols based on locale.
 */

/**
 * Formats a currency amount into a localized string with a symbol.
 *
 * @param currency - The currency code (e.g., 'PLN', 'EUR', 'USD')
 * @param amount - The numeric amount
 * @returns A formatted string like "zł 1.234,56" or "€1,234.56"
 */
export function formatCurrency(currency: string, amount: number): string {
  const locale = currency === "PLN" ? "pl-PL" : "en-IE";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is invalid or unsupported
    return `${amount} ${currency}`;
  }
}
