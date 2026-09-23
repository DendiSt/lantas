"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { createStudent } from "@/app/actions/students";
import { toast } from "sonner";

export function CreateStudentDialog({ classes }: { classes: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createStudent(null, formData);
    if (result.success) {
      toast.success("Siswa berhasil ditambahkan");
      setOpen(false);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center h-9 px-3 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs gap-1.5 cursor-pointer">
        <UserPlus className="size-4" />
        <span>Tambah Siswa</span>
      </DialogTrigger>
      <DialogContent className="max-w-md p-5 rounded-2xl">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <UserPlus className="size-4" />
            Tambah Data Siswa
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Nama Lengkap</Label>
            <Input name="name" required minLength={3} placeholder="Contoh: Budi Santoso" className="h-9 text-xs rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Username</Label>
            <Input name="username" required minLength={4} pattern="^[a-z0-9_]+$" title="Hanya huruf kecil, angka, dan underscore" placeholder="Contoh: budi123" className="h-9 text-xs rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nisn" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">NISN (Opsional)</Label>
            <Input 
              id="nisn" 
              name="nisn" 
              placeholder="10 digit angka"
              pattern="^\d{10}$"
              maxLength={10}
              className="h-9 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="classId" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Kelas (Opsional)</Label>
            <select
              id="classId"
              name="classId"
              className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 focus:border-slate-900 outline-none"
            >
              <option value="">Pilih Kelas</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Password Sementara</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="Min. 6 karakter"
              required 
              minLength={6}
              className="h-9 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
            />
            <p className="text-[10px] text-slate-500">Siswa dapat mengubah password ini nanti.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="rounded-xl text-xs">
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="bg-slate-900 text-white rounded-xl text-xs gap-1.5">
              {loading && <Loader2 className="size-3.5 animate-spin" />}
              Simpan Siswa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
