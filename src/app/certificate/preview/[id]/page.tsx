import React from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ShieldCheck } from "lucide-react";
import { PrintButton } from "./PrintButton";
import fs from "fs";
import path from "path";

export default async function CertificatePreviewPrintPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const { id } = await params;

  // Load custom settings
  const settingsPath = path.join(process.cwd(), "src", "data", "settings.json");
  let settings = {
    certTitle: "CERTIFICATE OF COMPLETION",
    certIssuer: "SeminarVerse Academy",
    certSignatureName: "Sarah Jenkins",
    certSignatureRole: "Sarah Jenkins, Program Chair"
  };

  try {
    if (fs.existsSync(settingsPath)) {
      const settingsData = fs.readFileSync(settingsPath, "utf-8");
      settings = { ...settings, ...JSON.parse(settingsData) };
    }
  } catch (err) {
    console.error("Error reading preview settings:", err);
  }

  let ticket = await db.ticket.findUnique({
    where: { id: id },
    include: { user: true }
  }) as any;

  let certNumber = "";
  let eventTitle = "";
  let eventDate = "";
  let recipientName = "";
  let qrCodeUrl = "";
  let hash = "";

  if (ticket) {
    if (ticket.userId !== (session.user as any).id && (session.user as any).role !== "ADMIN") {
      return notFound();
    }
    // Verify attendance check-in status
    if (!ticket.checkedIn && (session.user as any).role !== "ADMIN") {
      redirect("/dashboard/tickets");
    }
    certNumber = ticket.ticketNumber;
    eventTitle = ticket.eventTitle;
    eventDate = ticket.eventDate;
    recipientName = ticket.user.name;
    qrCodeUrl = ticket.qrCodeUrl || "";
    hash = ticket.ticketNumber.split("-")[1] || ticket.id.slice(0, 8).toUpperCase();
  } else {
    const certificate = await db.certificate.findUnique({
      where: { id: id },
      include: { user: true }
    });
    if (!certificate) {
      return notFound();
    }
    if (certificate.userId !== (session.user as any).id && (session.user as any).role !== "ADMIN") {
      return notFound();
    }
    certNumber = certificate.certificateNumber;
    eventTitle = certificate.eventTitle;
    eventDate = certificate.eventDate;
    recipientName = certificate.participantName || certificate.user.name;
    qrCodeUrl = certificate.qrCodeUrl || "";
    hash = certificate.verificationHash;
  }

  return (
    <div className="print-wrapper min-h-screen bg-[#07111F] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 print:p-0 print:bg-[#07111F]">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: landscape;
            margin: 0 !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
            background-color: #07111F !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-header, nav, footer {
            display: none !important;
          }
          div.flex.flex-col.min-h-screen {
            display: block !important;
            min-height: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            width: 100% !important;
            height: 100% !important;
          }
          .print-wrapper {
            width: 100% !important;
            height: 100% !important;
            min-height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: none !important;
            display: block !important;
            overflow: hidden !important;
          }
          .print-cert-card {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 25mm 20mm 20mm 20mm !important;
            box-sizing: border-box !important;
            background: linear-gradient(to bottom right, #0c1e36, #07111f) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            overflow: hidden !important;
          }
          .print-cert-card * {
            visibility: visible !important;
          }
        }
      `}} />

      {/* Top action bar (no card wrapping) */}
      <header className="print-header w-full max-w-5xl mb-6 flex items-center justify-end">
        <PrintButton />
      </header>

      {/* Certificate Main Card */}
      <div className="print-cert-card relative w-full max-w-5xl aspect-[1.414/1] bg-gradient-to-br from-[#0c1e36] to-[#07111f] border-2 border-cyan-500/30 rounded-3xl p-10 sm:p-14 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Glow spots */}
        <div className="absolute -top-10 -right-10 h-40 w-40 bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />

        {/* Top Row: Issuer & Crest */}
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 text-glow">
            {settings.certIssuer}
          </span>
          <span className="text-[9px] text-slate-500 font-mono">
            ID: {certNumber}
          </span>
        </div>

        {/* Center Details */}
        <div className="text-center space-y-4 my-auto">
          <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5 font-mono">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
            <span>{settings.certTitle}</span>
          </h4>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-40 mx-auto" />
          
          <h2 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-wide font-sans mt-3">
            {recipientName}
          </h2>
          
          <p className="text-[11px] sm:text-xs text-slate-400 max-w-lg mx-auto leading-relaxed mt-2">
            has successfully attended and completed all curriculum modules for
            <strong className="block text-slate-200 text-sm sm:text-md mt-1">{eventTitle}</strong>
          </p>
        </div>

        {/* Footer Row: Signature vs Verification QR */}
        <div className="flex justify-between items-end border-t border-white/5 pt-6">
          <div className="text-left space-y-1">
            <span className="text-[11px] font-bold text-slate-300 block font-mono italic">{settings.certSignatureName}</span>
            <span className="text-[8px] text-slate-500 uppercase tracking-widest block">{settings.certSignatureRole}</span>
          </div>

          {/* Verification QR Code */}
          {qrCodeUrl && (
            <div className="bg-white p-1.5 rounded-xl border border-cyan-400/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={qrCodeUrl} 
                alt="Verify QR" 
                className="h-14 w-14 object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
