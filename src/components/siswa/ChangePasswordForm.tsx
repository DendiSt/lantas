"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound } from "lucide-react";
import { changePassword } from "@/app/actions/profile";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ChangePasswordDialog({ trigger }: { trigger?: React.ReactElement | null }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<any, FormData>(
    changePassword,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Kata sandi berhasil diubah");
      setOpen(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!isPending) setOpen(val); }}>
      <DialogTrigger render={
        trigger || (
          <Button variant="outline" className="w-full justify-start gap-2 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50">
            <KeyRound className="size-5 text-slate-700 dark:text-zinc-300" />
            <div className="flex flex-col items-start gap-0.5">
              <span className="font-bold text-slate-900 dark:text-white leading-none">Ganti Kata Sandi</span>
              <span className="text-[10px] font-normal text-slate-500 leading-none">Amankan akun Anda secara berkala</span>
            </div>
          </Button>
        )
      } />
      
      <DialogContent className="sm:max-w-md p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <DialogHeader className="pb-3 border-b border-slate-200 dark:border-zinc-800">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <KeyRound className="size-4" /> Ganti Kata Sandi
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Kata Sandi Saat Ini</Label>
            <Input type="password" name="currentPassword" required className="text-xs h-10 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700" />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Kata Sandi Baru</Label>
            <Input type="password" name="newPassword" required className="text-xs h-10 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Konfirmasi Kata Sandi Baru</Label>
            <Input type="password" name="confirmPassword" required className="text-xs h-10 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700" />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-zinc-800 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setOpen(false)}
              className="rounded-xl text-xs cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl text-xs font-medium cursor-pointer gap-2"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isPending ? "Menyimpan..." : "Perbarui Kata Sandi"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
