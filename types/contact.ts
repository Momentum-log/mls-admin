/** Messages sent through the public contact form (server `ContactMessage`). */

export type ContactStatus = "NEW" | "REPLIED" | "CLOSED";

export interface ContactReply {
  id: string;
  body: string;
  createdAt: string;
  sentBy?: string | null;
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
