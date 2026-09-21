"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, Loader2, School } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createClass, updateClass, deleteClass } from "@/app/actions/classes";

interface ClassData {
  id: string;
  name: string;
  createdAt: Date;
  homeroomTeacher?: { id: string; name: string } | null;
  _count: { students: number };
}

interface TeacherData {
  id: string;
  name: string;
}

export function ClassListTable({ initialClasses, teachers = [] }: { initialClasses: ClassData[], teachers?: TeacherData[] }) {
  const [q, setQ] = useState("");
  const [classes, setClasses] = useState<ClassData[]>(initialClasses);
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Form States
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredClasses = classes.filter(
    (c) => c.name.toLowerCase().includes(q.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await createClass(formData);
    
    if (result.success) {
      toast.success("Kelas berhasil ditambahkan");
      setIsCreateOpen(false);
      window.location.reload(); // Quick refresh to get new data
    } else {
      toast.error(result.error || "Gagal membuat kelas");
    }
    setIsSubmitting(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClass) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateClass(selectedClass.id, formData);
    
    if (result.success) {
      toast.success("Kelas berhasil diperbarui");
      setIsEditOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error || "Gagal memperbarui kelas");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    
    setIsSubmitting(true);
    const result = await deleteClass(selectedClass.id);
    
    if (result.success) {
      toast.success("Kelas berhasil dihapus");
      setIsDeleteOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error || "Gagal menghapus kelas");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Search & Add Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-zinc-500" />
          <Input
            placeholder="Cari kelas..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 text-xs h-9 rounded-xl bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 focus:border-slate-900"
          />
        </div>
        
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="h-9 px-4 text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl shadow-xs gap-2 shrink-0 w-full sm:w-auto"
        >
          <Plus className="size-4" />
          Tambah Kelas
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-zinc-800/50 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-4 font-semibold">Nama Kelas</th>
                <th className="px-5 py-4 font-semibold text-center">Jumlah Siswa</th>
                <th className="px-5 py-4 font-semibold">Wali Kelas</th>
                <th className="px-5 py-4 font-semibold">Tanggal Dibuat</th>
                <th className="px-5 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500 dark:text-zinc-400">
                    <div className="flex flex-col items-center gap-2">
                      <School className="size-8 text-slate-300 dark:text-zinc-600" />
                      <p>Tidak ada kelas ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {cls.name}
                    </td>
                    <td className="px-5 py-4 text-center text-slate-600 dark:text-zinc-300">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-1.5 h-6 rounded-md bg-slate-100 dark:bg-zinc-800 text-xs font-semibold">
                        {cls._count.students}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-zinc-300">
                      {cls.homeroomTeacher ? (
                        <span className="text-sm font-medium">{cls.homeroomTeacher.name}</span>
                      ) : (
                        <span className="text-xs italic text-slate-400">Belum diatur</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-zinc-400 text-xs">
                      {new Date(cls.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClass(cls);
                            setIsEditOpen(true);
                          }}
                          className="h-7 px-2 text-[11px] border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                          title="Edit Kelas"
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClass(cls);
                            setIsDeleteOpen(true);
                          }}
                          className="h-7 px-2 text-[11px] border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
                          title="Hapus Kelas"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Tambah Kelas</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nama Kelas</Label>
              <Input
                name="name"
                placeholder="Contoh: 10 A"
                required
                autoFocus
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Wali Kelas (Opsional)</Label>
              <select 
                name="homeroomTeacherId"
                className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
              >
                <option value="">-- Pilih Wali Kelas --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl">Batal</Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Kelas</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nama Kelas</Label>
              <Input
                name="name"
                defaultValue={selectedClass?.name}
                required
                autoFocus
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Wali Kelas (Opsional)</Label>
              <select 
                name="homeroomTeacherId"
                defaultValue={selectedClass?.homeroomTeacher?.id || ""}
                className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
              >
                <option value="">-- Pilih Wali Kelas --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl">Batal</Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-rose-600">Hapus Kelas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Apakah Anda yakin ingin menghapus kelas <strong>{selectedClass?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            {selectedClass?._count.students ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 text-xs rounded-xl border border-amber-200 dark:border-amber-900/50">
                <strong className="font-semibold block mb-1">Perhatian:</strong>
                Kelas ini masih memiliki {selectedClass._count.students} siswa. Anda harus memindahkan atau menghapus siswa tersebut terlebih dahulu sebelum menghapus kelas ini.
              </div>
            ) : null}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsDeleteOpen(false)} className="rounded-xl">Batal</Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting || (selectedClass?._count.students ?? 0) > 0}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Hapus Permanen"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
