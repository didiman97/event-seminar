"use client";

import React, { useState } from "react";
import { Award, Search, Download, ExternalLink, ShieldCheck, Printer } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface CertificateItem {
  id: string;
  certificateNumber: string;
  name: string;
  eventTitle: string;
  issueDate: string;
  hash: string;
}

export default function AdminCertificatesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [certificates, setCertificates] = useState<CertificateItem[]>([
    { id: "c-1", certificateNumber: "SV-AI-2026-928A", name: "John Doe", eventTitle: "AI & Deep Learning Breakthroughs in 2026", issueDate: "2026-06-30", hash: "9A8F8DE2CA" },
    { id: "c-2", certificateNumber: "SV-NJS-2026-881B", name: "Sofia Amanda", eventTitle: "Next.js App Router Masterclass", issueDate: "2026-06-25", hash: "8B7E20F92C" },
    { id: "c-3", certificateNumber: "SV-FTS-2026-773C", name: "Rian Kusuma", eventTitle: "Global Fintech Scaling Seminar", issueDate: "2026-06-28", hash: "7C6D39F18D" }
  ]);

  const handleDownloadPdf = (certNo: string) => {
    toast("Preparing Document", `Initiating download compiler for ${certNo}...`, "info");
    setTimeout(() => {
      toast("Download Dispatched", "Digital certificate PDF file generated.", "success");
    }, 1200);
  };

  const filteredCerts = certificates.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.eventTitle.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white">Certificate Ledger</h1>
        <p className="text-xs text-slate-400 mt-1">Audit issued completion credentials and trace fraud-proof signature hashes</p>
      </div>

      {/* Search filter */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by certificate number, name or event title..."
          className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-700"
        />
      </div>

      {/* Certificate Table Ledger */}
      {filteredCerts.length > 0 ? (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden bg-navy-card/20">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Certificate ID</th>
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Event Topic</th>
                  <th className="px-6 py-4">Date Issued</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredCerts.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-cyan-400 text-glow block">{c.certificateNumber}</span>
                        <span className="text-[8px] text-slate-500 font-mono block">Signature Hash: {c.hash}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-100">{c.name}</td>
                    <td className="px-6 py-4 text-slate-300 line-clamp-1 max-w-[250px] pt-5">{c.eventTitle}</td>
                    <td className="px-6 py-4 text-slate-400">{c.issueDate}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <a
                          href={`/certificate/verify?ticket=${c.certificateNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="glass hover:bg-white/5 border border-white/10 p-2 rounded-lg text-cyan-400"
                          title="Verify Link"
                        >
                          <ExternalLink className="h-4.5 w-4.5" />
                        </a>
                        <button
                          onClick={() => handleDownloadPdf(c.certificateNumber)}
                          className="glass hover:bg-primary/10 border border-white/10 p-2 rounded-lg text-primary hover:border-primary/20"
                          title="Download PDF"
                        >
                          <Download className="h-4.5 w-4.5" />
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
          <p className="text-slate-400 text-sm">No certificates found matching search query.</p>
        </div>
      )}
    </div>
  );
}
