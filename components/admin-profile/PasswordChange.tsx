"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useMyProfile,
  useUpdateMyPassword,
} from "@/hooks/admin-profile/use-admin-profile";
import { checkPassword } from "@/lib/password-policy";
import { formatDate } from "@/utils/format-date";
import { usePermissions } from "@/hooks/use-permissions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Key, Smartphone } from "lucide-react";

/**
 * The Security tab of the admin profile drawer.
 *
 * Staff change a password here. The Super Administrator has none — that
 * account holds no password at all, so there is nothing on this screen for
 * them to change and the form would only 400. They get a pointer to the
 * authenticator instead, which is the credential they actually manage.
 *
 * A change is allowed once every 30 days. `forced` is the locked-console case
 * after a reset: the temporary password is the "current" one and the wait does
 * not apply.
 */
export function PasswordChange({ forced = false }: { forced?: boolean }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { isSuperAdmin } = usePermissions();
  const { data: profile } = useMyProfile();
  const { mutate, isPending } = useUpdateMyPassword();

  const rules = checkPassword(newPassword);
  const strong = rules.every((r) => r.met);
  const matches = newPassword === confirmPassword;
  const waitUntil = forced ? null : profile?.nextPasswordChangeAt;
  const canSubmit =
    strong && matches && newPassword !== oldPassword && !waitUntil;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      },
    );
  };

  if (isSuperAdmin) {
    return (
      <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/40">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-brand-blue" />
          <h3 className="font-semibold">Sign-in Method</h3>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          This account has no password. You sign in with a one-time code sent to
          your email, an authenticator app, or a backup code.
        </p>

        <Button
          asChild
          className="w-full bg-brand-blue text-white hover:bg-brand-blue/90"
        >
          <Link href="/dashboard/security">Manage Authenticator</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/40"
    >
      <div className="flex items-center gap-2 mb-4">
        <Key className="h-5 w-5 text-brand-blue" />
        <h3 className="font-semibold">
          {forced ? "Set a New Password" : "Change Password"}
        </h3>
      </div>

      {forced ? (
        <p className="text-sm text-muted-foreground">
          You signed in with a temporary password. Enter it below as the current
          password, then choose your own to continue.
        </p>
      ) : waitUntil ? (
        <p className="text-sm text-muted-foreground">
          Passwords can be changed once every 30 days. You can change yours
          again on {formatDate(waitUntil)}.
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="oldPassword">Current Password</Label>
        <Input
          id="oldPassword"
          type="password"
          autoComplete="current-password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <ul className="space-y-1 text-xs">
          {rules.map((r) => (
            <li
              key={r.label}
              className={
                r.met ? "text-green-600" : "text-muted-foreground"
              }
            >
              <Check
                className={`mr-1 inline h-3 w-3 ${r.met ? "" : "opacity-30"}`}
              />
              {r.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {confirmPassword && !matches && (
          <p className="text-xs text-red-600">The passwords do not match.</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending || !canSubmit}
        className="w-full bg-brand-blue text-white hover:bg-brand-blue/90"
      >
        {isPending ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}
