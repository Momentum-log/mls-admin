/** Messages sent through the public contact form (server `ContactMessage`). */

export type ContactStatus = "NEW" | "READ" | "REPLIED" | "RESOLVED";

/** OUTBOUND: staff reply emailed to the customer. INBOUND: customer email logged by staff. */
export type ContactReplyDirection = "OUTBOUND" | "INBOUND";

export interface ContactReply {
  id: string;
  body: string;
  /** Sanitized rich text for OUTBOUND replies; null for plain and INBOUND ones. */
  bodyHtml: string | null;
  direction: ContactReplyDirection;
  createdAt: string;
  sentByName?: string | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  locale?: string | null;
  createdAt: string;
  _count?: { replies: number };
  replies?: ContactReply[];
}

export interface ContactFilters {
  status?: ContactStatus;
  search?: string;
  page: number;
  limit: number;
}
