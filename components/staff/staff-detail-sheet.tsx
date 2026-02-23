import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Staff } from "@/types/staff";
import { formatDate } from "@/utils/format-date";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface StaffDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff | null;
}

export default function StaffDetailSheet({
  open,
  onOpenChange,
  staff,
}: StaffDetailSheetProps) {
  if (!staff) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-xl">{staff.name}</SheetTitle>
          <SheetDescription>
            View profile, permissions, and audit logs for this staff member.
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-6">
          <Tabs defaultValue="details" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Profile Details</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 pt-6">
              <div className="flex flex-col gap-6">
                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                    Identity
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-muted-foreground mb-1">
                        Email
                      </span>
                      <span className="font-medium">{staff.email}</span>
                    </div>
                    <div>
                      <span className="block text-muted-foreground mb-1">
                        Admin Code
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                          {staff.adminCode}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                    Access & Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-muted-foreground mb-1">
                        Role
                      </span>
                      <span className="font-medium">{staff.role.name}</span>
                    </div>
                    <div>
                      <span className="block text-muted-foreground mb-1">
                        Status
                      </span>
                      {staff.isActive ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Suspended</Badge>
                      )}
                    </div>
                    <div>
                      <span className="block text-muted-foreground mb-1">
                        Last Active
                      </span>
                      <span>
                        {staff.lastActive
                          ? formatDate(staff.lastActive)
                          : "Never Logged In"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                    Granted Permissions
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {staff.role.permissions.map((p, i) => (
                      <span
                        key={i}
                        className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-[11px] font-mono"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="pt-6">
              <div className="rounded-lg border bg-muted/20 p-8 text-center flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
                <h4 className="font-medium">Activity Logs Loading...</h4>
                <p className="text-sm text-muted-foreground max-w-[280px] mt-2">
                  We are preparing the audit infrastructure to display all
                  system interactions logged by {staff.name}. This feature will
                  be available soon.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
