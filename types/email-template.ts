/**
 * Database email templates (`EmailTemplate`).
 *
 * The server uses a database template only for a name that has no built-in
 * `.hbs` file, and caches compiled templates until it restarts.
 */

export type EmailTemplateType = "AUTHENTICATION" | "SERVICE" | "MARKETING";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  /** Handlebars source. */
  body: string;
  type: EmailTemplateType;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertEmailTemplatePayload {
  name: string;
  subject: string;
  body: string;
  type: EmailTemplateType;
}

/**
 * `html` is placed in the server's branded message layout (header, sign-off,
 * footer); `raw: true` would send it as given instead.
 */
export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  preheader?: string;
  fromName?: string;
}
