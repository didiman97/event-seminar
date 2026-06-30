"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Calendar, Award, CreditCard, User, Shield, 
  ChevronRight, Trophy, Zap, Clock, AlertCircle 
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

interface DashboardStats {
  ticketsCount: number;
  certificatesCount: number;
  transactionsCount: number;
  points: number;
}

export default function DashboardOverviewPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    ticketsCount: 2,
    certificatesCount: 1,
    transactionsCount: 1,
    points: 120
  });

  const [badges, setBadges] = useState([
    { name: "Early Explorer", desc: "Registered for your first webinar.", icon: Zap, unlocked: true },
    { name: "Premium VIP", desc: "Purchased a VIP event pass.", icon: Trophy, unlocked: true },
    { name: "Tech Graduate", desc: "Earned a certified credential.", icon: Award, unlocked: true },
    { name: "Alpha Contributor", desc: "Attend 5+ summits.", icon: Shield, unlocked: false }
  ]);

  const [activity, setActivity] = useState([
    { type: "TICKET", text: "Registered for AI & Deep Learning Summit", date: "Today, 10:24 AM" },
    { type: "PAYMENT", text: "Transaction SETTLEMENT verified for IDR 199,000", date: "Yesterday, 3:15 PM" },
    { type: "CERTIFICATE", text: "Generated Certificate #SV-AI-2026", date: "June 25, 2026" }
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl border border-white/5 bg-gradient-to-r from-primary/10 to-accent/5 p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-400/5 rounded-full blur-3xl" />
        <h1 className="text-xl sm:text-2xl font-extrabold text-white">
          Welcome back, {session?.user?.name || "Participant"}!
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
          Manage your active webinar slots, check Midtrans transaction receipts, and download your verification certificates.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Tickets", value: stats.ticketsCount, icon: Calendar, color: "text-cyan-400" },
          { label: "Certificates", value: stats.certificatesCount, icon: Award, color: "text-emerald-400" },
          { label: "Payments", value: stats.transactionsCount, icon: CreditCard, color: "text-purple-400" },
          { label: "User Points", value: stats.points, icon: Trophy, color: "text-yellow-400" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass rounded-2xl border border-white/5 p-4 flex items-center gap-4 bg-navy-card/35">
              <div className={`p-3 bg-white/5 rounded-xl ${stat.color} border border-white/5`}>
                <Icon className="h-5 w-5 text-glow" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">{stat.label}</span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-100 mt-0.5 block">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges and Activity layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col - Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-2xl border border-white/5 p-5 bg-navy-card/20 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Recent Activity Timeline</h3>
            <div className="relative border-l border-white/5 pl-4 space-y-5 py-2">
              {activity.map((act, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline bullet dot */}
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-cyan-400 text-glow border border-[#07111F]" />
                  <div className="space-y-1">
                    <p className="text-xs text-slate-300 font-medium">{act.text}</p>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{act.date}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col - Gamification Badges */}
        <div className="space-y-4">
          <div className="glass rounded-2xl border border-white/5 p-5 bg-navy-card/25 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Trophy className="h-4.5 w-4.5 text-yellow-400" />
              <span>Earned Achievements</span>
            </h3>
            <div className="space-y-3">
              {badges.map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                      badge.unlocked 
                        ? "bg-white/[0.02] border-white/5" 
                        : "bg-black/10 border-white/5 opacity-40 select-none"
                    }`}
                  >
                    <div className={`p-2 rounded-lg border ${
                      badge.unlocked 
                        ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" 
                        : "bg-white/5 border-transparent text-slate-500"
                    }`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{badge.name}</h4>
                      <p className="text-[9px] text-slate-500 truncate leading-relaxed mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
