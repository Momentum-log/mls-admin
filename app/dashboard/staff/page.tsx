"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StaffTable from "./staff-table";
import RolesTable from "./roles-table";

export default function StaffPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Staff & Roles</h2>
      </div>

      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff Members</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
        </TabsList>
        <TabsContent value="staff">
          <StaffTable />
        </TabsContent>
        <TabsContent value="roles">
          <RolesTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
