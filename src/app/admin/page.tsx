"use client";

import React, { useState } from "react";
import { Users, DollarSign, Calendar, Gift, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalUsers: 1450,
    totalRevenue: 34500000,
    activeEvents: 8,
    vouchersUsed: 42
  });

  const recentRegistrations = [
    { name: "Andi Wijaya", email: "andi@gmail.com", event: "AI Breakthroughs 2026", type: "PAID", date: "10 mins ago" },
    { name: "Siti Rahma", email: "siti@yahoo.com", event: "Next.js App Router Masterclass", type: "FREE", date: "32 mins ago" },
    { name: "Dewi Lestari", email: "dewi@lestari.com", event: "Fintech Scaling Seminar", type: "VIP", date: "1 hr ago" }
  ];

  const categoryAnalytics = [
    { name: "Technology", count: 420, percent: "80%", color: "bg-cyan-400" },
    { name: "Finance", count: 180, percent: "45%", color: "bg-primary" },
    { name: "Marketing", count: 240, percent: "55%", color: "bg-indigo-400" },
    { name: "Design", count: 110, percent: "30%", color: "bg-purple-500" }
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-white">Admin Management console</h1>
        <p className="text-xs text-slate-400 mt-1">Monitor revenue metrics, category analytics, and active participant logs</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-cyan-400" },
          { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "text-emerald-400" },
          { label: "Active Events", value: stats.activeEvents, icon: Calendar, color: "text-primary" },
          { label: "Vouchers Redeemed", value: stats.vouchersUsed, icon: Gift, color: "text-yellow-400" }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass rounded-2xl border border-white/5 p-4 flex items-center gap-4 bg-navy-card/45">
              <div className={`p-3 bg-white/5 rounded-xl ${item.color} border border-white/5`}>
                <Icon className="h-5 w-5 text-glow" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">{item.label}</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-100 mt-0.5 block truncate">{item.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics vs Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col - Category analytics bar chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-2xl border border-white/5 p-5 bg-navy-card/25 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-cyan-400" />
              <span>Event Registration Analytics</span>
            </h3>

            {/* Custom CSS Simulated Bar Chart */}
            <div className="space-y-4 pt-2">
              {categoryAnalytics.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">{cat.name} ({cat.count} tickets)</span>
                    <span className="font-mono text-slate-400">{cat.percent}</span>
                  </div>
                  {/* Outer track */}
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    {/* Animate-width fill */}
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: cat.percent }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      className={`h-full ${cat.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col - Recent registers log */}
        <div className="space-y-4">
          <div className="glass rounded-2xl border border-white/5 p-5 bg-navy-card/25 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Recent Registrations</h3>
            <div className="space-y-3.5">
              {recentRegistrations.map((user, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-200 leading-tight">{user.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono line-clamp-1">{user.event}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block text-[8px] font-bold border px-1.5 py-0.5 rounded-full ${
                      user.type === "VIP" 
                        ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/10" 
                        : user.type === "PAID"
                          ? "text-cyan-400 border-cyan-500/20 bg-cyan-500/10"
                          : "text-slate-400 border-white/10 bg-white/5"
                    }`}>
                      {user.type}
                    </span>
                    <span className="text-[9px] text-slate-600 block mt-1">{user.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
