/**
 * Requests to turn a personal account into a business one (company name and
 * NIP). Approving converts the account; rejecting emails the customer why.
 */

export type AccountUpgradeStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface AccountUpgradeRequest {
  id: string;
  userId: string;
  status: AccountUpgradeStatus;
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
