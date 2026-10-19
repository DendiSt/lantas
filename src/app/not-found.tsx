"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Home, ShieldAlert, LockKeyhole } from "lucide-react";
import { ParticleBackground } from "@/components/shared/ParticleBackground";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-zinc-100 overflow-hidden select-none">
      <ParticleBackground particleCount={45} speed={0.25} />

      {/* Top Header Aligned with Card Width */}
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
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Layanan Terpadu Administrasi Sekolah</p>
          </div>
        </Link>

        <ThemeToggle />
      </header>

      {/* Main 404 Center Card */}
      <main className="relative z-10 w-full max-w-md sm:max-w-lg my-auto py-4">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-7 sm:p-10 shadow-2xl backdrop-blur-xl text-center">
          
          {/* Glowing Aura & Clean Hero Icon */}
          <div className="relative mx-auto mb-5 flex items-center justify-center">
            <div className="absolute size-24 rounded-full bg-rose-500/15 blur-xl animate-pulse" />
            <div className="relative size-20 rounded-2xl bg-gradient-to-b from-rose-500/20 to-rose-500/5 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-500/10">
              <ShieldAlert className="size-10 text-rose-500" />
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 mb-3">
            <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Error 404 • Akses Terbatas</span>
          </div>

          {/* Title & Description */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed mt-2.5 max-w-sm mx-auto">
            Tautan yang Anda tuju tidak tersedia, telah dipindahkan, atau Anda tidak memiliki izin untuk membuka halaman ini.
          </p>

          {/* Action Buttons: Symmetric & Balanced */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7 w-full">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-1/2 h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 whitespace-nowrap active:scale-[0.98]"
            >
              <ArrowLeft className="size-4 shrink-0" />
              <span>Kembali Sebelumnya</span>
            </button>
            
            <Link
              href="/"
              className="w-full sm:w-1/2 h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-150 whitespace-nowrap active:scale-[0.98]"
            >
              <Home className="size-4 shrink-0" />
              <span>Halaman Utama</span>
            </Link>
          </div>

          {/* Subtle Security Badge at Bottom of Card */}
          <div className="mt-7 pt-5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
            <LockKeyhole className="size-3 text-emerald-500" />
            <span>Sistem Proteksi Rute Aktif • Akses Tidak Sah Dicegah</span>
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
