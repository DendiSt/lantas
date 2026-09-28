"use client";

import { useActionState, useEffect, useState, Suspense } from "react";
import { GraduationCap, Loader2, AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/app/actions/reset-password";
import Link from "next/link";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, formAction, isPending] = useActionState<any, FormData>(
    resetPassword,
    null
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success("Kata sandi berhasil diperbarui!");
    }
  }, [state]);

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50">
        <AlertCircle className="size-10 text-rose-500 mb-3" />
        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Tautan Tidak Valid</h3>
        <p className="text-xs text-slate-600 dark:text-zinc-400">
          Tautan reset kata sandi tidak valid atau tidak ditemukan. Pastikan Anda mengklik tautan yang benar dari email Anda.
        </p>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
        <CheckCircle2 className="size-10 text-emerald-500 mb-3" />
        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Berhasil!</h3>
        <p className="text-xs text-slate-600 dark:text-zinc-400 mb-6">
          {state.message}
        </p>
        <Link href="/" className="w-full">
          <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl font-semibold shadow-sm">
            Kembali ke Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {state?.error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs mb-5">
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">{state.error}</div>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Kata Sandi Baru</Label>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Minimal 6 karakter..."
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

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Konfirmasi Kata Sandi Baru</Label>
          <div className="relative">
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder="Ketik ulang kata sandi..."
              className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
              Menyimpan...
            </>
          ) : (
            "Simpan Kata Sandi"
          )}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-900 dark:text-zinc-100">
      <div className="w-full max-w-md space-y-6">
        
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="mr-2 size-4" />
          Kembali ke Login
        </Link>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex size-14 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 items-center justify-center mb-2 shadow-md shadow-slate-900/10">
              <GraduationCap className="size-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Buat Sandi Baru
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Amankan akun LANTAS Anda
            </p>
          </div>

          <Suspense fallback={<div className="flex justify-center"><Loader2 className="size-6 animate-spin text-slate-400" /></div>}>
            <ResetPasswordForm />
          </Suspense>

        </div>
      </div>
    </div>
  );
}
