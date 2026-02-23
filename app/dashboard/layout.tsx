import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminTopbar } from "@/components/admin-topbar";
import { PermissionGuard } from "@/components/permission-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80">
        <AdminSidebar />
      </div>
      <main className="md:pl-72 pb-10">
        <AdminTopbar />
        <div className="px-4 py-6 md:px-8">
          <PermissionGuard>{children}</PermissionGuard>
        </div>
      </main>
    </div>
  );
}
