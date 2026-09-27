export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions?: string[];
  avatarUrl?: string;
}

/**
 * The idle deadline attached to a successful sign-in.
 *
 * `expiresAt` is not a fixed lifetime — every authenticated request pushes it
 * forward by `idleTimeoutSeconds`. It is the server's authority on the
 * session; the JWT's own 7-day `exp` is only a backstop for a leaked token.
 */
export interface AdminSessionInfo {
  expiresAt: string;
  idleTimeoutSeconds: number;
}

export interface AuthResponse {
  admin: User;
  token?: string;
  session?: AdminSessionInfo;
  /** Only returned by the backup-code sign-in. */
  backupCodesRemaining?: number;
  message?: string;
}

/** Which credential an account signs in with. */
export type AdminAuthMethod = "OTP" | "PASSWORD";

/** Why an address cannot start a sign-in. */
export type IdentifyErrorReason = "ACCOUNT_NOT_FOUND" | "ACCOUNT_INACTIVE";

/** The address being identified, ahead of any credential. */
export interface IdentifyPayload {
  email: string;
}

/**
 * The answer to "how does this address sign in?".
 *
 * Sign-in is two steps: an address is submitted on its own, and the server
 * says whether it needs a password or a one-time code. An address belonging to
 * no active admin is refused here, before any credential is collected.
 */
export interface AdminIdentity {
  email: string;
  method: AdminAuthMethod;
  /** A fresh code was dispatched by this lookup. */
  codeSent: boolean;
  /**
   * A code sent earlier is still live, and this lookup sent nothing new.
   *
   * The lookup was throttled, but the throttle is not the admin's problem —
   * there is already a usable code in their inbox. The distinction only
   * changes what we tell them to look for, never whether they can proceed.
   */
  codeAlreadyPending: boolean;
  /** Seconds until another code may be requested. Sent on the throttled path. */
  retryAfterSeconds?: number;
  /** How long the live code stays valid, in seconds. */
  expiresInSeconds?: number;
  /** The account's display name, when the server sends one. */
  name?: string;
}

/** Staff sign-in. The Super Administrator has no password and always 401s here. */
export interface StaffLoginPayload {
  email: string;
  password: string;
}

export interface OtpRequestPayload {
  email: string;
}

export interface OtpVerifyPayload {
  email: string;
  otp: string;
}

/** Shared by the authenticator and backup-code sign-in routes. */
export interface CodeLoginPayload {
  email: string;
  code: string;
}

export interface TotpStatus {
  enrolled: boolean;
  remainingBackupCodes: number;
}

export interface TotpSetupResponse {
  /** Base32 secret, for manual entry when a QR code cannot be scanned. */
  secret: string;
  /** `otpauth://` URI the client renders as a QR code. */
  otpauthUri: string;
  message?: string;
}

export interface BackupCodesResponse {
  message?: string;
  backupCodes: string[];
}

/**
 * Why an authenticated request was refused.
 *
 * Returned by every authenticated endpoint in both `code` and `reason` (same
 * value in each) for one release; `reason` is the field to migrate to once the
 * customer-side contract converges. All of these mean "sign in again", but
 * `SESSION_SUPERSEDED` is the one worth showing verbatim — it is how an admin
 * notices a sign-in they did not make.
 */
export type AdminAuthErrorCode =
  | "NO_TOKEN"
  | "INVALID_TOKEN"
  | "LEGACY_TOKEN"
  | "SESSION_SUPERSEDED"
  | "SESSION_REVOKED"
  | "SESSION_EXPIRED";
