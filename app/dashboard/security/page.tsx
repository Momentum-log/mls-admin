"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import {
  AlertCircle,
  Check,
  KeyRound,
  Loader2,
  Monitor,
  ShieldCheck,
  ShieldOff,
  Smartphone,
} from "lucide-react";
import {
  useConfirmTotpSetup,
  useDisableTotp,
  useRegenerateBackupCodes,
  useStartTotpSetup,
  useTotpStatus,
} from "@/hooks/auth/use-totp";
import { useLogout } from "@/hooks/auth/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CopyButton from "@/components/ui/copy-button";
import type { TotpSetupResponse } from "@/types/auth";
import { motion } from "framer-motion";

/** Codes below this leave too little room for another lost phone. */
const LOW_BACKUP_CODE_THRESHOLD = 3;

/**
 * Super Admin security settings.
 *
 * Covers the authenticator app, which is the sign-in path that does not depend
 * on email — if the mail provider is down and nobody has enrolled one, there is
 * no remote way into the account. Enrollment happens here, while signed in, so
 * the first sign-in on a new environment is always the emailed code.
 */
export default function SecurityPage() {
  const { isSuperAdmin, isLoading: isRoleLoading } = usePermissions();
  const { data: status, isLoading: isStatusLoading } = useTotpStatus();

  const { mutate: startSetup, isPending: isStarting } = useStartTotpSetup();
  const { mutate: confirmSetup, isPending: isConfirming } =
    useConfirmTotpSetup();
  const { mutate: disable, isPending: isDisabling } = useDisableTotp();
  const { mutate: regenerate, isPending: isRegenerating } =
    useRegenerateBackupCodes();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const [setup, setSetup] = useState<TotpSetupResponse>();
  const [confirmCode, setConfirmCode] = useState("");
  const [manageCode, setManageCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>();
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const [isLogoutAllOpen, setIsLogoutAllOpen] = useState(false);

  /** Clears every code field once an action has consumed one. */
  function resetCodeInputs() {
    setConfirmCode("");
    setManageCode("");
  }

  if (isRoleLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="bg-destructive/10 p-4 rounded-full mb-6">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground max-w-md">
          Only the Super Admin is authorized to access the system security
          settings.
        </p>
      </div>
    );
  }

  const enrolled = status?.enrolled ?? false;
  const remaining = status?.remainingBackupCodes ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
        <p className="text-muted-foreground">
          Manage the authenticator app and the sessions on this account.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6"
      >
        {/* Authenticator */}
        <section className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-gray-50/50 flex items-center gap-4">
            <div className="p-3 bg-brand-blue/10 rounded-xl">
              <Smartphone className="h-6 w-6 text-brand-blue" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Authenticator App</h2>
              <p className="text-sm text-muted-foreground">
                A second way in that does not depend on email.
              </p>
            </div>
            {!isStatusLoading && (
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                  enrolled
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {enrolled ? "Enrolled" : "Not enrolled"}
              </span>
            )}
          </div>

          <div className="p-6 space-y-6">
            {isStatusLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
              </div>
            ) : setup ? (
              /* --- Enrollment in progress --- */
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Scan this with Google Authenticator, 1Password, Authy, or any
                  other app, then enter the code it shows to finish.
                </p>

                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-white border border-border rounded-2xl">
                    <QRCode value={setup.otpauthUri} size={180} />
                  </div>
                  <div className="w-full max-w-md space-y-2">
                    <p className="text-xs font-bold text-gray-700">
                      Or enter this key by hand
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-border rounded-xl">
                      <code className="flex-1 text-xs font-mono break-all">
                        {setup.secret}
                      </code>
                      <CopyButton
                        text={setup.secret}
                        tooltipText="Copy setup key"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmCode"
                    className="text-sm font-bold text-gray-700 ml-1"
                  >
                    Code From Your App
                  </label>
                  <Input
                    id="confirmCode"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    maxLength={6}
                    className="h-12 text-center text-lg font-mono tracking-[0.4em] bg-gray-50/50"
                    value={confirmCode}
                    onChange={(e) =>
                      setConfirmCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    disabled={isConfirming}
                  />
                  {/* Nothing is enrolled until this succeeds — an abandoned
                      setup never becomes a usable second factor. */}
                  <p className="text-xs text-muted-foreground ml-1">
                    The authenticator is not active until this code is accepted.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="h-12 rounded-xl"
                    onClick={() => {
                      setSetup(undefined);
                      resetCodeInputs();
                    }}
                    disabled={isConfirming}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl"
                    disabled={confirmCode.length < 6 || isConfirming}
                    onClick={() =>
                      confirmSetup(confirmCode, {
                        onSuccess: (data) => {
                          setBackupCodes(data.backupCodes);
                          setSetup(undefined);
                          resetCodeInputs();
                        },
                      })
                    }
                  >
                    {isConfirming ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Confirm &amp; Enable
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : enrolled ? (
              /* --- Enrolled: manage --- */
              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 bg-green-50/60 border border-green-100 rounded-xl">
                  <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-green-900">
                    <p className="font-semibold">Authenticator is active.</p>
                    <p className="text-green-800/80">
                      You can sign in with it even while email is unavailable.
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    remaining <= LOW_BACKUP_CODE_THRESHOLD
                      ? "bg-amber-50 border-amber-200"
                      : "bg-gray-50/60 border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <KeyRound
                      className={`h-5 w-5 ${
                        remaining <= LOW_BACKUP_CODE_THRESHOLD
                          ? "text-amber-600"
                          : "text-gray-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-bold">Backup codes</p>
                      <p className="text-xs text-muted-foreground">
                        {remaining} unused code{remaining === 1 ? "" : "s"}{" "}
                        remaining.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="manageCode"
                    className="text-sm font-bold text-gray-700 ml-1"
                  >
                    Current Authenticator Code
                  </label>
                  <Input
                    id="manageCode"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    maxLength={6}
                    className="h-12 text-center text-lg font-mono tracking-[0.4em] bg-gray-50/50"
                    value={manageCode}
                    onChange={(e) =>
                      setManageCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    disabled={isRegenerating || isDisabling}
                  />
                  {/* Both actions below require it, so a stolen session alone
                      cannot strip or replace the second factor. */}
                  <p className="text-xs text-muted-foreground ml-1">
                    Required to regenerate backup codes or remove the
                    authenticator.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-xl font-bold"
                    disabled={manageCode.length < 6 || isRegenerating}
                    onClick={() => setIsRegenerateOpen(true)}
                  >
                    {isRegenerating ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4 mr-2" />
                        Regenerate Backup Codes
                      </>
                    )}
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-destructive hover:bg-destructive/90 text-white font-bold rounded-xl"
                    disabled={manageCode.length < 6 || isDisabling}
                    onClick={() => setIsDisableOpen(true)}
                  >
                    {isDisabling ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <ShieldOff className="h-4 w-4 mr-2" />
                        Remove Authenticator
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* --- Not enrolled --- */
              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <p className="font-semibold mb-1">
                      Enrol one before you need it.
                    </p>
                    <p className="text-amber-800/80">
                      Without an authenticator, the emailed code is the only way
                      into this account. If mail delivery fails, there is no
                      remote way back in.
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full h-12 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl shadow-lg shadow-brand-blue/10"
                  disabled={isStarting}
                  onClick={() =>
                    startSetup(undefined, {
                      onSuccess: (data) => {
                        setSetup(data);
                        resetCodeInputs();
                      },
                    })
                  }
                >
                  {isStarting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Smartphone className="h-5 w-5 mr-2" />
                      Set Up Authenticator
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Sessions */}
        <section className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-gray-50/50 flex items-center gap-4">
            <div className="p-3 bg-brand-blue/10 rounded-xl">
              <Monitor className="h-6 w-6 text-brand-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Sessions</h2>
              <p className="text-sm text-muted-foreground">
                One session per admin, ending after an hour of inactivity.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3">
              <AlertCircle className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">How sessions work:</p>
                <ul className="list-disc pl-4 space-y-1 text-blue-800/80">
                  <li>
                    Signing in anywhere ends every other session for this
                    account immediately.
                  </li>
                  <li>
                    The displaced device is told it was signed out because the
                    account signed in elsewhere.
                  </li>
                  <li>
                    A session ends after an hour with no activity — not an hour
                    after signing in.
                  </li>
                </ul>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 rounded-xl font-bold"
              disabled={isLoggingOut}
              onClick={() => setIsLogoutAllOpen(true)}
            >
              {isLoggingOut ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Sign Out Everywhere"
              )}
            </Button>
          </div>
        </section>
      </motion.div>

      {/* Backup codes — the only time they are ever shown. */}
      <Dialog
        open={Boolean(backupCodes)}
        onOpenChange={(open) => {
          if (!open) setBackupCodes(undefined);
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-brand-blue" />
              Save Your Backup Codes
            </DialogTitle>
            <DialogDescription>
              Only their hashes are stored, so this is the one and only time
              they can be shown. Keep them somewhere you can reach without this
              account.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 py-4">
            {backupCodes?.map((code) => (
              <code
                key={code}
                className="p-2.5 bg-gray-50 border border-border rounded-lg text-sm font-mono text-center tracking-wide"
              >
                {code}
              </code>
            ))}
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            Each code works exactly once. Regenerating a set invalidates every
            code in the previous one.
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <div className="flex items-center gap-2 mr-auto">
              <CopyButton
                text={backupCodes?.join("\n") ?? ""}
                tooltipText="Copy all codes"
              />
              <span className="text-xs text-muted-foreground">Copy all</span>
            </div>
            <Button
              className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl"
              onClick={() => setBackupCodes(undefined)}
            >
              I&apos;ve Saved Them
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isRegenerateOpen}
        onOpenChange={setIsRegenerateOpen}
        title="Regenerate backup codes?"
        description="Every code in your current set stops working immediately. The new set is shown once."
        confirmLabel="Regenerate"
        isLoading={isRegenerating}
        onConfirm={() =>
          regenerate(manageCode, {
            onSuccess: (data) => {
              setBackupCodes(data.backupCodes);
              setIsRegenerateOpen(false);
              resetCodeInputs();
            },
            onError: () => setIsRegenerateOpen(false),
          })
        }
      />

      <ConfirmDialog
        open={isDisableOpen}
        onOpenChange={setIsDisableOpen}
        title="Remove the authenticator?"
        description="This also deletes your backup codes. The emailed one-time code becomes the only way into this account — if mail delivery fails, there is no remote way back in."
        confirmLabel="Remove"
        destructive
        isLoading={isDisabling}
        onConfirm={() =>
          disable(manageCode, {
            onSuccess: () => {
              setIsDisableOpen(false);
              resetCodeInputs();
            },
            onError: () => setIsDisableOpen(false),
          })
        }
      />

      <ConfirmDialog
        open={isLogoutAllOpen}
        onOpenChange={setIsLogoutAllOpen}
        title="Sign out everywhere?"
        description="Ends every session for this account, including this one. You will need to sign in again."
        confirmLabel="Sign Out Everywhere"
        destructive
        isLoading={isLoggingOut}
        onConfirm={() => logout(true)}
      />
    </div>
  );
}
