"use client";

import { useState, useActionState, useEffect } from "react";
import { Loader2, AlertCircle, Eye, EyeOff, Sparkles, ShieldCheck, ClipboardCheck, BarChart3, Lock, User, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { login, AuthState } from "@/app/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ParticleBackground } from "@/components/shared/ParticleBackground";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<AuthState | null, FormData>(
    login,
    null
  );
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.success && state.redirectTo) {
      toast.success(`Selamat datang kembali, ${state.userName}!`);
      setTimeout(() => {
        router.push(state.redirectTo!);
      }, 500);
    }
  }, [state, router]);

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 text-slate-900 dark:text-zinc-100 overflow-hidden">
      <ParticleBackground particleCount={65} repulseDistance={130} speed={0.35} />

      {/* Top Bar Floating Controls */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden card-hover-lift">
          
          {/* Left Branding Showcase (Desktop Left, Mobile Bottom) */}
          <div className="order-2 lg:order-1 lg:col-span-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-950 text-white p-6 sm:p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Background decorative glows */}
            <div className="absolute -top-24 -left-24 size-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 size-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Logo & System Badge */}
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2.5 flex items-center justify-center shadow-lg">
                  <Image
                    src="/logoLantas.png"
                    alt="Logo LANTAS"
                    width={56}
                    height={56}
                    className="size-10 object-contain drop-shadow"
                    priority
                    unoptimized
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-2xl tracking-tight text-white">LANTAS</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      v1.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">Layanan Terpadu Administrasi Sekolah</p>
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-2 pt-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Manajemen Perizinan & Absensi Sekolah Digital
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
                  Aplikasi terpadu untuk administrasi perizinan siswa oleh Tata Usaha dan sinkronisasi presensi guru kelas secara otomatis.
                </p>
              </div>

              {/* Key Features Pill Cards */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs transition-all hover:bg-white/10">
                  <div className="size-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0">
                    <ClipboardCheck className="size-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Sinkronisasi Absensi Guru</p>
                    <p className="text-[11px] text-slate-400">Otomatis pre-fill izin & sakit pada jurnal presensi kelas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs transition-all hover:bg-white/10">
                  <div className="size-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Verifikasi TU Real-time</p>
                    <p className="text-[11px] text-slate-400">Persetujuan terpusat & notifikasi status langsung</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs transition-all hover:bg-white/10">
                  <div className="size-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                    <BarChart3 className="size-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Rekapitulasi Otomatis</p>
                    <p className="text-[11px] text-slate-400">Laporan presensi & grafik ketidakhadiran komprehensif</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom mini status */}
            <div className="relative z-10 pt-8 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                Sistem Aktif & Terlindungi
              </span>
              <span>SMK / SMA Negeri</span>
            </div>
          </div>

          {/* Right Column: Clean Glassmorphic Login Form (Desktop Right, Mobile Top) */}
          <div className="order-1 lg:order-2 lg:col-span-6 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-6">
              
              {/* Mobile-only compact logo header */}
              <div className="lg:hidden flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <div className="size-11 rounded-2xl bg-slate-900 dark:bg-zinc-800 border border-slate-800 dark:border-zinc-700 p-2 flex items-center justify-center shadow-xs shrink-0">
                  <Image
                    src="/logoLantas.png"
                    alt="Logo LANTAS"
                    width={40}
                    height={40}
                    className="size-7 object-contain"
                    priority
                    unoptimized
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">LANTAS</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold tracking-wide uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      v1.0
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Layanan Terpadu Administrasi Sekolah</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
                  <Sparkles className="size-3.5" />
                  Portal Masuk
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Selamat Datang
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Masukkan nama pengguna dan kata sandi Anda untuk mengakses akun Siswa, Guru, atau Staf TU.
                </p>
              </div>

              {state?.error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs animate-in fade-in zoom-in-95 duration-200">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                  <div className="flex-1 font-medium leading-relaxed">{state.error}</div>
                </div>
              )}

              <form action={formAction} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Username / NISN
                  </Label>
                  <div className="relative">
                    <User className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      name="username"
                      required
                      placeholder="Masukkan username atau NISN..."
                      className="h-11 pl-10 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-all font-medium text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Kata Sandi
                    </Label>
                    <Link
                      href="/lupa-password"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                      Lupa kata sandi?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Masukkan kata sandi..."
                      className="h-11 pl-10 pr-10 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-all font-medium text-xs sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                      title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl font-bold mt-2 shadow-sm button-press transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Akun</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 text-center">
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                  Mengalami kendala saat login? Hubungi administrator TU sekolah.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-[11px] text-center text-slate-400 dark:text-zinc-600 mt-6 font-medium">
          © 2026 LANTAS • Layanan Terpadu Administrasi Sekolah • Hak Cipta Dilindungi
        </p>
      </div>
    </div>
  );
}
