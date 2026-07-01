"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { Lock, Mail, ShieldAlert, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Parse redirect errors from NextAuth URL
  const error = searchParams.get("error");
  useEffect(() => {
    if (error) {
      toast("Authentication Failed", "Please check your credentials and try again.", "error");
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Input required", "Please fill in all email and password fields.", "info");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/dashboard",
      });

      if (res?.error) {
        toast("Login Error", res.error, "error");
      } else {
        toast("Success", "Selamat datang kembali di Rumah Digital!", "success");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      toast("Error", "Something went wrong during sign in.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
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
              <span className="text-white font-extrabold text-sm">RD</span>
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Rumah<span className="text-cyan-400"> Digital</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-100">Selamat Datang Kembali</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in untuk mendapatkan tiket dan sertifikat</p>
        </div>

        <div className="glass rounded-3xl border border-white/5 p-8 shadow-2xl bg-navy-card/60">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="name@example.com"
                  className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Lupa Password?
                </Link>
              </div>
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
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0b1626] px-3 text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {/* Google Icon */}
            <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12v2.7h5.38C16.88,16.63,14.77,18,12,18a6,6,0,1,1,0-12,5.77,5.77,0,0,1,4.07,1.67l2.03-2.03A8.77,8.77,0,0,0,12,3a9,9,0,1,0,9,9A8.43,8.43,0,0,0,21.35,11.1Z" fill="#fff" />
              </g>
            </svg>
            <span>Google Workspace</span>
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
            Register now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
