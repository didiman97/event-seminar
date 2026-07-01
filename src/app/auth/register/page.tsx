"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { User, Mail, Lock, ArrowRight, Check, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PARTICIPANT");
  const [loading, setLoading] = useState(false);

  // Speaker Form Fields
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [bio, setBio] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [avatarImage, setAvatarImage] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("File Tidak Valid", "Silakan pilih file gambar (PNG, JPG).", "error");
      return;
    }

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatarPreview(base64String);
      setAvatarImage(base64String);
      setUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast("Fields required", "Please fill in all the input fields.", "info");
      return;
    }

    if (role === "SPEAKER") {
      if (!company || !position || !bio) {
        toast("Speaker Data Required", "Silakan isi Company, Position, dan Bio Anda.", "info");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, password, role,
          company, position, bio,
          twitter, linkedin, github,
          avatarImage
        })
      });
      const data = await res.json();

      if (!res.ok) {
        toast("Registration Failed", data.error || "Failed to register.", "error");
      } else {
        if (role === "SPEAKER" || role === "EDITOR") {
          toast("Pendaftaran Berhasil", "Akun Anda sedang menunggu persetujuan (approval) admin sebelum dapat masuk.", "success");
        } else {
          toast("Registered Successfully", "You can now log in with your credentials.", "success");
        }
        router.push("/auth/login");
      }
    } catch (err) {
      toast("Error", "Something went wrong during registration.", "error");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "PARTICIPANT", label: "Peserta", desc: "Browse events, buy tickets, download certificates." },
    { value: "SPEAKER", label: "Pembicara", desc: "Present webinar topics, display bios on listings." },
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
              Rumah<span className="text-cyan-400"> Digital</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-100">Daftar Akun</h2>
          <p className="text-xs text-slate-400 mt-1">Daftar Rumah Digital untuk Mendengarkan Seminar dari Pakarnya</p>
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
              <label className="text-xs font-semibold text-slate-300">Pilih Role</label>
              <div className="grid grid-cols-1 gap-2.5">
                {roles.map((r) => {
                  const selected = role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`text-left p-3.5 rounded-xl border flex items-center justify-between transition-all ${selected
                        ? "bg-primary/10 border-primary shadow-lg shadow-primary/5"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                        }`}
                    >
                      <div className="pr-4">
                        <span className="text-xs font-bold text-slate-200 block">{r.label}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-relaxed">{r.desc}</span>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${selected ? "bg-primary border-primary text-white" : "border-white/20"
                          }`}
                      >
                        {selected && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Speaker Extra Form Fields */}
            {role === "SPEAKER" && (
              <div className="space-y-4 border-t border-white/5 pt-4">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Profil Pembicara</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Company / Org</label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Google DeepMind"
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 w-full focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Position / Job Title</label>
                    <input
                      type="text"
                      required
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g. Senior AI Researcher"
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 w-full focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Avatar Image (Upload)</label>
                  <div className="relative border border-dashed border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.02] transition-all">
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreview} alt="Avatar preview" className="h-16 w-16 rounded-full object-cover mb-3 border border-white/5 bg-[#0b1626] p-1" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-3 text-slate-500 text-xs">
                        No Photo
                      </div>
                    )}
                    <label className="bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold px-3 py-1.5 rounded-lg text-slate-300 cursor-pointer flex items-center gap-1 shadow">
                      {uploadingAvatar ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <span>Pilih Gambar</span>
                      )}
                      <input type="file" onChange={handleAvatarChange} accept="image/*" className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Biography Details</label>
                  <textarea
                    required
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Provide a brief summary of your background..."
                    rows={3}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 w-full focus:outline-none focus:border-cyan-400 placeholder:text-slate-600 resize-none"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-xs font-semibold text-slate-300 block">Social Media Links</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Twitter</span>
                      <input
                        type="text"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="https://..."
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 w-full focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">LinkedIn</span>
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://..."
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 w-full focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">GitHub</span>
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="https://..."
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 w-full focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || uploadingAvatar}
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
