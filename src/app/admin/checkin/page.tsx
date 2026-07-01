"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
  Camera, QrCode, Search, RefreshCw, CheckCircle, AlertTriangle, ShieldAlert, Clock, UserCheck 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import jsQR from "jsqr";

interface CheckInLog {
  id: string;
  ticketNumber: string;
  participantName: string;
  eventTitle: string;
  checkedInAt: string;
  status: "SUCCESS" | "ALREADY_CHECKED_IN" | "FAILED";
  message: string;
}

export default function AdminCheckInPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [ticketNumber, setTicketNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<CheckInLog[]>([]);
  const [stats, setStats] = useState({ success: 0, duplicate: 0, failed: 0 });

  // Camera scanner states
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      stopCamera();
    };
  }, []);

  // Authorization Check
  const userRole = (session?.user as any)?.role;
  const isAuthorized = userRole === "ADMIN" || userRole === "SPEAKER" || userRole === "EDITOR";

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-yellow-500 animate-pulse" />
        <h2 className="text-xl font-bold text-white">Butuh Otentikasi</h2>
        <p className="text-xs text-slate-400 max-w-xs">Silakan login sebagai Admin atau Panitia untuk mengakses halaman ini.</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h2 className="text-xl font-bold text-white">Akses Ditolak</h2>
        <p className="text-xs text-slate-400 max-w-xs">Halaman ini hanya dapat diakses oleh Admin, Pembicara, atau Panitia Event.</p>
      </div>
    );
  }

  const handleCheckIn = async (codeToVerify: string) => {
    const target = (codeToVerify || ticketNumber).trim();
    if (!target) {
      toast("Butuh Input", "Silakan masukkan nomor tiket peserta.", "info");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketNumber: target })
      });
      
      const data = await res.json();
      const timestamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

      if (res.ok) {
        // Success check-in
        const newLog: CheckInLog = {
          id: Math.random().toString(),
          ticketNumber: data.ticketNumber,
          participantName: data.participantName,
          eventTitle: data.eventTitle,
          checkedInAt: timestamp,
          status: "SUCCESS",
          message: "Check-in Berhasil!"
        };
        setLogs((prev) => [newLog, ...prev]);
        setStats((prev) => ({ ...prev, success: prev.success + 1 }));
        toast("Check-in Berhasil", `${data.participantName} terverifikasi masuk.`, "success");
      } else {
        // Handle failed or duplicate check-in
        if (data.alreadyCheckedIn) {
          const formattedTime = new Date(data.checkedInAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
          const newLog: CheckInLog = {
            id: Math.random().toString(),
            ticketNumber: data.ticketNumber,
            participantName: data.participantName,
            eventTitle: data.eventTitle,
            checkedInAt: formattedTime,
            status: "ALREADY_CHECKED_IN",
            message: `Sudah check-in pukul ${formattedTime}`
          };
          setLogs((prev) => [newLog, ...prev]);
          setStats((prev) => ({ ...prev, duplicate: prev.duplicate + 1 }));
          toast("Sudah Check-in", `${data.participantName} sudah terabsen sebelumnya.`, "info");
        } else {
          const newLog: CheckInLog = {
            id: Math.random().toString(),
            ticketNumber: target,
            participantName: "N/A",
            eventTitle: "N/A",
            checkedInAt: timestamp,
            status: "FAILED",
            message: data.error || "Gagal melakukan verifikasi"
          };
          setLogs((prev) => [newLog, ...prev]);
          setStats((prev) => ({ ...prev, failed: prev.failed + 1 }));
          toast("Check-in Gagal", data.error || "Terjadi kesalahan", "error");
        }
      }
    } catch (err) {
      console.error(err);
      toast("Kesalahan Sistem", "Gagal menghubungi server check-in.", "error");
    } finally {
      setLoading(false);
      setTicketNumber("");
    }
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
        animationFrameId.current = requestAnimationFrame(scanTick);
        toast("Pemindai Aktif", "Arahkan kamera ke QR code tiket peserta.", "info");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast("Kamera Gagal Dimulai", "Pastikan memberikan izin akses kamera.", "error");
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
            let parsedCode = code.data;
            try {
              if (code.data.includes("?ticket=") || code.data.includes("&ticket=")) {
                const url = new URL(code.data);
                parsedCode = url.searchParams.get("ticket") || parsedCode;
              } else if (code.data.includes("?code=") || code.data.includes("&code=")) {
                const url = new URL(code.data);
                parsedCode = url.searchParams.get("code") || parsedCode;
              }
            } catch (e) {
              // Ignore parsing errors, use plain text
            }
            
            stopCamera();
            handleCheckIn(parsedCode);
            return;
          }
        }
      }
    }
    
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white">Absensi Kehadiran Peserta</h1>
        <p className="text-xs text-slate-400 mt-1">Scan barcode/QR pass peserta atau ketik nomor tiket secara manual untuk mencatat kehadiran.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl border border-white/5 p-4 bg-[#091b15]/30">
          <span className="text-[9px] text-emerald-400 uppercase tracking-wider block font-bold">Check-in Berhasil</span>
          <span className="text-xl font-extrabold text-slate-100 mt-1 block">{stats.success}</span>
        </div>
        <div className="glass rounded-xl border border-white/5 p-4 bg-[#271d0e]/30">
          <span className="text-[9px] text-yellow-500 uppercase tracking-wider block font-bold">Terabsen Ganda</span>
          <span className="text-xl font-extrabold text-slate-100 mt-1 block">{stats.duplicate}</span>
        </div>
        <div className="glass rounded-xl border border-white/5 p-4 bg-[#1a0e10]/30">
          <span className="text-[9px] text-red-400 uppercase tracking-wider block font-bold">Gagal/Tidak Valid</span>
          <span className="text-xl font-extrabold text-slate-100 mt-1 block">{stats.failed}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: QR Code scanning client */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl border border-white/5 p-5 bg-navy-card/35 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Camera className="h-4.5 w-4.5 text-cyan-400" />
                <span>Kamera Pemindai Kehadiran</span>
              </h3>
              <button
                onClick={toggleCamera}
                disabled={loading}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all border shrink-0 ${
                  cameraActive 
                    ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" 
                    : "bg-primary hover:bg-primary/80 border-primary/20 text-white shadow-lg"
                }`}
              >
                {cameraActive ? "Matikan Kamera" : "Aktifkan Kamera"}
              </button>
            </div>

            {/* Video View */}
            {cameraActive ? (
              <div className="relative w-full aspect-video bg-black/60 rounded-xl overflow-hidden border border-white/10 flex flex-col justify-center items-center">
                <video ref={videoRef} className="w-full h-full object-cover" muted />
                <canvas ref={canvasRef} className="hidden" />
                {/* Scanner targeting HUD */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-32 w-32 border-2 border-dashed border-cyan-400/40 rounded-xl flex items-center justify-center relative">
                    <div className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-cyan-400" />
                  </div>
                </div>
                {/* Laser animation bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-md shadow-cyan-400 animate-bounce w-full" />
              </div>
            ) : (
              <div className="w-full aspect-video bg-[#07111F]/50 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <QrCode className="h-12 w-12 text-slate-700 animate-pulse mb-3" />
                <p className="text-xs">Pemindai kamera mati.</p>
                <p className="text-[10px] text-slate-600 mt-1">Aktifkan kamera untuk memindai QR code tiket masuk secara langsung.</p>
              </div>
            )}

            {/* Manual check-in form */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Cari/Entri Manual</span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    placeholder="Contoh: SV-XXXX-XXXX"
                    className="bg-white/5 border border-white/10 rounded-xl pl-4 pr-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors uppercase placeholder:text-slate-700 font-mono"
                  />
                </div>
                <button
                  onClick={() => handleCheckIn(ticketNumber)}
                  disabled={loading}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-bold text-xs px-5 rounded-xl transition-all flex items-center gap-1.5"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span>Absen</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Activity Logs */}
        <div className="space-y-6">
          <div className="glass rounded-2xl border border-white/5 p-5 bg-navy-card/25 space-y-4 min-h-[400px] flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-yellow-400" />
                <span>Log Aktivitas Absensi</span>
              </h3>
              
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                <AnimatePresence initial={false}>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-3 rounded-xl border flex gap-3 items-start ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                            : log.status === "ALREADY_CHECKED_IN"
                            ? "bg-yellow-500/5 border-yellow-500/10 text-yellow-500"
                            : "bg-red-500/5 border-red-500/10 text-red-400"
                        }`}
                      >
                        {log.status === "SUCCESS" ? (
                          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 overflow-hidden space-y-0.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-mono font-semibold">{log.ticketNumber}</span>
                            <span className="text-slate-500 font-medium">{log.checkedInAt}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 truncate">{log.participantName}</h4>
                          <p className="text-[9px] text-slate-500 truncate leading-relaxed">{log.eventTitle}</p>
                          <p className="text-[10px] font-semibold mt-1 leading-snug">{log.message}</p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-600 space-y-1">
                      <UserCheck className="h-8 w-8 mx-auto opacity-30 mb-2" />
                      <p className="text-xs font-semibold">Belum ada aktivitas</p>
                      <p className="text-[10px] text-slate-700">Absensi yang berhasil dipindai akan muncul di log ini.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
