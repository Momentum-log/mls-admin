"use client";

import { useMe } from "@/hooks/auth/use-auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Mail, User, HelpCircle } from "lucide-react";
import { DocsViewer } from "./DocsViewer";
import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileDetails } from "./ProfileDetails";
import { PasswordChange } from "./PasswordChange";
import { ActivityLogs } from "./ActivityLogs";

interface AdminProfileDrawerProps {
  children: ReactNode;
}

/**
 * Displayed in the drawer footer. Kept in one place so it cannot drift from
 * `package.json` the way a hardcoded string did.
 */
const APP_VERSION = "1.6.0";

/**
 * AdminProfileDrawer Component
 * A slide-out drawer triggered by the admin profile that shows user details
 * and the comprehensive dynamic system guide.
 */
export function AdminProfileDrawer({ children }: AdminProfileDrawerProps) {
  const { data: user } = useMe();

  const getInitials = (name?: string): string => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col gap-0 border-l border-border/40"
      >
        <SheetHeader className="p-6 text-left bg-muted/30 border-b border-border/40">
          <SheetTitle className="text-xl font-bold tracking-tight mb-4">
            Admin Profile
          </SheetTitle>

          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-white shadow-sm ring-2 ring-brand-blue/10">
              <AvatarImage src={user?.avatarUrl} alt={user?.name} />
              <AvatarFallback className="bg-brand-blue text-white text-xl font-bold">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col space-y-1.5 pt-1">
              <h3 className="text-lg font-bold leading-none text-foreground">
                {user?.name}
              </h3>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Badge
                  variant="secondary"
                  className="bg-brand-blue/10 text-brand-blue border-none hover:bg-brand-blue/20 transition-colors px-2 py-0.5 h-6"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {user?.role}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-8">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger
                value="profile"
                className="rounded-lg text-xs font-medium"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-lg text-xs font-medium"
              >
                Security
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="rounded-lg text-xs font-medium"
              >
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0 outline-none">
              <ProfileDetails />
            </TabsContent>

            <TabsContent value="security" className="mt-0 outline-none">
              <PasswordChange />
            </TabsContent>

            <TabsContent value="activity" className="mt-0 outline-none">
              <ActivityLogs />
            </TabsContent>
          </Tabs>

          <div className="mt-12 mb-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
              <HelpCircle className="h-4 w-4 text-brand-blue" />
              System Documentation
            </h4>
            <DocsViewer />
          </div>
        </ScrollArea>

        <div className="p-6 bg-muted/30 border-t border-border/40 text-[10px] text-center text-muted-foreground uppercase tracking-widest font-semibold">
          Momentum Logistics Service • v{APP_VERSION}
        </div>
      </SheetContent>
    </Sheet>
  );
}
