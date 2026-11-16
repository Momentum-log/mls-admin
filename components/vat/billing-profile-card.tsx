"use client";

import { useUserBillingProfile } from "@/hooks/admin/use-vat";
import { useCan } from "@/components/auth/can";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/utils/format-date";
import { Landmark, Loader2 } from "lucide-react";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

/** The customer's saved billing details and the result of the last tax ID check. */
export function BillingProfileCard({ userId }: { userId: string }) {
  const { can } = useCan();
  const allowed = can("user:read");
  const { data: profile, isLoading } = useUserBillingProfile(allowed ? userId : null);

  if (!allowed) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Landmark className="h-5 w-5 text-muted-foreground" />
          Billing details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />
        ) : !profile ? (
          <p className="text-sm text-muted-foreground">No billing details saved yet.</p>
        ) : (
          <>
            <Row label={profile.isBusiness ? "Company" : "Name"}>
              {profile.isBusiness ? (profile.companyName ?? profile.fullName) : profile.fullName}
            </Row>
            <Row label="Address">
              {profile.street}, {profile.postalCode} {profile.city}, {profile.countryCode}
            </Row>
            <Row label="Email">{profile.email}</Row>
            <Row label="Phone">{profile.phone}</Row>
            {profile.isBusiness && (
              <>
                <Row label={profile.taxIdType ?? "Tax ID"}>{profile.taxId}</Row>
                {profile.lastValidation && (
                  <>
                    <Row label="Last tax ID check">
                      {profile.lastValidation.provider} ·{" "}
                      <Badge variant={profile.lastValidation.status === "VALID" ? "secondary" : "destructive"}>
                        {profile.lastValidation.status}
                      </Badge>
                    </Row>
                    {profile.lastValidation.reference && (
                      <Row label="Reference">
                        <span className="font-mono text-xs">{profile.lastValidation.reference}</span>
                      </Row>
                    )}
                    <Row label="Checked">{formatDateTime(profile.lastValidation.checkedAt)}</Row>
                  </>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
