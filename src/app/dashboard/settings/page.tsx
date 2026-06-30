"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Shield, ShieldAlert, KeyRound, RefreshCw, Upload } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [loading, setLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast("Input required", "Please enter a valid name and email.", "info");
      return;
    }

    setLoading(true);
    // Simulate API update database records
    setTimeout(async () => {
      setLoading(false);
      // Trigger NextAuth update session client callback
      await update({ name });
      toast("Profile Updated", "Your account credentials have been successfully updated.", "success");
    }, 1500);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast("Passwords required", "Please specify both your current and new passwords.", "info");
      return;
    }

    setPassLoading(true);
    setTimeout(() => {
      setPassLoading(false);
      setOldPassword("");
      setNewPassword("");
      toast("Password Changed", "Your password has been modified successfully.", "success");
    }, 1500);
  };

  const handleSimulateAvatarUpload = () => {
    toast("Cloudinary Upload Triggered", "Uploading image file to Cloudinary assets storage...", "info");
    
    setTimeout(async () => {
      const mockImage = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150`;
      await update({ image: mockImage });
      toast("Avatar Image Configured", "Your profile photo has been updated.", "success");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white">Account Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage profile configurations and security access credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile form */}
          <div className="glass rounded-2xl border border-white/5 p-6 bg-navy-card/35 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <User className="h-4.5 w-4.5 text-primary" />
              <span>Personal Details</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                    className="bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-500 w-full cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/80 border border-primary/20 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <span>Update Info</span>}
              </button>
            </form>
          </div>

          {/* Password form */}
          <div className="glass rounded-2xl border border-white/5 p-6 bg-navy-card/35 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <KeyRound className="h-4.5 w-4.5 text-cyan-400" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="bg-primary hover:bg-primary/80 border border-primary/20 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow disabled:opacity-50 flex items-center gap-1.5"
              >
                {passLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <span>Update Password</span>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col - Avatar Upload Details */}
        <div className="space-y-6">
          <div className="glass rounded-2xl border border-white/5 p-6 bg-navy-card/45 text-center space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Avatar Image</h3>
            <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border border-white/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "Member")}`}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Platform Role</p>
              <span className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/30 text-cyan-400 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase mt-1">
                <Shield className="h-3 w-3 text-cyan-400" />
                <span>{(session?.user as any)?.role || "PARTICIPANT"}</span>
              </span>
            </div>
            <button
              onClick={handleSimulateAvatarUpload}
              className="w-full glass hover:bg-white/5 border border-white/10 text-cyan-400 text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Upload className="h-4.5 w-4.5" />
              <span>Upload Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
