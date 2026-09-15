"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound } from "lucide-react";
import { changePassword } from "@/app/actions/profile";
import { toast } from "sonner";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<any, FormData>(
    changePassword,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Kata sandi berhasil diubah");
      // Optional: Reset form fields if you want to use a ref
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm mt-6">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound className="size-5 text-slate-900 dark:text-white" />
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Ganti Kata Sandi</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Amankan akun Anda secara berkala.</p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Kata Sandi Saat Ini</Label>
          <Input type="password" name="currentPassword" required className="text-xs h-10 rounded-xl" />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Kata Sandi Baru</Label>
          <Input type="password" name="newPassword" required className="text-xs h-10 rounded-xl" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Konfirmasi Kata Sandi Baru</Label>
          <Input type="password" name="confirmPassword" required className="text-xs h-10 rounded-xl" />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          variant="outline"
          className="w-full h-11 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-xl font-semibold mt-4 gap-2"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          <span>{isPending ? "Menyimpan..." : "Perbarui Kata Sandi"}</span>
        </Button>
      </form>
    </div>
  );
}
