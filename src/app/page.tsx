"use client";

import { useState, useActionState, useEffect } from "react";
import { GraduationCap, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { login, AuthState } from "@/app/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-900 dark:text-zinc-100">
      <div className="w-full max-w-md space-y-6">
        
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex size-14 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 items-center justify-center mb-2 shadow-md shadow-slate-900/10">
              <GraduationCap className="size-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              LANTAS
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Layanan Terpadu Administrasi Sekolah
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-[250px] mx-auto leading-relaxed mt-1">
              Silakan masuk menggunakan akun Siswa atau Staf TU Anda.
            </p>
          </div>

          {state?.error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs mb-5">
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">{state.error}</div>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Username</Label>
              <Input
                name="username"
                required
                placeholder="Masukkan username..."
                className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Masukkan password..."
                  className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl font-semibold mt-4 shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
          
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-zinc-800 text-center">
            <p className="text-[11px] text-slate-500">
              Sistem Perizinan Mandiri & Verifikasi TU Real-time
            </p>
          </div>
        </div>
        
        <p className="text-[11px] text-center text-slate-400 dark:text-zinc-500">
          Sekolah • MVP Prototyping Phase
        </p>
      </div>
    </div>
  );
}
