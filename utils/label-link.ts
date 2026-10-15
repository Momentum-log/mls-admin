import type { AnchorHTMLAttributes } from "react";

/**
 * Props for a "download label" link.
 *
 * Carriers hand labels back in two shapes. FedEx returns a hosted https URL,
 * which opens in a new tab. DHL eCommerce returns the PDF itself, which the
 * server stores as `data:application/pdf;base64,…`. Browsers refuse to open a
 * data URL in a new tab, so that one is downloaded as a file instead, named
 * `MLS-<REFERENCE>.pdf` in uppercase (the reference is the tracking number).
 */
export function getLabelLinkProps(
  labelUrl: string,
  reference?: string | null,
): AnchorHTMLAttributes<HTMLAnchorElement> {
  const trimmed = labelUrl.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return { href: trimmed, target: "_blank", rel: "noopener noreferrer" };
  }

  // Anything else is the raw base64 PDF without its data: prefix.
  const href = trimmed.startsWith("data:")
    ? trimmed
    : `data:application/pdf;base64,${trimmed}`;

  const fileName = `MLS-${reference || "LABEL"}`.toUpperCase();

  return { href, download: `${fileName}.pdf` };
}
