"use client";

import { useState } from "react";
import { User as UserType, Class as ClassType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, Loader2, GraduationCap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createTeacher, updateTeacher, deleteTeacher } from "@/app/actions/teachers";

type TeacherWithClass = UserType & {
  homeroomClass?: ClassType | null;
};

export function TeacherListTable({ teachers, currentUserId }: { teachers: TeacherWithClass[], currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithClass | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredTeachers = teachers.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createTeacher(formData);
    
    if (result.success) {
      toast.success("Guru berhasil ditambahkan");
      setIsCreateOpen(false);
    } else {
      toast.error(result.error || "Gagal menambahkan guru");
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await updateTeacher(selectedTeacher.id, formData);
    
    if (result.success) {
      toast.success("Data guru berhasil diperbarui");
      setIsEditOpen(false);
    } else {
      toast.error(result.error || "Gagal memperbarui guru");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedTeacher) return;
    setLoading(true);
    
    const result = await deleteTeacher(selectedTeacher.id);
    
    if (result.success) {
      toast.success("Guru berhasil dihapus");
      setIsDeleteOpen(false);
    } else {
      toast.error(result.error || "Gagal menghapus guru");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input 
            placeholder="Cari guru..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl"
          />
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="h-10 rounded-xl shrink-0 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 cursor-pointer">
          <Plus className="size-4 mr-2" />
          Tambah Guru
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-zinc-950/50 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-4 whitespace-nowrap">Nama Guru</th>
                <th className="px-5 py-4 whitespace-nowrap">Username</th>
                <th className="px-5 py-4 whitespace-nowrap">Wali Kelas</th>
                <th className="px-5 py-4 whitespace-nowrap text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500 dark:text-zinc-400">
                    Tidak ada data guru.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50 dark:hover:bg-zinc-950/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <GraduationCap className="size-4" />
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {teacher.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-zinc-300">
                      {teacher.username}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-zinc-300">
                      {teacher.homeroomClass ? (
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-xs font-semibold">
                          {teacher.homeroomClass.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Belum ditugaskan</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setIsEditOpen(true);
                          }}
                          className="h-8 px-2 text-xs rounded-lg gap-1 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Edit className="size-3.5" /> Edit
                        </Button>
                        {teacher.id !== currentUserId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setIsDeleteOpen(true);
                            }}
                            className="h-8 px-2 text-xs rounded-lg gap-1 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Trash2 className="size-3.5" /> Hapus
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Guru Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nama Lengkap</Label>
              <Input name="name" required placeholder="Contoh: Budi Santoso, S.Pd" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Username</Label>
              <Input name="username" required placeholder="Contoh: budi_guru" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Kata Sandi</Label>
              <Input type="password" name="password" required className="rounded-xl" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">Batal</Button>
              <Button type="submit" disabled={loading} className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                {loading && <Loader2 className="size-4 animate-spin mr-2" />} Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Guru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nama Lengkap</Label>
              <Input name="name" defaultValue={selectedTeacher?.name} required className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Username</Label>
              <Input name="username" defaultValue={selectedTeacher?.username} required className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Kata Sandi (Opsional)</Label>
              <Input type="password" name="password" placeholder="Kosongkan jika tidak ingin mengubah" className="rounded-xl" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl">Batal</Button>
              <Button type="submit" disabled={loading} className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                {loading && <Loader2 className="size-4 animate-spin mr-2" />} Simpan Perubahan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-rose-600">Hapus Guru</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-slate-600">
            Apakah Anda yakin ingin menghapus guru <strong>{selectedTeacher?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-xl">Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading} className="rounded-xl">
              {loading && <Loader2 className="size-4 animate-spin mr-2" />} Ya, Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
