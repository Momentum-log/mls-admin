"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Access Denied screen for unauthorized navigation.
 */
export default function AccessDeniedPage() {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <ShieldAlert className="h-16 w-16 text-red-500" />
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">
        Access Denied
      </h1>

      <p className="text-slate-500 text-center max-w-md mb-8">
        You do not have the necessary permissions to view this page. If you
        believe this is an error, please contact your system administrator.
      </p>

      <Link href="/dashboard">
        <Button className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
