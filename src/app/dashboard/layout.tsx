import React from "react";
import { DashboardSidebar } from "@/components/ui/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] pt-16 md:pt-0">
      {/* Sidebar - hides on mobile, converts to sticky bottom nav */}
      <DashboardSidebar isAdmin={false} />
      
      {/* Dynamic Sub-Page Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
