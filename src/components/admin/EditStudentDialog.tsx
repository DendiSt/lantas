"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2 } from "lucide-react";
import { updateStudent } from "@/app/actions/students";
import { toast } from "sonner";

export function EditStudentDialog({ 
  student, 
  classes, 
  open, 
  onClose 
}: { 
  student: any; 
  classes: any[]; 
  open: boolean; 
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateStudent(student.id, formData);
    if (result.success) {
      toast.success("Data siswa berhasil diperbarui");
      onClose();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md p-5 rounded-2xl">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Edit className="size-4" />
            Edit Data Siswa
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Nama Lengkap</Label>
            <Input 
              id="name" 
              name="name" 
              defaultValue={student.name} 
              required 
              className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" 
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Username</Label>
            <Input 
              id="username" 
              name="username" 
              defaultValue={student.username} 
              required 
              className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" 
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nisn" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">NISN (Opsional)</Label>
            <Input 
              id="nisn" 
              name="nisn" 
              defaultValue={student.nisn || ""} 
              placeholder="Nomor Induk Siswa Nasional" 
              className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="classId" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Kelas (Opsional)</Label>
            <select
              id="classId"
              name="classId"
              defaultValue={student.classId || ""}
              className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 focus:border-slate-900 outline-none"
            >
              <option value="">Pilih Kelas</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/50 space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Reset Password (Opsional)</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="Kosongkan jika tidak ingin mereset" 
              className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" 
            />
            <p className="text-[10px] text-slate-500">Isi hanya jika Anda ingin mengatur ulang password siswa ini.</p>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs shadow-xs">
              {loading ? <Loader2 className="size-3.5 animate-spin mr-1" /> : null}
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
