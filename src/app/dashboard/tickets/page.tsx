"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Calendar, Ticket, QrCode, Award, Download, 
  RefreshCw, X, ShieldAlert
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface TicketItem {
  id: string;
  ticketNumber: string;
  ticketType: string;
  status: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  qrCodeUrl?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}

export default function MyTicketsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<TicketItem | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [certGenerating, setCertGenerating] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/tickets");
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenQr = (t: TicketItem) => {
    setActiveTicket(t);
    setQrModalOpen(true);
  };

  const handleOpenCert = (t: TicketItem) => {
    window.open(`/certificate/preview/${t.id}`, "_blank");
  };

  const handleDownloadPdf = async (ticketId: string) => {
    setCertGenerating(true);
    toast("Menyusun PDF", "Menyusun sertifikat dinamis dengan QR dan tanda tangan digital...", "info");
    
    // Simulate compilation
    setTimeout(() => {
      setCertGenerating(false);
      toast("Unduhan Dimulai", "Unduhan file PDF sertifikat digital Anda telah dimulai.", "success");
      // Direct user to download API route
      window.open(`/api/certificates/${ticketId}/pdf`, "_blank");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white">Tiket & Sertifikat</h1>
        <p className="text-xs text-slate-400 mt-1">Unduh tiket akses masuk dan peroleh sertifikat resmi setelah kehadiran Anda diverifikasi.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((t) => {
            return (
              <div 
                key={t.id} 
                className="glass rounded-2xl border border-white/5 p-5 bg-navy-card/35 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
              >
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-primary/10 rounded-xl text-cyan-400 border border-primary/25 shrink-0">
                    <Ticket className="h-6 w-6 text-glow" />
                  </div>
                  <div>
                    <span className="bg-primary/20 border border-primary/30 text-cyan-400 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider inline-block">
                      Tiket {t.ticketType}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-1 leading-snug line-clamp-1">{t.eventTitle}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase tracking-wide">
                      Nomor Pass: <span className="font-mono text-slate-300">{t.ticketNumber}</span> • {t.eventDate}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap w-full md:w-auto pt-3 md:pt-0 border-t border-white/5 md:border-t-0 justify-end items-center">
                  {/* View QR Code Option */}
                  <button
                    onClick={() => handleOpenQr(t)}
                    className="glass hover:bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="h-4 w-4 text-cyan-400" />
                    <span>Lihat Tiket</span>
                  </button>

                  {/* Get Certificate if Attended (checkedIn === true) */}
                  {t.checkedIn ? (
                    <button
                      onClick={() => handleOpenCert(t)}
                      className="bg-primary hover:bg-primary/80 border border-primary/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <Award className="h-4 w-4 text-cyan-400 text-glow" />
                      <span>Sertifikat</span>
                    </button>
                  ) : (
                    <div 
                      className="border border-white/5 bg-white/[0.02] text-slate-500 text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-1.5"
                      title="Sertifikat akan tersedia setelah Anda melakukan absensi masuk to event ini."
                    >
                      <ShieldAlert className="h-4 w-4 text-slate-600" />
                      <span>Menunggu Absensi</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          title="Tidak ada tiket ditemukan" 
          description="Daftar tiket Anda kosong. Silakan jelajahi event kami untuk melakukan registrasi." 
        />
      )}

      {/* 1. Modal QR Code Pass Overlay */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Tiket Akses Event"
      >
        {activeTicket && (
          <div className="text-center space-y-6 py-4 flex flex-col items-center">
            <div>
              <h4 className="text-sm font-bold text-slate-200">{activeTicket.eventTitle}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{activeTicket.eventDate}</p>
            </div>

            {/* Rendered Base64 QR Code */}
            {activeTicket.qrCodeUrl ? (
              <div className="bg-white p-3 rounded-2xl border-4 border-cyan-400 shadow-xl shadow-cyan-400/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={activeTicket.qrCodeUrl} 
                  alt="QR Code Pass" 
                  className="h-44 w-44 object-contain"
                />
              </div>
            ) : (
              <div className="h-44 w-44 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/5">
                <QrCode className="h-10 w-10 text-slate-600" />
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Kode Tiket</span>
              <span className="text-sm font-bold font-mono text-cyan-400 text-glow block">{activeTicket.ticketNumber}</span>
              <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mt-2 mx-auto">
                Tunjukkan kode QR ini ke panitia di gerbang masuk untuk mencatat absensi kehadiran Anda.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
