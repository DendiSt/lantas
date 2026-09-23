"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

interface StudentDetailDialogProps {
  student: any;
  onClose: () => void;
}

export function StudentDetailDialog({ student, onClose }: StudentDetailDialogProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800">
        <div className="bg-slate-900 p-6 flex flex-col items-center justify-center relative">
          <div className="size-20 rounded-full bg-white text-slate-900 flex items-center justify-center text-2xl font-bold shadow-lg overflow-hidden border-2 border-white">
            {student.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={student.avatarUrl} alt={student.name} className="size-full object-cover" />
            ) : (
              student.name.charAt(0)
            )}
          </div>
          <h2 className="text-lg font-bold text-white mt-3">{student.name}</h2>
          <p className="text-xs text-slate-300 font-mono mt-0.5">@{student.username}</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
            <span className="text-slate-500">Status Profil</span>
            {student.profileCompleted ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                <CheckCircle2 className="size-3.5" /> Lengkap
              </span>
            ) : (
              <span className="font-semibold text-amber-600">Belum Lengkap</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-500 mb-0.5">NISN</p>
              <p className="font-semibold">{student.nisn || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Kelas</p>
              <p className="font-semibold">{student.class?.name || "-"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-0.5">No. HP</p>
              <p className="font-semibold">{student.phone || "-"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-0.5">Nama Orang Tua</p>
              <p className="font-semibold">{student.parentName || "-"}</p>
            </div>
          </div>

          <div className="text-xs pt-1">
            <p className="text-slate-500 mb-0.5">Alamat</p>
            <p className="font-semibold leading-relaxed">{student.address || "-"}</p>
          </div>

          <div className="flex items-center justify-between text-[10px] pt-3 mt-2 border-t border-slate-100 dark:border-zinc-800 text-slate-400">
            <span>Terakhir Login</span>
            <span className="font-medium text-slate-500 dark:text-zinc-400">
              {student.lastLogin 
                ? new Date(student.lastLogin).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) 
                : "Belum pernah login"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
