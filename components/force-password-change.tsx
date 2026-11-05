"use client";

import { Loader2 } from "lucide-react";
import { PasswordChange } from "@/components/admin-profile/PasswordChange";
import { Button } from "@/components/ui/button";
import { useMyProfile } from "@/hooks/admin-profile/use-admin-profile";
import { useLogout } from "@/hooks/auth/use-auth";

/**
 * Locks the dashboard behind a password change while a temporary password is
 * in use.
 *
 * The server refuses every other route in that state (403
 * `PASSWORD_CHANGE_REQUIRED`), so rendering the console would only show
 * failures. Once the new password is saved the profile refetches and the
 * console appears.
 */
export function ForcePasswordChange({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: profile, isLoading } = useMyProfile();
  const { mutate: logout } = useLogout();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile?.mustChangePassword) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <PasswordChange forced />
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => logout(undefined)}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
