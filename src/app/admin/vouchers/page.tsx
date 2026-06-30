"use client";

import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, Gift, Percent, Calendar, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

interface VoucherItem {
  id: string;
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  quota: number;
  usedCount: number;
  expiryDate: string;
  active: boolean;
}

export default function AdminVouchersPage() {
  const { toast } = useToast();
  const [vouchers, setVouchers] = useState<VoucherItem[]>([
    { id: "v-1", code: "PROMO10", discountType: "PERCENT", discountValue: 10, quota: 100, usedCount: 15, expiryDate: "2026-12-31", active: true },
    { id: "v-2", code: "FREEPASS", discountType: "PERCENT", discountValue: 100, quota: 10, usedCount: 3, expiryDate: "2026-08-31", active: true },
    { id: "v-3", code: "EARLYBIRD", discountType: "FIXED", discountValue: 50000, quota: 50, usedCount: 20, expiryDate: "2026-07-15", active: true }
  ]);
  const [search, setSearch] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form Fields
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [discountValue, setDiscountValue] = useState("");
  const [quota, setQuota] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const handleOpenAdd = () => {
    setEditingVoucher(null);
    setCode("");
    setDiscountType("PERCENT");
    setDiscountValue("10");
    setQuota("50");
    setExpiryDate("2026-12-31");
    setModalOpen(true);
  };

  const handleOpenEdit = (v: VoucherItem) => {
    setEditingVoucher(v);
    setCode(v.code);
    setDiscountType(v.discountType);
    setDiscountValue(String(v.discountValue));
    setQuota(String(v.quota));
    setExpiryDate(v.expiryDate);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setVouchers((prev) => prev.filter((v) => v.id !== id));
    toast("Voucher Deleted", "The promo code has been deleted.", "success");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue || !quota || !expiryDate) {
      toast("Input required", "Please fill in all parameter fields.", "info");
      return;
    }

    setModalLoading(true);

    setTimeout(() => {
      setModalLoading(false);
      
      const payload = {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        quota: Number(quota),
        expiryDate,
        active: true
      };

      if (editingVoucher) {
        setVouchers((prev) =>
          prev.map((v) => (v.id === editingVoucher.id ? { ...v, ...payload } : v))
        );
        toast("Voucher Updated", "Changes to promo code saved.", "success");
      } else {
        const newVoucher: VoucherItem = {
          id: `v-${Math.random().toString(36).substring(2, 6)}`,
          usedCount: 0,
          ...payload
        };
        setVouchers((prev) => [newVoucher, ...prev]);
        toast("Voucher Published", "The new promo voucher code is active.", "success");
      }

      setModalOpen(false);
    }, 1200);
  };

  const filteredVouchers = vouchers.filter((v) =>
    v.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Promo & Vouchers</h1>
          <p className="text-xs text-slate-400 mt-1">Configure discount campaign coupons and manage customer code quotas</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary/80 border border-primary/25 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all shadow flex items-center gap-1.5 self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Add Voucher</span>
        </button>
      </div>

      {/* Search box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by voucher code..."
          className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-700"
        />
      </div>

      {/* Vouchers Table */}
      {filteredVouchers.length > 0 ? (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden bg-navy-card/20">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Voucher Code</th>
                  <th className="px-6 py-4">Discount Value</th>
                  <th className="px-6 py-4">Usage (Used / Quota)</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-cyan-400 text-glow">{v.code}</td>
                    <td className="px-6 py-4 font-semibold text-slate-100">
                      {v.discountType === "PERCENT" ? `${v.discountValue}% Off` : `IDR ${v.discountValue.toLocaleString()} Off`}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {v.usedCount} / {v.quota}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>{v.expiryDate}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="glass hover:bg-white/5 border border-white/10 p-2 rounded-lg text-cyan-400"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="glass hover:bg-red-500/10 border border-white/10 p-2 rounded-lg text-red-400 hover:border-red-500/20"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 p-12 text-center max-w-md mx-auto my-12">
          <p className="text-slate-400 text-sm">No vouchers match search query.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVoucher ? "Modify Voucher" : "Publish Voucher"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Voucher Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. DISCOUNT20"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 uppercase placeholder:text-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 font-semibold"
              >
                <option value="PERCENT" className="bg-[#0b1626]">Percentage (%)</option>
                <option value="FIXED" className="bg-[#0b1626]">Fixed IDR (Rp)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Discount Value</label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Quota</label>
              <input
                type="number"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-grow glass hover:bg-white/10 text-slate-300 font-semibold text-xs py-2.5 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="flex-grow bg-primary hover:bg-primary/80 border border-primary/25 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {modalLoading ? (
                <RefreshCw className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <span>Save Code</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
