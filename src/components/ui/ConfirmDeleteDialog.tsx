"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  trigger: React.ReactNode;
}

export function ConfirmDeleteDialog({
  title,
  description,
  onConfirm,
  trigger,
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <Dialog open={open} onOpenChange={(v) => !isLoading && setOpen(v)}>
        <DialogContent className="max-w-sm w-[90vw] rounded-2xl p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <DialogHeader className="flex flex-col items-center text-center gap-3 pb-2">
            <div className="size-14 rounded-full bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
              <AlertTriangle className="size-7 text-rose-600 dark:text-rose-400" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl dark:text-white cursor-pointer"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold gap-1.5 cursor-pointer"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
