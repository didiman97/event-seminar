"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CreditCard, CheckCircle, Clock, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

interface TransactionItem {
  id: string;
  orderId: string;
  amount: number;
  paymentStatus: string;
  paymentType?: string;
  token?: string;
  redirectUrl?: string;
  createdAt: string;
}

export default function PaymentsHistoryPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/transactions");
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRetryPayment = (t: TransactionItem) => {
    if (t.token) {
      if (typeof window.snap !== "undefined") {
        window.snap.pay(t.token, {
          onSuccess: () => {
            toast("Payment Successful", "Transaction completed.", "success");
            fetchTransactions();
          },
          onPending: () => {
            toast("Payment Pending", "Please complete payment.", "info");
          },
          onError: () => {
            toast("Payment Failed", "Transaction failed.", "error");
          },
          onClose: () => {
            toast("Checkout Closed", "Closed.", "info");
          }
        });
      } else if (t.redirectUrl) {
        window.open(t.redirectUrl, "_blank");
      }
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white">Payment Invoices</h1>
        <p className="text-xs text-slate-400 mt-1">Review checkout transaction logs and Midtrans invoice status</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
      ) : transactions.length > 0 ? (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden bg-navy-card/20">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {transactions.map((t) => {
                  let statusColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
                  let StatusIcon = Clock;
                  if (t.paymentStatus === "SETTLEMENT") {
                    statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                    StatusIcon = CheckCircle;
                  } else if (t.paymentStatus === "FAILED" || t.paymentStatus === "EXPIRED") {
                    statusColor = "text-red-400 bg-red-500/10 border-red-500/20";
                    StatusIcon = AlertTriangle;
                  }

                  return (
                    <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-200">{t.orderId}</td>
                      <td className="px-6 py-4 text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-semibold text-slate-100">{formatCurrency(t.amount)}</td>
                      <td className="px-6 py-4 uppercase text-slate-400">{t.paymentType || "MIDTRANS"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 border px-2.5 py-0.5 rounded-full font-semibold text-[9px] uppercase ${statusColor}`}>
                          <StatusIcon className="h-3 w-3" />
                          <span>{t.paymentStatus}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {t.paymentStatus === "PENDING" && (
                          <button
                            onClick={() => handleRetryPayment(t)}
                            className="bg-primary hover:bg-primary/80 border border-primary/20 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition-all shadow flex items-center gap-1.5 ml-auto"
                          >
                            <span>Pay</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                        {t.paymentStatus === "SETTLEMENT" && (
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">Completed</span>
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
        <EmptyState 
          title="No transaction logs" 
          description="Your payment registry is empty. You haven't made any booking payments yet." 
        />
      )}
    </div>
  );
}
