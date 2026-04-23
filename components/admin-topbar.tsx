"use client";

import { useMe, useLogout } from "@/hooks/auth/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, LogOut, Shield } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";

import { AdminProfileDrawer } from "./admin-profile/AdminProfileDrawer";
import { HelpCircle, User } from "lucide-react";

/**
 * Admin topbar with mobile sidebar toggle and user profile dropdown.
 * Displays the logged-in admin's initials, name, email, role, and a red logout button.
 */
export function AdminTopbar() {
  const { data: user } = useMe();
  const { mutate: logout } = useLogout();

  /** Generate initials from the user's name (e.g., "Super Administrator" → "SA"). */
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
    <div className="flex items-center p-4 border-b">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-[#111827]">
            <AdminSidebar />
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex w-full justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border-2 border-transparent hover:border-brand-blue/20 transition-all">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback className="bg-brand-blue text-white text-sm font-semibold">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-semibold leading-none">
                  {user?.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <Shield className="h-3 w-3 text-brand-blue" />
                  <Badge variant="secondary" className="text-xs font-normal">
                    {user?.role}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <AdminProfileDrawer>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="cursor-pointer font-medium focus:bg-brand-blue/5"
              >
                <User className="mr-2 h-4 w-4" />
                My Profile
              </DropdownMenuItem>
            </AdminProfileDrawer>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => logout()}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
