"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ShieldCheck, ShieldAlert, Camera, QrCode, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

function VerifyContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [certNumber, setCertNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Check URL query parameters on load
  const queryTicket = searchParams.get("ticket") || searchParams.get("certificate");
  useEffect(() => {
    if (queryTicket) {
      setCertNumber(queryTicket);
      handleVerify(queryTicket);
    }
  }, [queryTicket]);

  const handleVerify = async (numberToVerify: string) => {
    const target = numberToVerify || certNumber;
    if (!target) {
      toast("Input required", "Please specify a certificate or ticket number.", "info");
      return;
    }

    setLoading(true);
    setResult(null);

    // Simulate API verification call to database records
    setTimeout(() => {
      setLoading(false);
      
      // Verification logic mock
      if (target.startsWith("SV-") || target.startsWith("CERT-")) {
        setResult({
          status: "VERIFIED",
          certificateNumber: target.includes("-") ? target : `CERT-${target.toUpperCase()}`,
          name: "John Doe",
          eventTitle: target.includes("NEXTJS") || target.includes("nextjs")
            ? "Next.js App Router: Intermediate to Production Core"
            : "AI & Deep Learning Breakthroughs in 2026",
          issueDate: new Date().toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric"
          }),
          issuer: "SeminarVerse Authority",
          hash: Math.random().toString(16).substring(2, 10).toUpperCase() + "A8F9"
        });
        toast("Certificate Verified", "The certificate is authentic and registered.", "success");
      } else {
        setResult({
          status: "NOT_FOUND",
          message: "No certificate found matching this registration code. Please double-check formatting."
        });
        toast("Verification Failed", "No certificate found.", "error");
      }
    }, 1500);
  };

  // Simulate scanning of QR code
  const handleSimulateScan = () => {
    setCameraActive(true);
    toast("Launching Camera Interface", "Simulating QR code scanner overlay...", "info");
    
    setTimeout(() => {
      setCameraActive(false);
      const mockTicket = `SV-NEXTJS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setCertNumber(mockTicket);
      handleVerify(mockTicket);
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 min-h-screen space-y-8">
      {/* Title */}
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-3xl font-extrabold text-white">Certificate Verification</h1>
        <p className="text-xs text-slate-400 mt-1.5">
          Scan QR codes or type registration keys to check validity of SeminarVerse digital credentials.
        </p>
      </div>

      {/* Manual Search & Camera Simulation Actions */}
      <div className="glass rounded-2xl border border-white/5 p-6 bg-navy-card/40 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search form */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Search Registration Key</h3>
          <div className="relative">
            <input
              type="text"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              placeholder="e.g. SV-AI-XXXX, CERT-XXXX"
              className="bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 uppercase placeholder:text-slate-700"
            />
            <button
              onClick={() => handleVerify(certNumber)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300 p-1"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
          </div>
          <button
            onClick={() => handleVerify(certNumber)}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/80 border border-primary/20 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <span>Verify Code</span>
            )}
          </button>
        </div>

        {/* QR scanner camera simulation */}
        <div className="border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <QrCode className="h-4.5 w-4.5 text-cyan-400" />
              <span>Simulate QR Scan</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Launch our simulated camera client to scan printed pass badges or certificates.
            </p>
          </div>

          <button
            onClick={handleSimulateScan}
            disabled={cameraActive || loading}
            className="mt-4 w-full glass hover:bg-white/5 border border-white/10 text-cyan-400 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 hover:scale-[1.01]"
          >
            <Camera className="h-4 w-4" />
            <span>Launch Scanner Overlay</span>
          </button>
        </div>
      </div>

      {/* Simulated Scanner View overlay */}
      <AnimatePresence>
        {cameraActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-2xl border border-white/5 p-6 bg-navy-card/60 flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Holographic grid scanner line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-md shadow-cyan-400 animate-bounce w-full" />
            
            <div className="h-32 w-32 border-2 border-dashed border-cyan-400/50 rounded-xl flex items-center justify-center text-slate-500 relative mb-4">
              <QrCode className="h-10 w-10 text-cyan-400/30 animate-pulse" />
              <div className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-cyan-400" />
            </div>
            
            <p className="text-xs text-cyan-400 font-semibold animate-pulse text-glow">Aligning code within bounds...</p>
            <p className="text-[10px] text-slate-500 mt-1">Reading matrix data (3s)</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Result Output Card */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10"
          >
            {result.status === "VERIFIED" ? (
              <div className="glass border-emerald-500/20 rounded-2xl p-6 bg-[#091b15]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-emerald-500/20 px-4 py-1 rounded-bl-xl text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest text-glow">
                  Verified Authentic
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                    <ShieldCheck className="h-6 w-6 text-glow" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Participant Name</span>
                      <h3 className="text-lg font-bold text-slate-100 mt-0.5">{result.name}</h3>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Event Title</span>
                      <p className="text-sm font-semibold text-slate-200 mt-0.5 leading-snug">{result.eventTitle}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Issue Date</span>
                        <p className="text-xs font-semibold text-slate-300 mt-0.5">{result.issueDate}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Certificate Number</span>
                        <p className="text-xs font-mono font-semibold text-slate-300 mt-0.5">{result.certificateNumber}</p>
                      </div>
                    </div>
                    <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[10px] text-slate-500">
                      <span>Authority: {result.issuer}</span>
                      <span className="font-mono">Security Hash: {result.hash}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass border-red-500/20 rounded-2xl p-6 bg-[#1a0e10]/30 flex gap-4 items-start">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 shrink-0">
                  <ShieldAlert className="h-6 w-6 text-glow" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-md font-bold text-slate-200">Credential Not Found</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{result.message}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CertificateVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
