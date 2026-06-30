"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Calendar, Ticket, QrCode, Award, Download, 
  ExternalLink, Printer, RefreshCw, X 
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
    setActiveTicket(t);
    setCertificateModalOpen(true);
  };

  const handleDownloadPdf = async (ticketId: string) => {
    setCertGenerating(true);
    toast("Generating PDF", "Compiling dynamic certificate with QR and digital signature...", "info");
    
    // Simulate compilation
    setTimeout(() => {
      setCertGenerating(false);
      toast("Download Started", "Your digital certificate PDF download has initiated.", "success");
      // Direct user to download API route
      window.open(`/api/certificates/${ticketId}/pdf`, "_blank");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white">Ticketing & Certificates</h1>
        <p className="text-xs text-slate-400 mt-1">Download entry codes and generate automated completion credentials</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((t) => {
            const eventTime = new Date(t.eventDate).getTime();
            const currentTime = new Date().getTime();
            const isCompleted = !isNaN(eventTime) ? eventTime < currentTime : true;
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
                      {t.ticketType} Pass
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-1 leading-snug line-clamp-1">{t.eventTitle}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase tracking-wide">
                      Pass Number: <span className="font-mono text-slate-300">{t.ticketNumber}</span> • {t.eventDate}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap w-full md:w-auto pt-3 md:pt-0 border-t border-white/5 md:border-t-0 justify-end">
                  {/* View QR Code Option */}
                  <button
                    onClick={() => handleOpenQr(t)}
                    className="glass hover:bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <QrCode className="h-4 w-4 text-cyan-400" />
                    <span>View Pass</span>
                  </button>

                  {/* Get Certificate if Event Finished */}
                  {isCompleted && (
                    <button
                      onClick={() => handleOpenCert(t)}
                      className="bg-primary hover:bg-primary/80 border border-primary/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow"
                    >
                      <Award className="h-4 w-4 text-cyan-400 text-glow" />
                      <span>Certificate</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          title="No passes found" 
          description="Your active registrations ledger is empty. Book a seat from the events grid page." 
        />
      )}

      {/* 1. Modal QR Code Pass Overlay */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Event Access Pass"
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
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Ticket Code</span>
              <span className="text-sm font-bold font-mono text-cyan-400 text-glow block">{activeTicket.ticketNumber}</span>
              <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mt-2 mx-auto">
                Present this QR code at the check-in gate or scan it to access live webinar rooms.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* 2. Certificate Preview & Download Modal */}
      <Modal
        isOpen={certificateModalOpen}
        onClose={() => setCertificateModalOpen(false)}
        title="Completion Certificate"
      >
        {activeTicket && (
          <div className="space-y-6 py-2">
            {/* Elegant Modern Blue Gradient Certificate Mock preview */}
            <div className="relative aspect-[1.414/1] bg-gradient-to-br from-[#0c1e36] to-[#07111f] border-2 border-cyan-500/30 rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
              {/* Radial Cyan background glow */}
              <div className="absolute -top-10 -right-10 h-28 w-28 bg-cyan-400/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-28 w-28 bg-primary/10 rounded-full blur-2xl" />

              {/* Top Row: Issuer & Crest */}
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-cyan-400 text-glow">
                  SeminarVerse Academy
                </span>
                <span className="text-[7px] text-slate-500 font-mono">
                  ID: {activeTicket.ticketNumber}
                </span>
              </div>

              {/* Center Details */}
              <div className="text-center space-y-2.5 my-auto">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Certificate of Completion</h4>
                <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-32 mx-auto" />
                
                <h2 className="text-md sm:text-lg font-black text-slate-100 tracking-wide font-sans">
                  {session?.user?.name || "Participant"}
                </h2>
                
                <p className="text-[8px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                  has successfully attended and completed all curriculum modules for
                  <strong className="block text-slate-200 mt-0.5">{activeTicket.eventTitle}</strong>
                </p>
              </div>

              {/* Footer Row: Signature vs Verification QR */}
              <div className="flex justify-between items-end border-t border-white/5 pt-3">
                <div className="text-left space-y-1">
                  <span className="text-[8px] font-bold text-slate-300 block font-mono italic">Sarah Jenkins</span>
                  <span className="text-[6px] text-slate-500 uppercase tracking-widest block">Sarah Jenkins, Program Chair</span>
                </div>

                {/* Micro QR Code */}
                {activeTicket.qrCodeUrl && (
                  <div className="bg-white p-1 rounded border border-cyan-400/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={activeTicket.qrCodeUrl} 
                      alt="Verify QR" 
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Actions Button */}
            <div className="flex gap-3">
              <button
                onClick={() => setCertificateModalOpen(false)}
                className="flex-1 glass hover:bg-white/10 text-slate-300 font-semibold text-sm py-2.5 rounded-xl transition-all"
              >
                Close Preview
              </button>
              <button
                onClick={() => handleDownloadPdf(activeTicket.id)}
                disabled={certGenerating}
                className="flex-1 bg-primary hover:bg-primary/80 border border-primary/20 text-white font-bold text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow"
              >
                {certGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
