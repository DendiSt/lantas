"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Home, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleBackground } from "@/components/shared/ParticleBackground";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-between p-4 sm:p-6 lg:p-10 text-slate-900 dark:text-zinc-100 overflow-hidden">
      <ParticleBackground particleCount={40} speed={0.25} />

      {/* Top Header */}
      <header className="relative z-20 flex items-center justify-between w-full max-w-6xl mx-auto">
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
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold tracking-wide uppercase bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                404
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Layanan Terpadu Administrasi Sekolah</p>
          </div>
        </Link>

        <ThemeToggle />
      </header>

      {/* Main 404 Card */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto py-8 text-center px-4">
        <div className="w-full max-w-lg bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 p-8 sm:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-black/50">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/60 mb-6">
            <ShieldAlert className="size-3.5" />
            <span>Akses Ditolak / Tautan Tidak Ditemukan</span>
          </div>

          {/* 404 Large Visual */}
          <div className="relative mb-6 flex items-center justify-center">
            <span className="text-8xl sm:text-9xl font-black tracking-tighter text-slate-200/80 dark:text-zinc-800/80 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-16 sm:size-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shadow-lg backdrop-blur-xs animate-bounce">
                <ShieldAlert className="size-8 sm:size-10" />
              </div>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed mt-3 max-w-sm mx-auto">
            Tautan yang Anda tuju tidak tersedia, telah dipindahkan, atau Anda tidak memiliki izin akses yang sesuai untuk membuka halaman ini.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="w-full sm:w-auto h-11 px-5 rounded-xl border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ArrowLeft className="size-4" />
              <span>Kembali ke Halaman Sebelumnya</span>
            </Button>
            
            <Link
              href="/"
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Home className="size-4" />
              <span>Halaman Utama</span>
            </Link>
          </div>

          {/* Security alert indicator */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400 dark:text-zinc-500 flex items-center justify-center gap-1.5">
            <Sparkles className="size-3 text-amber-500" />
            <span>Sistem Proteksi Rute Aktif • Akses Ilegal Dicegah Otomatis</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 text-center text-[11px] text-slate-400 dark:text-zinc-600 font-medium">
        © 2026 LANTAS • Layanan Terpadu Administrasi Sekolah
      </footer>
    </div>
  );
}
