"use client";

import { useState } from "react";
import { Shield, Key, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useRotatePassword } from "@/hooks/admin/use-security";
import { usePermissions } from "@/hooks/use-permissions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { motion } from "framer-motion";

/**
 * Super Admin Security Settings Page.
 * Allows manual triggering of the 16-character password rotation.
 */
export default function SecurityPage() {
  const [resetKey, setResetKey] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { role, isLoading: isRoleLoading } = usePermissions();
  const { mutate: rotatePassword, isPending } = useRotatePassword();
  const [showResetKey, setShowResetKey] = useState(false);

  const isSuperAdmin = role === "Super Admin";

  const handleRotate = () => {
    if (!resetKey.trim()) return;
    setIsConfirmOpen(true);
  };

  const onConfirm = () => {
    rotatePassword(resetKey, {
      onSuccess: () => {
        setResetKey("");
        setIsConfirmOpen(false);
      },
      onError: () => {
        setIsConfirmOpen(false);
      },
    });
  };

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
          settings and trigger password rotations.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
        <p className="text-muted-foreground">
          Manage system-level security controls and account recovery mechanisms.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6"
      >
        {/* Password Rotation Card */}
        <section className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-gray-50/50 flex items-center gap-4">
            <div className="p-3 bg-brand-blue/10 rounded-xl">
              <Shield className="h-6 w-6 text-brand-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                Super Admin Password Rotation
              </h2>
              <p className="text-sm text-muted-foreground">
                Manually trigger a full reset of the Super Admin credentials.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3">
                <AlertCircle className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">How it works:</p>
                  <ul className="list-disc pl-4 space-y-1 text-blue-800/80">
                    <li>
                      The system automatically rotates this password every 24
                      hours.
                    </li>
                    <li>
                      Manual rotation requires your 8-character **Weekly Reset
                      Key**.
                    </li>
                    <li>
                      Rotating will immediately invalidate current access.
                    </li>
                    <li>
                      New credentials will be sent to your verified email
                      address.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Weekly Reset Key
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                  </div>
                  <Input
                    type={showResetKey ? "text" : "password"}
                    placeholder="Enter 8-character reset key"
                    className="pl-10 pr-12 h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all text-lg font-mono tracking-widest"
                    value={resetKey}
                    onChange={(e) =>
                      setResetKey(e.target.value.toUpperCase().slice(0, 8))
                    }
                    maxLength={8}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetKey(!showResetKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue transition-colors p-2"
                  >
                    {showResetKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground ml-1">
                  Found in the rotation email sent every Monday.
                </p>
              </div>
            </div>

            <Button
              onClick={handleRotate}
              disabled={isPending || resetKey.length < 8}
              className="w-full h-12 bg-destructive hover:bg-destructive/90 text-white font-bold rounded-xl shadow-lg shadow-destructive/10 transition-all flex items-center justify-center gap-2 group"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Shield className="h-5 w-5 transition-transform group-hover:scale-110" />
                  Rotate Super Admin Password
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Audit Log Hint */}
        <div className="p-6 border border-dashed border-border rounded-2xl flex items-center justify-between opacity-60">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-bold">Security Auditing</p>
              <p className="text-xs text-muted-foreground">
                All rotation triggers and reset key attempts are logged for
                system integrity.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded-md">
            AUDIT_LEVEL: HIGH
          </span>
        </div>
      </motion.div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Trigger Security Rotation?"
        description="Are you sure you want to rotate the Super Admin password? This will immediately logout all active Super Admin sessions and require you to check your email for the new credentials."
        confirmLabel="Rotate Password"
        destructive
        isLoading={isPending}
        onConfirm={onConfirm}
      />
    </div>
  );
}
