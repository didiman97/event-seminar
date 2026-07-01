"use client";

import React from "react";
import { Printer } from "lucide-react";

export function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="bg-primary hover:bg-primary/80 border border-primary/20 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow cursor-pointer ml-auto"
    >
      <Printer className="h-4 w-4" />
      <span>Cetak Sertifikat</span>
    </button>
  );
}
