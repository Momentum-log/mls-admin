"use client";

import { useEffect, useSyncExternalStore } from "react";
import { AlertTriangle, Info } from "lucide-react";
import {
  clearStoredSignOutReason,
  peekSignOutReason,
} from "@/lib/auth/session";
import type { AdminAuthErrorCode } from "@/types/auth";

/**
 * How each sign-out reason is explained on the login screen.
 *
 * `SESSION_SUPERSEDED` is the only one styled as a warning. All of these mean
 * "sign in again", but that one is also how an admin notices a sign-in they
 * did not make, so it gets the server's own wording and a colour that says
 * "read this" rather than "carry on".
 */
const NOTICES: Record<
  AdminAuthErrorCode,
  { title: string; body: string; severe: boolean }
> = {
  SESSION_SUPERSEDED: {
    title: "Signed in on another device",
    body: "This account signed in somewhere else, which ended this session. If that was not you, sign in and remove the authenticator or contact your administrator.",
    severe: true,
  },
  SESSION_REVOKED: {
    title: "Session ended",
    body: "This session was signed out, or the account was suspended.",
    severe: false,
  },
  SESSION_EXPIRED: {
    title: "Signed out for inactivity",
    body: "Sessions end after an hour with no activity. Sign in to carry on.",
    severe: false,
  },
  NO_TOKEN: {
    title: "Please sign in",
    body: "That page needs an active session.",
    severe: false,
  },
  INVALID_TOKEN: {
    title: "Please sign in again",
    body: "The session token was not usable.",
    severe: false,
  },
  LEGACY_TOKEN: {
    title: "Please sign in again",
    body: "Your session predates the current sign-in system.",
    severe: false,
  },
};

/** Nothing mutates the reason while the notice is mounted. */
const subscribe = () => () => {};

/** The server has no `sessionStorage`, so it renders nothing and hydration matches. */
const getServerSnapshot = () => undefined;

/**
 * Explains an involuntary sign-out, once.
 *
 * The reason is stashed in `sessionStorage` by the API client, because it signs
 * out with a full page navigation — React state does not survive the trip.
 * Reading it through `useSyncExternalStore` rather than an effect keeps the
 * server and client renders in agreement without a second render pass.
 */
export function SessionNotice() {
  const reason = useSyncExternalStore(
    subscribe,
    peekSignOutReason,
    getServerSnapshot,
  );

  // Remove the entry, not the snapshot: the banner stays up for this visit but
  // a later trip to the login page starts clean.
  useEffect(() => {
    clearStoredSignOutReason();
  }, []);

  if (!reason?.code) return null;

  const notice = NOTICES[reason.code];
  if (!notice) return null;

  const Icon = notice.severe ? AlertTriangle : Info;

  return (
    <div
      role="status"
      className={
        notice.severe
          ? "mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
          : "mb-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4"
      }
    >
      <Icon
        className={
          notice.severe
            ? "h-5 w-5 shrink-0 text-amber-600"
            : "h-5 w-5 shrink-0 text-brand-blue"
        }
      />
      <div className="space-y-1">
        <p
          className={
            notice.severe
              ? "text-sm font-bold text-amber-900"
              : "text-sm font-bold text-blue-900"
          }
        >
          {notice.title}
        </p>
        {/* The server's own message, when it sent one, is more specific than
            ours — it can name the time or the device. */}
        <p
          className={
            notice.severe
              ? "text-xs leading-relaxed text-amber-800"
              : "text-xs leading-relaxed text-blue-800"
          }
        >
          {reason.message?.trim() || notice.body}
        </p>
      </div>
    </div>
  );
}
