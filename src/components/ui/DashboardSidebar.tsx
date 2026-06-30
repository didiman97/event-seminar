"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  User, Calendar, CreditCard, LayoutDashboard, Settings, 
  Ticket, Shield, BookOpen, Users, Award, Gift 
} from "lucide-react";

interface SidebarProps {
  isAdmin?: boolean;
}

export const DashboardSidebar: React.FC<SidebarProps> = ({ isAdmin = false }) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Participant Links
  const participantLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Events", href: "/dashboard/events", icon: Calendar },
    { name: "My Tickets", href: "/dashboard/tickets", icon: Ticket },
    { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  // Admin Links
  const adminLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Events", href: "/admin/events", icon: Calendar },
    { name: "Speakers", href: "/admin/speakers", icon: Users },
    { name: "Blogs", href: "/admin/blogs", icon: BookOpen },
    { name: "Vouchers", href: "/admin/vouchers", icon: Gift },
    { name: "Users", href: "/admin/users", icon: Shield },
    { name: "Certificates", href: "/admin/certificates", icon: Award },
  ];

  const links = isAdmin ? adminLinks : participantLinks;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-white/5 h-[calc(100vh-4rem)] sticky top-16 p-4 justify-between bg-navy-card/30">
        <div className="space-y-6">
          <div className="px-3 py-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              {isAdmin ? "Admin Console" : "Participant Center"}
            </span>
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active 
                      ? "bg-primary/20 text-cyan-400 border border-primary/30 text-glow" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${active ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Mini Profile */}
        <div className="border-t border-white/5 pt-4 px-2 flex items-center gap-3">
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt="avatar"
              className="h-9 w-9 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <User className="h-4.5 w-4.5 text-cyan-400" />
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <h5 className="text-xs font-bold text-slate-200 truncate">{session?.user?.name || "Participant"}</h5>
            <p className="text-[10px] text-slate-500 truncate">{session?.user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07111F]/90 backdrop-blur-lg border-t border-white/10 flex justify-around items-center h-16 px-2 shadow-2xl">
        {links.slice(0, 5).map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-semibold transition-all ${
                active ? "text-cyan-400 text-glow" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon className={`h-5 w-5 mb-0.5 ${active ? "text-cyan-400" : "text-slate-500"}`} />
              <span className="truncate max-w-[65px]">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
