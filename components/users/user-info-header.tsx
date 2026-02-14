"use client";

import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user";
import { Mail, User as UserIcon, Hash, BadgeCheck, BadgeX } from "lucide-react";
import CopyButton from "@/components/ui/copy-button";

/**
 * Returns the appropriate badge variant based on user status.
 */
function getStatusVariant(
  status: string,
): "default" | "destructive" | "secondary" | "outline" {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "FLAGGED":
      return "secondary";
    case "WARNED":
      return "outline";
    case "BANNED":
      return "destructive";
    default:
      return "default";
  }
}

/**
 * Props for the UserInfoHeader component.
 */
interface UserInfoHeaderProps {
  /** The user object to display. */
  user: User;
}

/**
 * A compact, single-row user info header for "See All" sub-pages.
 * Displays the user's name, email (with verification icon), userCode,
 * and status badge. Designed to sit at the top of user-scoped list views.
 */
export default function UserInfoHeader({ user }: UserInfoHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border bg-card px-4 py-3">
      {/* Name */}
      <div className="flex items-center gap-1.5 text-sm">
        <UserIcon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{user.name}</span>
      </div>

      {/* Email + verified icon */}
      <div className="flex items-center gap-1.5 text-sm">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <span>{user.email}</span>
        {user.is_verified ? (
          <BadgeCheck className="h-4 w-4 text-green-600 shrink-0" />
        ) : (
          <BadgeX className="h-4 w-4 text-red-500 shrink-0" />
        )}
        <CopyButton text={user.email} tooltipText="Copy email" />
      </div>

      {/* User Code */}
      {user.userCode && (
        <div className="flex items-center gap-1.5 text-sm">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-muted-foreground">
            {user.userCode}
          </span>
          <CopyButton text={user.userCode} tooltipText="Copy code" />
        </div>
      )}

      {/* Status badge */}
      <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
    </div>
  );
}
