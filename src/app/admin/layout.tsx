import React from "react";
import { DashboardSidebar } from "@/components/ui/DashboardSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] pt-16 md:pt-0">
      {/* Admin navigation bar - bottom nav on mobile */}
      <DashboardSidebar isAdmin={true} />
      
      {/* Content pane */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
