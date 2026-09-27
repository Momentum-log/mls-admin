import apiClient from "../index";
import type {
  AdminAuthMethod,
  AdminIdentity,
  AuthResponse,
  BackupCodesResponse,
  CodeLoginPayload,
  IdentifyPayload,
  OtpRequestPayload,
  OtpVerifyPayload,
  StaffLoginPayload,
  TotpSetupResponse,
  TotpStatus,
  User,
} from "@/types/auth";

/**
 * Asks how an address signs in, and — on the Super Admin path — has the code
 * sent in the same round trip.
 *
 * Answers `200 { method }`, `404 ACCOUNT_NOT_FOUND`, or `403 ACCOUNT_INACTIVE`.
 * Note this necessarily tells an unauthenticated caller whether an address is
 * an admin, and which kind; it is not the no-oracle behaviour `/otp/request`
 * has. What it buys is that codes are never dispatched to addresses that
 * cannot use them.
 */
export const identifyAdmin = async (
  data: IdentifyPayload,
): Promise<AdminIdentity> => {
  const { data: body } = await apiClient.post<{
    method: AdminAuthMethod;
    codeSent?: boolean;
    codeAlreadyPending?: boolean;
    retryAfterSeconds?: number;
    expiresInSeconds?: number;
    email?: string;
    name?: string;
  }>("/admin/auth/identify", data);

  return {
    email: body.email ?? data.email,
    method: body.method,
    codeSent: body.codeSent === true,
    codeAlreadyPending: body.codeAlreadyPending === true,
    retryAfterSeconds: body.retryAfterSeconds,
    expiresInSeconds: body.expiresInSeconds,
    name: body.name,
  };
};

/**
 * Password sign-in, for STAFF admins only.
 *
 * The Super Administrator has no password stored at all and always receives a
 * 401 here — that account signs in with a one-time code, an authenticator, or
 * a backup code.
 */
export const loginStaff = async (
  data: StaffLoginPayload,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/admin/auth/login",
    data,
  );
  return response.data;
};

/**
 * Asks for a one-time sign-in code to be emailed.
 *
 * Always resolves — the endpoint answers 202 with an identical body whether
 * the address belongs to the Super Administrator, belongs to nobody, or was
 * throttled, so that callers cannot probe for valid admin addresses. Nothing
 * in the response says whether an email was actually sent; the email is the
 * only feedback.
 */
export const requestOtp = async (data: OtpRequestPayload): Promise<void> => {
  await apiClient.post("/admin/auth/otp/request", data);
};

/** Exchanges an emailed code for a session. 6 digits, 10 minutes, 3 attempts. */
export const verifyOtp = async (
  data: OtpVerifyPayload,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/admin/auth/otp/verify",
    data,
  );
  return response.data;
};

/**
 * Signs in with an authenticator app code.
 *
 * This is the path that does not touch email, so it is the way in during an
 * email outage. A code cannot be reused, even inside its own 30-second window.
 */
export const verifyTotp = async (
  data: CodeLoginPayload,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/admin/auth/totp/verify",
    data,
  );
  return response.data;
};

/**
 * Signs in with one of the ten single-use backup codes.
 * Case, spacing, and the dash are ignored by the server.
 */
export const verifyBackupCode = async (
  data: CodeLoginPayload,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/admin/auth/backup-code/verify",
    data,
  );
  return response.data;
};

/**
 * Ends the session server-side. Revocation is immediate — the middleware
 * checks it on every request, so the token stops working at once rather than
 * running out its remaining lifetime.
 *
 * @param all - End every session for this admin, not just this one.
 */
export const logout = async (all = false): Promise<void> => {
  await apiClient.post("/admin/auth/logout", null, {
    params: all ? { all: "true" } : undefined,
  });
};

/**
 * Fetches the currently authenticated admin's profile.
 * The API returns the admin object directly at the top level.
 */
export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<User>("/admin/auth/me");
  return response.data;
};

/** Whether the signed-in admin has an authenticator, and codes left. */
export const getTotpStatus = async (): Promise<TotpStatus> => {
  const { data } = await apiClient.get<TotpStatus>("/admin/auth/totp");
  return data;
};

/**
 * Begins enrollment, returning a secret and an `otpauth://` URI.
 * The secret stays inert until `confirmTotp` accepts a code from it, so an
 * abandoned enrollment never becomes a usable second factor.
 */
export const startTotpSetup = async (): Promise<TotpSetupResponse> => {
  const { data } = await apiClient.post<TotpSetupResponse>(
    "/admin/auth/totp/setup",
  );
  return data;
};

/**
 * Confirms enrollment and returns the backup codes.
 *
 * The only time the codes are ever transmitted — only their hashes are stored,
 * so a lost set must be regenerated rather than re-read.
 */
export const confirmTotpSetup = async (
  code: string,
): Promise<BackupCodesResponse> => {
  const { data } = await apiClient.post<BackupCodesResponse>(
    "/admin/auth/totp/confirm",
    { code },
  );
  return data;
};

/**
 * Removes the authenticator and its backup codes. Requires a *current*
 * authenticator code, so a stolen session alone cannot strip the second factor.
 */
export const disableTotp = async (code: string): Promise<void> => {
  await apiClient.delete("/admin/auth/totp", { data: { code } });
};

/** Issues a fresh set of backup codes, invalidating every previous one. */
export const regenerateBackupCodes = async (
  code: string,
): Promise<BackupCodesResponse> => {
  const { data } = await apiClient.post<BackupCodesResponse>(
    "/admin/auth/backup-codes/regenerate",
    { code },
  );
  return data;
};
