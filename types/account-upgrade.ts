/**
 * Requests to turn a personal account into a business one (company name and
 * NIP) or a business one back into a personal one (only while the admin switch
 * allows it). Approving converts the account; rejecting emails the customer why.
 */

export type AccountChangeDirection = "UPGRADE" | "DOWNGRADE";

export type AccountUpgradeStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface AccountUpgradeRequest {
  id: string;
  userId: string;
  status: AccountUpgradeStatus;
  /** UPGRADE: individual to business. DOWNGRADE: business back to individual. */
  direction: AccountChangeDirection;
  /** The customer's reason, given on a downgrade request. */
  reason: string | null;
  companyName: string;
  nip: string;
  /** Present when the customer attached a registration document. */
  proofFile: { fileName?: string; mimeType?: string } | null;
  adminFeedback: string | null;
  createdAt: string;
  reviewedAt: string | null;
  user: {
    id: string;
    userCode: string;
    email: string;
    name: string;
    accountType: string;
  } | null;
}
