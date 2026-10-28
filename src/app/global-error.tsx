"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 antialiased font-sans">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
            {/* Glowing Hero Icon */}
            <div className="relative mx-auto mb-6 flex items-center justify-center">
              <div className="absolute size-24 rounded-full bg-rose-500/15 blur-xl animate-pulse" />
              <div className="relative size-20 rounded-2xl bg-gradient-to-b from-rose-500/20 to-rose-500/5 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-500/10">
                <AlertTriangle className="size-10 text-rose-500" />
              </div>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 mb-3">
              <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Gangguan Sistem Fatal</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Terjadi Kesalahan Kritis
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed mt-2.5 max-w-xs mx-auto">
              Sistem mendeteksi kendala pada antarmuka utama. Data Anda tetap aman. Silakan muat ulang untuk melanjutkan.
            </p>

            {error.digest && (
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-3 px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800/60 inline-block">
                Kode Ref: {error.digest}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7 w-full">
              <button
                type="button"
                onClick={() => reset()}
                className="w-full sm:w-1/2 h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
              >
                <RotateCcw className="size-4 shrink-0" />
                <span>Coba Lagi</span>
              </button>
              
              <button
                type="button"
                onClick={() => window.location.href = "/"}
                className="w-full sm:w-1/2 h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-95"
              >
                <Home className="size-4 shrink-0" />
                <span>Halaman Awal</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-zinc-600 font-medium mt-6">
            © 2026 LANTAS • Layanan Terpadu Administrasi Sekolah
          </p>
        </div>
      </body>
    </html>
  );
}

