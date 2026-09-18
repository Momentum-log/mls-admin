"use client";

import { useState } from "react";
import Link from "next/link";
import { useUpdateMyPassword } from "@/hooks/admin-profile/use-admin-profile";
import { usePermissions } from "@/hooks/use-permissions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Key, Smartphone } from "lucide-react";

/**
 * The Security tab of the admin profile drawer.
 *
 * Staff change a password here. The Super Administrator has none — that
 * account holds no password at all, so there is nothing on this screen for
 * them to change and the form would only 400. They get a pointer to the
 * authenticator instead, which is the credential they actually manage.
 */
export function PasswordChange() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { isSuperAdmin } = usePermissions();
  const { mutate, isPending } = useUpdateMyPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) return;
    mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          setOldPassword("");
          setNewPassword("");
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
        <h3 className="font-semibold">Change Password</h3>
      </div>

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
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters long.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-blue text-white hover:bg-brand-blue/90"
      >
        {isPending ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}
