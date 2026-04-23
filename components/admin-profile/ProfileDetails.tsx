"use client";

import { useMe } from "@/hooks/auth/use-auth";
import { User, Mail, Shield, Key } from "lucide-react";

export function ProfileDetails() {
  const { data: user } = useMe();

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-muted/30 border border-border/40">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <User className="h-4 w-4" />
          <span>Full Name</span>
        </div>
        <p className="font-medium text-foreground">{user.name}</p>
      </div>

      <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-muted/30 border border-border/40">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Mail className="h-4 w-4" />
          <span>Email Address</span>
        </div>
        <p className="font-medium text-foreground">{user.email}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Email modifications are disabled.
        </p>
      </div>

      <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-muted/30 border border-border/40">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Shield className="h-4 w-4" />
          <span>Role</span>
        </div>
        <p className="font-medium text-foreground">{user.role}</p>
      </div>
    </div>
  );
}
