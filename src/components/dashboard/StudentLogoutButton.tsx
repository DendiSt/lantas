"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";

export function StudentLogoutButton() {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsLogoutOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-800 transition-colors"
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">Keluar</span>
      </button>

      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Konfirmasi Keluar</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600 dark:text-zinc-400">
            Apakah Anda yakin ingin keluar dari portal siswa? Anda harus login kembali untuk mengajukan izin.
          </div>
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline" onClick={() => setIsLogoutOpen(false)} className="rounded-xl h-10 px-4">Batal</Button>
            <form action={logoutAction}>
              <Button variant="destructive" type="submit" className="rounded-xl h-10 px-4">Ya, Keluar</Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
