"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Student Section Error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 min-h-[65vh] w-full max-w-lg mx-auto">
      <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-7 sm:p-9 shadow-xl backdrop-blur-xl text-center">
        {/* Glowing Icon */}
        <div className="relative mx-auto mb-5 flex items-center justify-center">
          <div className="absolute size-20 rounded-full bg-indigo-500/15 blur-xl animate-pulse" />
          <div className="relative size-16 rounded-2xl bg-gradient-to-b from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 flex items-center justify-center shadow-md shadow-indigo-500/10">
            <AlertCircle className="size-8 text-indigo-500" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 mb-3">
          <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span>Layanan Siswa • Kendala Jaringan</span>
        </div>

        {/* Title & Desc */}
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Gagal Memuat Halaman Siswa
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed mt-2 max-w-xs mx-auto">
          Terjadi kendala saat memuat riwayat perizinan atau profil siswa. Silakan klik tombol di bawah untuk mencoba kembali.
        </p>

        {error.digest && (
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-3 px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800/60 inline-block border border-slate-200 dark:border-zinc-700">
            Ref: {error.digest}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 w-full">
          <Button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-1/2 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
          >
            <RotateCcw className="size-4 shrink-0" />
            <span>Coba Lagi</span>
          </Button>
          
          <Link
            href="/dashboard"
            className="w-full sm:w-1/2 h-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Home className="size-4 shrink-0" />
            <span>Beranda Siswa</span>
          </Link>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
          <Sparkles className="size-3 text-indigo-500" />
          <span>Sistem LANTAS • Mandiri & Responsif</span>
        </div>
      </div>
    </div>
  );
}

