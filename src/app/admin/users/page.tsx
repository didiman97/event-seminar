"use client";

import React, { useState } from "react";
import { 
  Users, Shield, User, Edit, Search, 
  Trash2, Mail, CheckCircle2, RefreshCw 
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "SPEAKER" | "PARTICIPANT";
  createdAt: string;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserItem[]>([
    { id: "u-1", name: "Admin SeminarVerse", email: "admin@seminarverse.com", role: "ADMIN", createdAt: "2026-06-01" },
    { id: "u-2", name: "John Doe", email: "user@seminarverse.com", role: "PARTICIPANT", createdAt: "2026-06-15" },
    { id: "u-3", name: "Dr. Sarah Jenkins", email: "sarah@gmail.com", role: "SPEAKER", createdAt: "2026-06-10" },
    { id: "u-4", name: "Elena Rostova", email: "elena@vercel.com", role: "EDITOR", createdAt: "2026-06-12" }
  ]);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleRoleChange = (userId: string, newRole: any) => {
    setUpdatingId(userId);
    
    // Simulate database update delay
    setTimeout(() => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setUpdatingId(null);
      toast("Role Updated", `User role changed to ${newRole} successfully.`, "success");
    }, 1000);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    toast("User Deleted", "The user account has been removed.", "success");
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white">User Management</h1>
        <p className="text-xs text-slate-400 mt-1">Review accounts directory and configure role-based access controls</p>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name or email..."
          className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-700"
        />
      </div>

      {/* Users Ledger Table */}
      {filteredUsers.length > 0 ? (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden bg-navy-card/20">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4">Assigned Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-100">{u.name}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{u.email}</td>
                    <td className="px-6 py-4 text-slate-400">{u.createdAt}</td>
                    <td className="px-6 py-4">
                      {updatingId === u.id ? (
                        <div className="flex items-center gap-1.5 text-cyan-400 text-[10px]">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Updating...</span>
                        </div>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 focus:outline-none font-semibold cursor-pointer"
                        >
                          <option value="ADMIN" className="bg-[#0b1626]">ADMIN</option>
                          <option value="EDITOR" className="bg-[#0b1626]">EDITOR</option>
                          <option value="SPEAKER" className="bg-[#0b1626]">SPEAKER</option>
                          <option value="PARTICIPANT" className="bg-[#0b1626]">PARTICIPANT</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== "ADMIN" ? (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="glass hover:bg-red-500/10 border border-white/10 p-2 rounded-lg text-red-400 hover:border-red-500/20 transition-all"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold uppercase italic mr-2">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 p-12 text-center max-w-md mx-auto my-12">
          <p className="text-slate-400 text-sm">No user accounts found matching your query.</p>
        </div>
      )}
    </div>
  );
}
