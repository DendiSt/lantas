"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function ProfileIncompletePopup({ profileCompleted }: { profileCompleted: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!profileCompleted) {
      setIsOpen(true);
    }
  }, [profileCompleted]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (profileCompleted) setIsOpen(open); }}>
      <DialogContent className="max-w-sm rounded-2xl" showCloseButton={false}>
        <DialogHeader className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
            <UserPlus className="size-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-center text-slate-900 dark:text-white">
            Lengkapi Profil Anda
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-600 dark:text-zinc-400">
            Selamat datang! Anda diwajibkan untuk melengkapi data diri terlebih dahulu sebelum dapat mengajukan izin.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button 
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold"
            onClick={() => {
              setIsOpen(false);
              router.push("/dashboard/profile");
            }}
          >
            Lengkapi Sekarang
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
