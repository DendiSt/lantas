"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Loader2, BookOpen } from "lucide-react";
import { createSubject, deleteSubject, updateSubject } from "@/app/actions/subjects";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Subject {
  id: string;
  name: string;
  _count: { teachers: number };
}

export function SubjectManager({ initialSubjects }: { initialSubjects: Subject[] }) {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    const result = await createSubject(name.trim());
    if (result.success && result.subject) {
      toast.success("Mata pelajaran berhasil ditambahkan");
      setSubjects([...subjects, { ...result.subject, _count: { teachers: 0 } }]);
      setIsAddOpen(false);
      setName("");
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedSubject) return;
    
    setLoading(true);
    const result = await updateSubject(selectedSubject.id, name.trim());
    if (result.success && result.subject) {
      toast.success("Mata pelajaran berhasil diubah");
      setSubjects(subjects.map(s => s.id === selectedSubject.id ? { ...s, name: result.subject.name } : s));
      setIsEditOpen(false);
      setSelectedSubject(null);
      setName("");
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedSubject) return;
    
    setLoading(true);
    const result = await deleteSubject(selectedSubject.id);
    if (result.success) {
      toast.success("Mata pelajaran berhasil dihapus");
      setSubjects(subjects.filter(s => s.id !== selectedSubject.id));
      setIsDeleteOpen(false);
      setSelectedSubject(null);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const openEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setName(subject.name);
    setIsEditOpen(true);
  };

  const openDelete = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => { setName(""); setIsAddOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs gap-2 h-10 px-5"
        >
          <Plus className="size-4" />
          Tambah Mapel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {subjects.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center">
             <div className="size-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
               <BookOpen className="size-6 text-slate-400" />
             </div>
             <p className="text-sm font-semibold text-slate-900 dark:text-white">Belum ada mata pelajaran</p>
             <p className="text-xs text-slate-500 mt-1">Tambahkan mata pelajaran untuk digunakan di Jurnal Kelas.</p>
          </div>
        ) : (
          subjects.map((subject) => (
            <div key={subject.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between group">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{subject.name}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{subject._count.teachers} Guru Pengampu</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(subject)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                >
                  <Edit2 className="size-4" />
                </button>
                <button
                  onClick={() => openDelete(subject)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Tambah Mapel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Nama Mata Pelajaran</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Cth: Matematika"
                className="w-full mt-1.5 text-sm h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-indigo-500 outline-none"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl h-10 px-4">Batal</Button>
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-4 gap-2">
                {loading && <Loader2 className="size-4 animate-spin" />}
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Ubah Mapel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Nama Mata Pelajaran</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Cth: Matematika"
                className="w-full mt-1.5 text-sm h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-indigo-500 outline-none"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl h-10 px-4">Batal</Button>
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-4 gap-2">
                {loading && <Loader2 className="size-4 animate-spin" />}
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Hapus Mapel</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-slate-600 dark:text-zinc-400 space-y-2">
            <p>Apakah Anda yakin ingin menghapus <strong>{selectedSubject?.name}</strong>?</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg">Peringatan: Menghapus mapel juga akan menghapus/merusak data absensi terkait mapel ini. Pastikan tidak ada data yang terikat.</p>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-xl h-10 px-4">Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading} className="rounded-xl h-10 px-4 gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
