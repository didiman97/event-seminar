"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bell, Compass, LayoutDashboard, LogOut, Menu, Shield, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const links = [
    { name: "Explore Events", href: "/events", icon: Compass },
    { name: "Blog", href: "/blog", icon: Compass },
    { name: "Verify Certificate", href: "/certificate/verify", icon: Compass },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#07111F]/70 backdrop-blur-md border-b border-white/5 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-primary to-accent h-9 w-9 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 border border-white/10">
              <span className="text-white font-extrabold text-sm tracking-tighter">SV</span>
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
              Seminar<span className="text-cyan-400">Verse</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex gap-6 items-center">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-cyan-400 ${
                    active ? "text-cyan-400 font-semibold" : "text-slate-300"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Authentication Action Controls */}
          <div className="hidden md:flex gap-4 items-center">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm focus:outline-none p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
                >
                  {session.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt="avatar"
                      className="h-8 w-8 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <User className="h-4 w-4 text-cyan-400" />
                    </div>
                  )}
                  <span className="text-slate-200 font-medium max-w-[120px] truncate">
                    {session.user?.name || "Member"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 glass rounded-xl shadow-2xl border border-white/10 z-20 py-2 overflow-hidden"
                      >
                        <div className="px-4 py-2 border-b border-white/5">
                          <p className="text-xs text-slate-500">Logged in as</p>
                          <p className="text-sm font-semibold text-slate-200 truncate">{session.user?.email}</p>
                        </div>

                        {/* Admin link if has admin role */}
                        {(session.user as any)?.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                          >
                            <Shield className="h-4 w-4 text-cyan-400" />
                            <span>Admin Panel</span>
                          </Link>
                        )}

                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-primary" />
                          <span>User Dashboard</span>
                        </Link>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleSignOut();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary hover:bg-primary/80 border border-primary/20 shadow-lg shadow-primary/10 hover:shadow-primary/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center gap-2">
            {session && (
              <Link href="/dashboard/notifications" className="p-1.5 rounded-lg text-slate-400 hover:text-white">
                <Bell className="h-5 w-5" />
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-400 hover:text-white focus:outline-none p-1.5 rounded-lg hover:bg-white/5"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-[#07111F]/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-2">
              {links.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-xl text-base font-medium hover:bg-white/5 transition-colors ${
                      active ? "text-cyan-400 bg-white/5" : "text-slate-300"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-white/5 space-y-2">
                {session ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      {session.user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={session.user.image}
                          alt="avatar"
                          className="h-10 w-10 rounded-full border border-white/20"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                          <User className="h-5 w-5 text-cyan-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-slate-200 font-semibold">{session.user?.name}</p>
                        <p className="text-xs text-slate-500">{session.user?.email}</p>
                      </div>
                    </div>

                    {(session.user as any)?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="block px-3 py-2 rounded-xl text-base font-medium text-cyan-400 hover:bg-white/5"
                      >
                        Admin Control Panel
                      </Link>
                    )}

                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 rounded-xl text-base font-medium text-primary hover:bg-white/5"
                    >
                      User Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleSignOut();
                      }}
                      className="w-full text-left block px-3 py-2 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3 px-3">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className="block text-center py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsOpen(false)}
                      className="block text-center py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/80"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
