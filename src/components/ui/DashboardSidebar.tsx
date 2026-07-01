"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  User, Calendar, CreditCard, LayoutDashboard, Settings, 
  Ticket, Shield, BookOpen, Users, Award, Gift, QrCode, LogOut 
} from "lucide-react";

interface SidebarProps {
  isAdmin?: boolean;
}

export const DashboardSidebar: React.FC<SidebarProps> = ({ isAdmin = false }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [logoText, setLogoText] = React.useState("SeminarVerse");
  const [logoAbbreviation, setLogoAbbreviation] = React.useState("SV");
  const [logoImageUrl, setLogoImageUrl] = React.useState("");

  React.useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setLogoText(data.logoText || "SeminarVerse");
          setLogoAbbreviation(data.logoAbbreviation || "SV");
          setLogoImageUrl(data.logoImageUrl || "");
        }
      })
      .catch((err) => console.error("Error fetching sidebar settings:", err));
  }, []);

  // Participant Links
  const participantLinks = [
    { name: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
    { name: "Event Saya", href: "/dashboard/events", icon: Calendar },
    { name: "Tiket Saya", href: "/dashboard/tickets", icon: Ticket },
    { name: "Sertifikat", href: "/dashboard/certificates", icon: Award },
    { name: "Pembayaran", href: "/dashboard/payments", icon: CreditCard },
    { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
  ];

  // Admin Links
  const adminLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Event", href: "/admin/events", icon: Calendar },
    { name: "Pembicara", href: "/admin/speakers", icon: Users },
    { name: "Absensi", href: "/admin/checkin", icon: QrCode },
    { name: "Blog", href: "/admin/blogs", icon: BookOpen },
    { name: "Voucher", href: "/admin/vouchers", icon: Gift },
    { name: "Pengguna", href: "/admin/users", icon: Shield },
    { name: "Sertifikat", href: "/admin/certificates", icon: Award },
    { name: "Pengaturan", href: "/admin/settings", icon: Settings },
  ];

  const links = isAdmin ? adminLinks : participantLinks;

  return (
    <>
      {/* Mobile Top Header Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 z-40 bg-[#07111F]/70 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          {logoImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoImageUrl} alt={logoText} className="h-8 object-contain" />
          ) : (
            <>
              <div className="bg-gradient-to-tr from-primary to-accent h-8 w-8 rounded-xl flex items-center justify-center border border-white/10 shadow-lg">
                <span className="text-white font-extrabold text-xs tracking-tighter">{logoAbbreviation}</span>
              </div>
              <span className="font-extrabold text-md tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                {logoText}
              </span>
            </>
          )}
        </Link>

        {/* Mini profile avatar and logout button on the right */}
        {session?.user && (
          <div className="flex items-center gap-2">
            <Link href="/dashboard/settings" className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt="avatar"
                  className="h-7 w-7 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-cyan-400" />
                </div>
              )}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-400 hover:text-red-300 p-1.5 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              title="Keluar"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-white/5 h-screen sticky top-0 p-4 justify-between bg-navy-card/30">
        <div className="space-y-6">
          {/* Logo link to homepage */}
          <div className="px-3 py-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              {logoImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoImageUrl} alt={logoText} className="h-8 object-contain" />
              ) : (
                <>
                  <div className="bg-gradient-to-tr from-primary to-accent h-8 w-8 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 border border-white/10 shrink-0">
                    <span className="text-white font-extrabold text-xs tracking-tighter">{logoAbbreviation}</span>
                  </div>
                  <span className="font-extrabold text-md tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                    {logoText}
                  </span>
                </>
              )}
            </Link>
          </div>

          <div className="px-3 py-1 border-t border-white/5">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              {isAdmin ? "Konsol Admin" : "Pusat Peserta"}
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

        {/* User Mini Profile & Logout */}
        <div className="border-t border-white/5 pt-4 px-2 flex flex-col gap-3">
          <div className="flex items-center gap-3">
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
              <h5 className="text-xs font-bold text-slate-200 truncate">{session?.user?.name || "Peserta"}</h5>
              <p className="text-[10px] text-slate-500 truncate">{session?.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all border border-red-500/10 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar</span>
          </button>
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
