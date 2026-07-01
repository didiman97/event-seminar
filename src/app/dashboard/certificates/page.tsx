"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Award, Download, ExternalLink, Search, RefreshCw, Eye, ShieldCheck 
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface CertificateItem {
  id: string;
  certificateNumber: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  qrCodeUrl?: string;
  isFromTicket: boolean;
  hash: string;
  createdAt: string;
}

export default function UserCertificatesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCert, setActiveCert] = useState<CertificateItem | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/certificates");
      const data = await res.json();
      if (res.ok) {
        setCertificates(data.certificates);
      } else {
        toast("Fetch Error", data.error || "Failed to load certificates.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Error", "An unexpected error occurred while loading certificates.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleOpenPreview = (cert: CertificateItem) => {
    window.open(`/certificate/preview/${cert.id}`, "_blank");
  };

  const handleDownloadPdf = async (cert: CertificateItem) => {
    setDownloadingId(cert.id);
    toast("Generating PDF", "Compiling dynamic certificate with QR and digital signature...", "info");
    
    // Simulate dynamic compilation
    setTimeout(() => {
      setDownloadingId(null);
      toast("Download Started", "Your digital certificate PDF download has initiated.", "success");
      window.open(`/api/certificates/${cert.id}/pdf`, "_blank");
    }, 1500);
  };

  const filteredCerts = certificates.filter((c) =>
    c.eventTitle.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white">Sertifikat Saya</h1>
        <p className="text-xs text-slate-400 mt-1">Lihat dan unduh kredensial penyelesaian resmi untuk event yang telah Anda ikuti.</p>
      </div>

      {/* Filter and Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan nama event atau nomor sertifikat..."
          className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-700"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
      ) : filteredCerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCerts.map((c) => (
            <div 
              key={c.id} 
              className="glass-glow rounded-2xl border border-white/5 p-5 bg-navy-card/35 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider inline-block">
                    Verified Credential
                  </span>
                  <span className="text-[8px] font-mono text-slate-500">Hash: {c.hash}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug">{c.eventTitle}</h3>
                <div className="space-y-1 text-[10px] text-slate-400">
                  <p>Tanggal Event: <span className="font-semibold text-slate-300">{c.eventDate}</span></p>
                  <p>No. Sertifikat: <span className="font-mono text-cyan-400">{c.certificateNumber}</span></p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                <div className="flex gap-2 w-full justify-end">
                  {/* Preview Button */}
                  <button
                    onClick={() => handleOpenPreview(c)}
                    className="glass hover:bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    title="Pratinjau Sertifikat"
                  >
                    <Eye className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Pratinjau</span>
                  </button>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownloadPdf(c)}
                    disabled={downloadingId === c.id}
                    className="bg-primary hover:bg-primary/80 border border-primary/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow cursor-pointer"
                    title="Unduh PDF"
                  >
                    {downloadingId === c.id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>Unduh PDF</span>
                      </>
                    )}
                  </button>

                  {/* Verify Link */}
                  <a
                    href={`/certificate/verify?ticket=${c.certificateNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="glass hover:bg-white/5 border border-white/10 p-1.5 rounded-xl text-slate-400 hover:text-cyan-400 flex items-center justify-center transition-all"
                    title="Verifikasi Publik"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          title="Belum ada sertifikat" 
          description="Sertifikat otomatis diterbitkan setelah Anda selesai mengikuti event yang Anda daftarkan." 
        />
      )}
    </div>
  );
}
