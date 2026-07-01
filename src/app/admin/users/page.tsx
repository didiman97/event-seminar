"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Users, Shield, User, Edit, Search, 
  Trash2, Mail, CheckCircle2, RefreshCw,
  ShieldCheck, AlertCircle, Info, Lock, Check
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "SPEAKER" | "PARTICIPANT";
  isApproved: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Load database users
  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat pengguna");
      setUsers(data);
      if (data.length > 0 && !selectedUser) {
        setSelectedUser(data[0]);
      }
    } catch (err: any) {
      console.error(err);
      toast("Gagal Memuat", err.message || "Gagal mengambil data dari server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserItem["role"]) => {
    setUpdatingId(userId);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal memperbarui peran");

      // Update state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      // Keep selected user sync
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }

      toast("Role Diperbarui", `Peran pengguna berhasil diubah ke ${newRole}.`, "success");
    } catch (err: any) {
      toast("Gagal Memperbarui", err.message || "Terjadi kesalahan.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApprovalToggle = async (userId: string, currentApproved: boolean) => {
    setUpdatingId(userId);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentApproved })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal mengubah status approval");

      // Update state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isApproved: !currentApproved } : u))
      );

      // Keep selected user sync
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, isApproved: !currentApproved });
      }

      toast("Status Diubah", `Persetujuan akun berhasil diperbarui.`, "success");
    } catch (err: any) {
      toast("Gagal Mengubah", err.message || "Terjadi kesalahan.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus akun pengguna ini?")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal menghapus pengguna");

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
      toast("User Dihapus", "Akun pengguna telah dihapus dari sistem.", "success");
    } catch (err: any) {
      toast("Gagal Menghapus", err.message || "Terjadi kesalahan.", "error");
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Accessible features list config based on roles
  const getRolePermissions = (role: UserItem["role"]) => {
    switch (role) {
      case "ADMIN":
        return [
          { name: "Kelola Pengguna (User Management)", allowed: true },
          { name: "Pengaturan Website Hero & Brand Logo", allowed: true },
          { name: "Manajemen FAQ Landing Page", allowed: true },
          { name: "Absensi & QR Scan Peserta", allowed: true },
          { name: "Manajemen Event & Voucher", allowed: true },
          { name: "Unduh / Edit Desain Sertifikat", allowed: true },
          { name: "Kelola Blog & Pembicara", allowed: true }
        ];
      case "EDITOR":
        return [
          { name: "Kelola Pengguna (User Management)", allowed: false },
          { name: "Pengaturan Website Hero & Brand Logo", allowed: false },
          { name: "Manajemen FAQ Landing Page", allowed: true },
          { name: "Absensi & QR Scan Peserta", allowed: false },
          { name: "Manajemen Event & Voucher", allowed: true },
          { name: "Unduh / Edit Desain Sertifikat", allowed: true },
          { name: "Kelola Blog & Pembicara", allowed: true }
        ];
      case "SPEAKER":
        return [
          { name: "Kelola Pengguna (User Management)", allowed: false },
          { name: "Pengaturan Website Hero & Brand Logo", allowed: false },
          { name: "Manajemen FAQ Landing Page", allowed: false },
          { name: "Absensi & QR Scan Peserta", allowed: false },
          { name: "Mengisi Presentasi / Webinar", allowed: true },
          { name: "Melihat Info Kelas Pembicara", allowed: true },
          { name: "Kelola Blog & Pembicara", allowed: false }
        ];
      case "PARTICIPANT":
      default:
        return [
          { name: "Akses Dashboard Pengguna", allowed: true },
          { name: "Pendaftaran Kelas / Event", allowed: true },
          { name: "Riwayat Pembayaran Midtrans", allowed: true },
          { name: "Absensi Check-in Event", allowed: true },
          { name: "Unduh Sertifikat Kelulusan", allowed: true }
        ];
    }
  };

  if (session && (session.user as any).role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 animate-pulse" />
        <h2 className="text-lg font-bold text-slate-200">Akses Ditolak</h2>
        <p className="text-xs text-slate-500 max-w-xs">Halaman ini dilindungi. Hanya akun Administrator yang dapat mengakses.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Users className="h-6 w-6 text-cyan-400 text-glow" />
          <span>User Management</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Kelola lisensi keanggotaan pengguna dan konfigurasikan tingkat hak akses fitur (Role-Based Access Control).</p>
      </div>

      {/* Grid Layout containing Table and Rights guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table Ledger Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama atau email..."
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-700"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="glass rounded-2xl border border-white/5 overflow-hidden bg-navy-card/20">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 uppercase tracking-widest font-bold">
                      <th className="px-6 py-4">Nama Lengkap</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Peran (Role)</th>
                      <th className="px-6 py-4">Status Approval</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {filteredUsers.map((u) => {
                      const isSelected = selectedUser?.id === u.id;
                      return (
                        <tr 
                          key={u.id} 
                          onClick={() => setSelectedUser(u)}
                          className={`cursor-pointer hover:bg-white/[0.02] transition-colors ${
                            isSelected ? "bg-white/[0.03] border-l-4 border-cyan-400" : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-100 block">{u.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono block">Registered: {new Date(u.createdAt).toLocaleDateString("id-ID")}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-mono">{u.email}</td>
                          <td className="px-6 py-4">
                            {updatingId === u.id ? (
                              <div className="flex items-center gap-1.5 text-cyan-400 text-[10px]">
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                <span>Updating...</span>
                              </div>
                            ) : (
                              <select
                                value={u.role}
                                onClick={(e) => e.stopPropagation()} // Prevent selecting user
                                onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                                className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 focus:outline-none font-semibold cursor-pointer"
                              >
                                <option value="ADMIN" className="bg-[#0b1626]">ADMIN</option>
                                <option value="EDITOR" className="bg-[#0b1626]">EDITOR</option>
                                <option value="SPEAKER" className="bg-[#0b1626]">SPEAKER</option>
                                <option value="PARTICIPANT" className="bg-[#0b1626]">PARTICIPANT</option>
                              </select>
                            )}
                          </td>
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            {u.role === "SPEAKER" || u.role === "EDITOR" ? (
                              <button
                                onClick={() => handleApprovalToggle(u.id, u.isApproved)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                  u.isApproved
                                    ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                                    : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 animate-pulse"
                                }`}
                              >
                                {u.isApproved ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    <span>Approved</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-3 w-3" />
                                    <span>Approve Now</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-semibold italic">Approved (Auto)</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            {u.id !== (session?.user as any)?.id && u.role !== "ADMIN" ? (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="glass hover:bg-red-500/10 border border-white/10 p-2 rounded-lg text-red-400 hover:border-red-500/20 transition-all cursor-pointer"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-semibold uppercase italic mr-2">Protected</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl border border-white/5 p-12 text-center">
              <p className="text-slate-400 text-sm">Tidak ada data pengguna ditemukan.</p>
            </div>
          )}
        </div>

        {/* Dynamic Permissions guide panel */}
        <div className="space-y-4">
          <div className="glass rounded-2xl border border-white/5 p-6 bg-navy-card/20 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-3">
              <Info className="h-4.5 w-4.5 text-cyan-400" />
              <span>Detail Fitur & Akses</span>
            </h2>

            {selectedUser ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">{selectedUser.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{selectedUser.email}</p>
                  <span className="bg-primary/20 border border-primary/30 text-cyan-400 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mt-2 inline-block">
                    Role: {selectedUser.role}
                  </span>

                  {selectedUser.role !== "PARTICIPANT" && selectedUser.role !== "ADMIN" && (
                    <div className="mt-3 p-3 rounded-xl border bg-navy-card/40 border-white/5 space-y-2">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">Status Persetujuan Admin:</span>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          selectedUser.isApproved
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400 animate-pulse"
                        }`}>
                          {selectedUser.isApproved ? "Aktif & Disetujui" : "Menunggu Approval"}
                        </span>
                        <button
                          onClick={() => handleApprovalToggle(selectedUser.id, selectedUser.isApproved)}
                          className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[9px] font-bold px-2 py-1 rounded-lg cursor-pointer"
                        >
                          Ubah Status
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1">
                    Daftar Fitur yang Diakses:
                  </span>
                  
                  {getRolePermissions(selectedUser.role).map((perm, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      {perm.allowed ? (
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-slate-600 shrink-0 mt-1" />
                      )}
                      <span className={perm.allowed ? "text-slate-300 font-medium" : "text-slate-500 line-through"}>
                        {perm.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6 leading-relaxed">
                Pilih salah satu pengguna dari tabel di sebelah kiri untuk meninjau status detail perannya.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
