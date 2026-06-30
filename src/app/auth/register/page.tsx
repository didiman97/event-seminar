"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { User, Mail, Lock, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PARTICIPANT");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast("Fields required", "Please fill in all the input fields.", "info");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();

      if (!res.ok) {
        toast("Registration Failed", data.error || "Failed to register.", "error");
      } else {
        toast("Registered Successfully", "You can now log in with your credentials.", "success");
        router.push("/auth/login");
      }
    } catch (err) {
      toast("Error", "Something went wrong during registration.", "error");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "PARTICIPANT", label: "Participant", desc: "Browse events, buy tickets, download certificates." },
    { value: "SPEAKER", label: "Speaker", desc: "Present webinar topics, display bios on listings." },
    { value: "EDITOR", label: "Editor / Organizer", desc: "Draft events and publish blogs." }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-mesh bg-grid">
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg z-10 my-8"
      >
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="bg-gradient-to-tr from-primary to-accent h-9 w-9 rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-primary/20">
              <span className="text-white font-extrabold text-sm">SV</span>
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Seminar<span className="text-cyan-400">Verse</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-100">Create Account</h2>
          <p className="text-xs text-slate-400 mt-1">Join SeminarVerse to discover global summits and manage certificates</p>
        </div>

        <div className="glass rounded-3xl border border-white/5 p-8 shadow-2xl bg-navy-card/60">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Role Select Cards */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select Platform Role</label>
              <div className="grid grid-cols-1 gap-2.5">
                {roles.map((r) => {
                  const selected = role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`text-left p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        selected
                          ? "bg-primary/10 border-primary shadow-lg shadow-primary/5"
                          : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                      }`}
                    >
                      <div className="pr-4">
                        <span className="text-xs font-bold text-slate-200 block">{r.label}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-relaxed">{r.desc}</span>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                          selected ? "bg-primary border-primary text-white" : "border-white/20"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/80 border border-primary/20 text-white font-semibold text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 shadow-lg shadow-primary/10 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
