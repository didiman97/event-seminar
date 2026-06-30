"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { Mail, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast("Email required", "Please specify your registered account email.", "info");
      return;
    }

    setLoading(true);
    // Simulate API request delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast("Instructions Sent", "If the email is registered, password instructions will be sent.", "success");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-mesh bg-grid">
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
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
          <h2 className="text-2xl font-bold text-slate-100">Reset Password</h2>
          <p className="text-xs text-slate-400 mt-1">We will send instructions to restore your account access</p>
        </div>

        <div className="glass rounded-3xl border border-white/5 p-8 shadow-2xl bg-navy-card/60">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Registered Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600"
                  />
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
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-full">
                <ShieldCheck className="h-6 w-6 text-glow" />
              </div>
              <h4 className="text-md font-bold text-slate-200">Email Dispatched</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                If `<strong>{email}</strong>` exists in our system, you will receive password reset instructions shortly.
              </p>
            </div>
          )}

          <div className="border-t border-white/5 pt-4 mt-6">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
