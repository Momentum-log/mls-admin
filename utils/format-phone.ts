/**
 * Ensures a phone number string starts with a "+" prefix.
 * If already prefixed or empty, returns as is.
 *
 * @param phone - The phone number string to format.
 * @returns Formatted phone number with "+" prefix.
 */
export function formatPhoneNumber(phone?: string | null): string {
  if (!phone) return "—";
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return trimmed;
  return `+${trimmed}`;
}
