import Cookies from "js-cookie";
import type { AdminAuthErrorCode, AdminSessionInfo } from "@/types/auth";

const TOKEN_COOKIE = "accessToken";
const IDLE_TIMEOUT_KEY = "mls.admin.idleTimeoutSeconds";
const SIGN_OUT_REASON_KEY = "mls.admin.signOutReason";

/** Fallback idle window when a sign-in response omits `session`. */
const DEFAULT_IDLE_TIMEOUT_SECONDS = 3600;

/**
 * Slack added to the cookie's lifetime on top of the server's idle window.
 *
 * The server rewrites its own deadline at most once a minute, so the effective
 * timeout is up to 1h59s rather than exactly 1h. Expiring the cookie on the
 * nominal hour would sign an actively-working admin out early; the opposite
 * error — a cookie that outlives its session — is harmless now that the 401
 * interceptor clears it and explains why.
 */
const COOKIE_GRACE_SECONDS = 120;

/**
 * How often the cookie's expiry is re-stamped, mirroring the server's own
 * write throttle. Re-stamping on literally every response would rewrite
 * `document.cookie` dozens of times per page load for no benefit.
 */
const TOUCH_INTERVAL_MS = 60_000;

let lastTouchedAt = 0;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function cookieOptions(idleTimeoutSeconds: number): Cookies.CookieAttributes {
  return {
    expires: new Date(
      Date.now() + (idleTimeoutSeconds + COOKIE_GRACE_SECONDS) * 1000,
    ),
    sameSite: "strict",
    secure: isBrowser() && window.location.protocol === "https:",
  };
}

function readIdleTimeout(): number {
  if (!isBrowser()) return DEFAULT_IDLE_TIMEOUT_SECONDS;
  const stored = Number(window.localStorage.getItem(IDLE_TIMEOUT_KEY));
  return Number.isFinite(stored) && stored > 0
    ? stored
    : DEFAULT_IDLE_TIMEOUT_SECONDS;
}

/** Reads the bearer token for the current session, if any. */
export function getToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE);
}

/**
 * Stores the token issued by a successful sign-in and remembers the idle
 * window so later requests can keep the cookie in step with the server.
 */
export function setSession(token: string, session?: AdminSessionInfo): void {
  const idleTimeoutSeconds =
    session?.idleTimeoutSeconds && session.idleTimeoutSeconds > 0
      ? session.idleTimeoutSeconds
      : DEFAULT_IDLE_TIMEOUT_SECONDS;

  if (isBrowser()) {
    window.localStorage.setItem(IDLE_TIMEOUT_KEY, String(idleTimeoutSeconds));
    window.sessionStorage.removeItem(SIGN_OUT_REASON_KEY);
    resetReasonCache();
  }

  lastTouchedAt = Date.now();
  Cookies.set(TOKEN_COOKIE, token, cookieOptions(idleTimeoutSeconds));
}

/**
 * Pushes the cookie's expiry forward, matching what the request just did to
 * the server's deadline.
 *
 * Called from the response interceptor on every successful authenticated
 * request. Without it the cookie would expire an hour after sign-in even
 * though the session itself is idle-based, and an admin working continuously
 * would be bounced to login mid-task.
 */
export function touchSession(): void {
  if (!isBrowser()) return;

  const now = Date.now();
  if (now - lastTouchedAt < TOUCH_INTERVAL_MS) return;

  const token = getToken();
  if (!token) return;

  lastTouchedAt = now;
  Cookies.set(TOKEN_COOKIE, token, cookieOptions(readIdleTimeout()));
}

/** Drops the token. Safe to call when no session exists. */
export function clearSession(): void {
  lastTouchedAt = 0;
  Cookies.remove(TOKEN_COOKIE);
  if (isBrowser()) window.localStorage.removeItem(IDLE_TIMEOUT_KEY);
  // A voluntary sign-out must not leave the previous involuntary one cached,
  // or logging out would replay an old "signed in elsewhere" banner.
  resetReasonCache();
}

/** A stashed explanation for an involuntary sign-out. */
export interface SignOutReason {
  code?: AdminAuthErrorCode;
  message?: string;
}

/**
 * The reason read once per page load, cached so that repeated reads return the
 * same object.
 *
 * `useSyncExternalStore` compares snapshots by identity, so a getter that
 * re-parsed the JSON on every render would hand back a fresh object each time
 * and spin forever. Caching also keeps the banner on screen after the effect
 * removes the underlying entry.
 */
let reasonSnapshot: SignOutReason | undefined;
let reasonWasRead = false;

function resetReasonCache(): void {
  reasonSnapshot = undefined;
  reasonWasRead = false;
}

/**
 * Records why the session ended so the login page can say so.
 *
 * Held in `sessionStorage` because the interceptor signs out with a full page
 * navigation — React state and the query cache are both gone by the time the
 * login page mounts.
 */
export function setSignOutReason(reason: SignOutReason): void {
  if (!isBrowser()) return;
  resetReasonCache();
  try {
    window.sessionStorage.setItem(SIGN_OUT_REASON_KEY, JSON.stringify(reason));
  } catch {
    // Private-mode storage failures must not block the sign-out itself.
  }
}

/**
 * Reads the stashed sign-out reason without consuming it.
 *
 * Safe to call during render — it is the `getSnapshot` for the login page's
 * notice — and returns undefined on the server so hydration matches.
 */
export function peekSignOutReason(): SignOutReason | undefined {
  if (!isBrowser()) return undefined;
  if (reasonWasRead) return reasonSnapshot;

  reasonWasRead = true;
  try {
    const raw = window.sessionStorage.getItem(SIGN_OUT_REASON_KEY);
    reasonSnapshot = raw ? (JSON.parse(raw) as SignOutReason) : undefined;
  } catch {
    reasonSnapshot = undefined;
  }
  return reasonSnapshot;
}

/**
 * Drops the stored reason so a later visit to the login page is not haunted by
 * it. The cached snapshot is deliberately left alone, so the banner stays up
 * for the visit that is showing it.
 */
export function clearStoredSignOutReason(): void {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(SIGN_OUT_REASON_KEY);
  } catch {
    // Nothing to do — the entry is per-tab and short-lived either way.
  }
}
