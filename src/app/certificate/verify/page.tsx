"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ShieldCheck, ShieldAlert, Camera, QrCode, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import jsQR from "jsqr";

function VerifyContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [certNumber, setCertNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  
  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Check URL query parameters on load
  const queryTicket = searchParams.get("ticket") || searchParams.get("certificate") || searchParams.get("code");
  
  useEffect(() => {
    if (queryTicket) {
      setCertNumber(queryTicket);
      handleVerify(queryTicket);
    }
  }, [queryTicket]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      stopCamera();
    };
  }, []);

  const handleVerify = async (numberToVerify: string) => {
    const target = numberToVerify || certNumber;
    if (!target) {
      toast("Butuh Input", "Silakan masukkan nomor sertifikat atau tiket.", "info");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/tickets/verify?code=${encodeURIComponent(target)}`);
      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
        toast("Verifikasi Berhasil", "Sertifikat/Tiket ditemukan dan valid.", "success");
      } else {
        setResult({
          status: "NOT_FOUND",
          message: data.error || "Data tidak ditemukan. Silakan periksa kembali kode registrasi Anda."
        });
        toast("Verifikasi Gagal", "Kredensial tidak terdaftar.", "error");
      }
    } catch (err) {
      console.error(err);
      setResult({
        status: "NOT_FOUND",
        message: "Terjadi kesalahan server saat memproses verifikasi."
      });
      toast("Kesalahan Sistem", "Gagal menghubungi server verifikasi.", "error");
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setResult(null);
      setCameraActive(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // required to prevent iOS Safari from playing full-screen
        videoRef.current.play();
        animationFrameId.current = requestAnimationFrame(scanTick);
        toast("Kamera Aktif", "Arahkan kamera ke kode QR tiket atau sertifikat.", "info");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast("Gagal Mengakses Kamera", "Pastikan Anda memberikan izin kamera pada peramban Anda.", "error");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  };

  const scanTick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (canvas && video) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert"
          });
          
          if (code) {
            console.log("QR Code detected:", code.data);
            
            // Attempt to parse parameter if it is a full verification URL
            let ticketCode = code.data;
            try {
              if (code.data.includes("?ticket=") || code.data.includes("&ticket=")) {
                const url = new URL(code.data);
                ticketCode = url.searchParams.get("ticket") || ticketCode;
              } else if (code.data.includes("?certificate=") || code.data.includes("&certificate=")) {
                const url = new URL(code.data);
                ticketCode = url.searchParams.get("certificate") || ticketCode;
              } else if (code.data.includes("?code=") || code.data.includes("&code=")) {
                const url = new URL(code.data);
                ticketCode = url.searchParams.get("code") || ticketCode;
              }
            } catch (e) {
              // Standard text, not a URL
            }
            
            toast("QR Code Terdeteksi", `Memverifikasi kode: ${ticketCode}`, "success");
            setCertNumber(ticketCode);
            handleVerify(ticketCode);
            stopCamera();
            return;
          }
        }
      }
    }
    
    // Continue loop if camera is active
    if (videoRef.current && videoRef.current.srcObject) {
      animationFrameId.current = requestAnimationFrame(scanTick);
    }
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 min-h-screen space-y-8">
      {/* Title */}
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-3xl font-extrabold text-white">Verifikasi Sertifikat & Tiket</h1>
        <p className="text-xs text-slate-400 mt-1.5">
          Pindai kode QR atau masukkan kode registrasi untuk memeriksa keabsahan kredensial SeminarVerse.
        </p>
      </div>

      {/* Manual Search & Camera Scanner Actions */}
      <div className="glass rounded-2xl border border-white/5 p-6 bg-navy-card/40 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search form */}
        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Cari Kode Registrasi</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Masukkan nomor tiket atau kode sertifikat unik secara manual.
            </p>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value)}
                placeholder="Contoh: SV-AI-XXXX, CERT-XXXX"
                className="bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 uppercase placeholder:text-slate-700 font-mono"
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
                <span>Verifikasi Kode</span>
              )}
            </button>
          </div>
        </div>

        {/* QR scanner camera */}
        <div className="border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <QrCode className="h-4.5 w-4.5 text-cyan-400" />
              <span>Pindai Kode QR Kamera</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Gunakan kamera perangkat Anda untuk memindai QR code secara langsung pada e-tiket atau sertifikat fisik/digital.
            </p>
          </div>

          <button
            onClick={toggleCamera}
            disabled={loading}
            className={`mt-4 w-full border text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 hover:scale-[1.01] ${
              cameraActive 
                ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" 
                : "glass border-white/10 text-cyan-400 hover:bg-white/5"
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>{cameraActive ? "Hentikan Kamera" : "Mulai Kamera Pemindai"}</span>
          </button>
        </div>
      </div>

      {/* Camera Live Stream View */}
      <AnimatePresence>
        {cameraActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-2xl border border-white/5 p-4 bg-navy-card/60 flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Animated Laser line scanning effect */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-md shadow-cyan-400 animate-bounce w-full z-10" />
            
            <div className="relative w-full max-w-md aspect-video bg-black/60 rounded-xl overflow-hidden border border-white/10">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Target bracket outline overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-40 w-40 border-2 border-dashed border-cyan-400/50 rounded-xl flex items-center justify-center relative">
                  <div className="absolute -top-1.5 -left-1.5 h-4 w-4 border-t-4 border-l-4 border-cyan-400" />
                  <div className="absolute -top-1.5 -right-1.5 h-4 w-4 border-t-4 border-r-4 border-cyan-400" />
                  <div className="absolute -bottom-1.5 -left-1.5 h-4 w-4 border-b-4 border-l-4 border-cyan-400" />
                  <div className="absolute -bottom-1.5 -right-1.5 h-4 w-4 border-b-4 border-r-4 border-cyan-400" />
                </div>
              </div>
            </div>
            
            <p className="text-xs text-cyan-400 font-semibold animate-pulse text-glow mt-3">Arahkan kode QR ke dalam kotak...</p>
            <p className="text-[9px] text-slate-500 mt-1">Membaca visual matriks kamera aktif</p>
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
                  Terverifikasi Asli
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                    <ShieldCheck className="h-6 w-6 text-glow" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Nama Peserta</span>
                      <h3 className="text-lg font-bold text-slate-100 mt-0.5">{result.name}</h3>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Judul Event</span>
                      <p className="text-sm font-semibold text-slate-200 mt-0.5 leading-snug">{result.eventTitle}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Tanggal Event</span>
                        <p className="text-xs font-semibold text-slate-300 mt-0.5">{result.issueDate}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Nomor Registrasi</span>
                        <p className="text-xs font-mono font-semibold text-slate-300 mt-0.5">{result.certificateNumber || result.ticketNumber}</p>
                      </div>
                    </div>
                    
                    {result.type === "TICKET" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-3">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Status Tiket</span>
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
                            {result.ticketStatus}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Tipe Tiket</span>
                          <span className="text-xs font-semibold text-slate-300 mt-0.5 block">{result.ticketType} Pass</span>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-white/5 pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] text-slate-500 gap-2">
                      <span>Otoritas: {result.issuer}</span>
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
                  <h3 className="text-md font-bold text-slate-200">Kredensial Tidak Ditemukan</h3>
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
