"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";

interface StudentLogoutButtonProps {
  title?: string;
  description?: string;
  label?: string;
  className?: string;
}

export function StudentLogoutButton({
  title = "Konfirmasi Keluar",
  description = "Apakah Anda yakin ingin keluar dari akun ini? Anda harus login kembali untuk masuk ke sistem.",
  label = "Keluar",
  className,
}: StudentLogoutButtonProps) {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsLogoutOpen(true)}
        className={className || "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-800 transition-colors cursor-pointer"}
        title="Keluar dari akun"
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">{label}</span>
      </button>

      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="size-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <LogOut className="size-4" />
              </div>
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            {description}
          </div>
          <div className="flex gap-2.5 justify-end mt-2">
            <Button variant="outline" onClick={() => setIsLogoutOpen(false)} className="rounded-xl h-10 px-4 cursor-pointer">
              Batal
            </Button>
            <form action={logoutAction}>
              <Button variant="destructive" type="submit" className="rounded-xl h-10 px-4 cursor-pointer">
                Ya, Keluar
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
