/**
 * Formats a date string into a human-readable format.
 * Example: "2026-02-12T13:41:42.599Z" → "12 Feb 2026"
 *
 * @param dateStr - An ISO date string.
 * @returns Formatted date string (e.g., "12 Feb 2026").
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formats a date string into a human-readable date and time format.
 * Example: "2026-02-12T13:41:42.599Z" → "12 Feb 2026, 14:41"
 *
 * @param dateStr - An ISO date string.
 * @returns Formatted date and time string.
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Formats a date as a relative time string (e.g., "2 hours ago", "3 days ago").
 * Falls back to `formatDate` if the date is older than 30 days.
 *
 * @param dateStr - An ISO date string.
 * @returns Relative time string or formatted date.
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;

  return formatDate(dateStr);
}
