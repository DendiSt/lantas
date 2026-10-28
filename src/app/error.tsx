"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, RotateCcw, Home, RefreshCw } from "lucide-react";
import { ParticleBackground } from "@/components/shared/ParticleBackground";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Root Error:", error);
  }, [error]);

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-zinc-100 overflow-hidden select-none">
      <ParticleBackground particleCount={40} speed={0.2} />

      {/* Top Header */}
      <header className="relative z-20 flex items-center justify-between w-full max-w-md sm:max-w-lg pt-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="size-10 rounded-2xl bg-slate-900 dark:bg-zinc-800 border border-slate-800 dark:border-zinc-700 p-2 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <Image
              src="/logoLantas.png"
              alt="Logo LANTAS"
              width={32}
              height={32}
              className="size-6 object-contain"
              priority
              unoptimized
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">LANTAS</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                System Alert
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Layanan Terpadu Administrasi Sekolah</p>
          </div>
        </Link>

        <ThemeToggle />
      </header>

      {/* Main Error Center Card */}
      <main className="relative z-10 w-full max-w-md sm:max-w-lg my-auto py-4">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-7 sm:p-10 shadow-2xl backdrop-blur-xl text-center">
          {/* Glowing Aura & Hero Icon */}
          <div className="relative mx-auto mb-5 flex items-center justify-center">
            <div className="absolute size-24 rounded-full bg-amber-500/15 blur-xl animate-pulse" />
            <div className="relative size-20 rounded-2xl bg-gradient-to-b from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <AlertCircle className="size-10 text-amber-500" />
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 mb-3">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Kendala Akses Data</span>
          </div>

          {/* Title & Description */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Terjadi Kesalahan Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed mt-2.5 max-w-sm mx-auto">
            Aplikasi mengalami kendala sementara saat memuat data dari server. Silakan coba muat ulang atau kembali ke halaman awal.
          </p>

          {error.digest && (
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-3 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/60 inline-block border border-slate-200 dark:border-zinc-700">
              ID Masalah: {error.digest}
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
            
            <Link
              href="/"
              className="w-full sm:w-1/2 h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-95"
            >
              <Home className="size-4 shrink-0" />
              <span>Halaman Utama</span>
            </Link>
          </div>

          {/* Footer Note */}
          <div className="mt-7 pt-5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
            <RefreshCw className="size-3 text-emerald-500" />
            <span>Sistem Error Boundary Aktif • Integritas Data Terjaga</span>
          </div>
        </div>
      </main>

      {/* Consistent Footer */}
      <footer className="relative z-20 text-center text-[11px] text-slate-400 dark:text-zinc-600 font-medium pb-2">
        © 2026 LANTAS • Layanan Terpadu Administrasi Sekolah
      </footer>
    </div>
  );
}

