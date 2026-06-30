"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isDashboardOrAdmin = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/auth");

  return (
    <div className="flex flex-col min-h-screen bg-navy-dark text-slate-100 bg-mesh bg-grid">
      {!isDashboardOrAdmin && <Navbar />}
      <main className={`flex-1 flex flex-col ${!isDashboardOrAdmin ? "pt-16" : ""}`}>
        {children}
      </main>
      {!isDashboardOrAdmin && <Footer />}
    </div>
  );
};
