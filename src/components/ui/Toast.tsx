"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (title: string, description?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((title: string, description?: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((msg) => {
            let Icon = Info;
            let themeClass = "border-cyan-500/30 text-cyan-400";
            let barColor = "bg-cyan-400";
            if (msg.type === "success") {
              Icon = CheckCircle;
              themeClass = "border-emerald-500/30 text-emerald-400";
              barColor = "bg-emerald-400";
            } else if (msg.type === "error") {
              Icon = AlertCircle;
              themeClass = "border-red-500/30 text-red-400";
              barColor = "bg-red-400";
            }

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                className={`pointer-events-auto glass flex w-full relative overflow-hidden rounded-xl border p-4 shadow-xl ${themeClass}`}
              >
                <div className="flex gap-3">
                  <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-100 text-sm leading-tight">{msg.title}</h4>
                    {msg.description && (
                      <p className="text-xs text-slate-400 mt-1">{msg.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeToast(msg.id)}
                    className="text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {/* Auto-dismiss progress bar */}
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 4, ease: "linear" }}
                  className={`absolute bottom-0 left-0 h-0.5 ${barColor}`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
