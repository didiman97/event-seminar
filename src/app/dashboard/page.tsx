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
    ticketsCount: 0,
    certificatesCount: 0,
    transactionsCount: 0,
    points: 0
  });

  const [badges, setBadges] = useState([
    { name: "Penjelajah Awal", desc: "Terdaftar untuk webinar pertama Anda.", icon: Zap, unlocked: false },
    { name: "VIP Premium", desc: "Membeli tiket VIP atau Berbayar.", icon: Trophy, unlocked: false },
    { name: "Lulusan Teknologi", desc: "Memperoleh sertifikat kelulusan terverifikasi.", icon: Award, unlocked: false },
    { name: "Kontributor Alfa", desc: "Menghadiri 5+ event.", icon: Shield, unlocked: false }
  ]);

  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch user tickets
        const ticketsRes = await fetch("/api/user/tickets");
        const ticketsData = await ticketsRes.json();

        // Fetch user transactions
        const transRes = await fetch("/api/user/transactions");
        const transData = await transRes.json();

        if (ticketsRes.ok && transRes.ok) {
          const userTickets = ticketsData.tickets || [];
          const userTransactions = transData.transactions || [];

          // 1. Calculate stats
          const activeTickets = userTickets.filter((t: any) => t.status === "ACTIVE");
          
          const currentTime = new Date().getTime();
          const completedTickets = activeTickets.filter((t: any) => t.checkedIn === true);

          const certificatesCount = completedTickets.length;
          const ticketsCount = activeTickets.length;
          const transactionsCount = userTransactions.length;

          // Points formula: 50 points per registration + 100 points per certificate completed
          const points = (activeTickets.length * 50) + (certificatesCount * 100);

          setStats({
            ticketsCount,
            certificatesCount,
            transactionsCount,
            points
          });

          // 2. Determine achievements/badges
          setBadges([
            { 
              name: "Penjelajah Awal", 
              desc: "Terdaftar untuk webinar pertama Anda.", 
              icon: Zap, 
              unlocked: activeTickets.length > 0 
            },
            { 
              name: "VIP Premium", 
              desc: "Membeli tiket VIP atau Berbayar.", 
              icon: Trophy, 
              unlocked: activeTickets.some((t: any) => t.ticketType === "PAID" || t.ticketType === "VIP") 
            },
            { 
              name: "Lulusan Teknologi", 
              desc: "Memperoleh sertifikat kelulusan terverifikasi.", 
              icon: Award, 
              unlocked: certificatesCount > 0 
            },
            { 
              name: "Kontributor Alfa", 
              desc: "Menghadiri 5+ event.", 
              icon: Shield, 
              unlocked: completedTickets.length >= 5 
            }
          ]);

          // 3. Compile timeline activity
          const compiledActivity: any[] = [];

          // Add registration activity
          activeTickets.slice(0, 2).forEach((t: any) => {
            compiledActivity.push({
              type: "TICKET",
              text: `Terdaftar untuk event: ${t.eventTitle}`,
              date: new Date(t.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
              })
            });
          });

          // Add certificate generation activity
          completedTickets.slice(0, 2).forEach((t: any) => {
            compiledActivity.push({
              type: "CERTIFICATE",
              text: `Sertifikat diterbitkan: #${t.ticketNumber}`,
              date: t.eventDate
            });
          });

          // Add transactions activity
          userTransactions.slice(0, 2).forEach((tx: any) => {
            compiledActivity.push({
              type: "PAYMENT",
              text: `Transaksi ${tx.paymentStatus} sebesar IDR ${tx.amount.toLocaleString()}`,
              date: new Date(tx.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short"
              })
            });
          });

          // Fallback if no activity is found
          if (compiledActivity.length === 0) {
            compiledActivity.push({
              type: "INFO",
              text: "Selamat datang di SeminarVerse! Ikuti event pertama Anda untuk mulai mengisi riwayat aktivitas.",
              date: "Baru saja"
            });
          }

          setActivity(compiledActivity.slice(0, 5));
        }
      } catch (err) {
        console.error("Dashboard overview fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

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
          Selamat datang kembali, {session?.user?.name || "Peserta"}!
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
          Kelola webinar aktif Anda, periksa riwayat transaksi Midtrans, dan unduh sertifikat penyelesaian Anda.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tiket Saya", value: stats.ticketsCount, icon: Calendar, color: "text-cyan-400" },
          { label: "Sertifikat", value: stats.certificatesCount, icon: Award, color: "text-emerald-400" },
          { label: "Pembayaran", value: stats.transactionsCount, icon: CreditCard, color: "text-purple-400" },
          { label: "Poin Pengguna", value: stats.points, icon: Trophy, color: "text-yellow-400" }
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
            <h3 className="text-sm font-bold text-slate-200">Riwayat Aktivitas Terbaru</h3>
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
              <span>Pencapaian yang Diperoleh</span>
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
