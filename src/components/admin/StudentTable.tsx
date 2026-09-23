"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, Trash2, CheckCircle2, XCircle, Edit, UserX, ArrowUpDown, History } from "lucide-react";
import Link from "next/link";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import { CreateStudentDialog } from "./CreateStudentDialog";
import { ImportStudentsDialog } from "./ImportStudentsDialog";
import { StudentDetailDialog } from "./StudentDetailDialog";
import { EditStudentDialog } from "./EditStudentDialog";
import { deleteStudent, bulkDeleteStudents } from "@/app/actions/students";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  username: string;
  class?: { name: string } | null;
  classId?: string | null;
  nisn: string | null;
  profileCompleted: boolean;
  avatarUrl: string | null;
  address: string | null;
  phone: string | null;
  birthDate: Date | null;
  gender: string | null;
  parentName: string | null;
}

export function StudentTable({ initialStudents, classes }: { initialStudents: Student[], classes: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const filteredStudents = initialStudents.filter((student) => {
    const matchesSearch = (() => {
      const q = searchQuery.toLowerCase();
      return (
        student.name.toLowerCase().includes(q) ||
        student.username.toLowerCase().includes(q) ||
        (student.class?.name?.toLowerCase() || "").includes(q) ||
        (student.nisn?.toLowerCase() || "").includes(q)
      );
    })();
    
    const matchesClass = classFilter === "ALL" || student.classId === classFilter;
    
    return matchesSearch && matchesClass;
  }).sort((a, b) => {
    if (sortOrder === "asc") {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  const allFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.has(s.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect all filtered
      const newSet = new Set(selectedIds);
      filteredStudents.forEach(s => newSet.delete(s.id));
      setSelectedIds(newSet);
    } else {
      // Select all filtered
      const newSet = new Set(selectedIds);
      filteredStudents.forEach(s => newSet.add(s.id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteStudent(id);
    if (result.success) {
      toast.success("Siswa berhasil dihapus");
    } else {
      toast.error(result.error);
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    const ids = Array.from(selectedIds);
    const result = await bulkDeleteStudents(ids);
    if (result.success) {
      toast.success(`${result.deleted} siswa berhasil dihapus`);
      setSelectedIds(new Set());
    } else {
      toast.error(result.error);
    }
    setBulkDeleting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="flex flex-1 gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <Input
              type="text"
              placeholder="Cari nama, username, nisn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 rounded-xl bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 focus:border-slate-900"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => { setClassFilter(e.target.value); setSelectedIds(new Set()); }}
            className="text-xs h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 focus:border-slate-900 outline-none w-32 shrink-0"
          >
            <option value="ALL">Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ImportStudentsDialog classes={classes} />
          <CreateStudentDialog classes={classes} />
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/30 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center size-7 rounded-lg bg-indigo-600 text-white text-xs font-bold">
              {selectedIds.size}
            </span>
            <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">
              siswa dipilih
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="h-7 text-[11px] border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg ml-1 cursor-pointer"
            >
              Batal Pilih
            </Button>
          </div>
          <ConfirmDeleteDialog
            title={`Hapus ${selectedIds.size} Siswa Terpilih?`}
            description={`Semua data pengajuan izin dan absensi dari ${selectedIds.size} siswa ini juga akan terhapus secara permanen. Tindakan ini tidak bisa dibatalkan.`}
            onConfirm={handleBulkDelete}
            trigger={
              <Button
                size="sm"
                disabled={bulkDeleting}
                className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-xl gap-1.5 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                Hapus Terpilih
              </Button>
            }
          />
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40px] text-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected && filteredStudents.length > 0}
                    onChange={toggleSelectAll}
                    className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                  />
                </TableHead>
                <TableHead 
                  className="w-[28%] font-bold text-xs text-slate-700 dark:text-zinc-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors select-none"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  <div className="flex items-center gap-1.5">
                    Nama Lengkap
                    <ArrowUpDown className="size-3.5 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="w-[18%] font-bold text-xs text-slate-700 dark:text-zinc-300">Username</TableHead>
                <TableHead className="w-[18%] font-bold text-xs text-slate-700 dark:text-zinc-300">NISN / Kelas</TableHead>
                <TableHead className="w-[12%] font-bold text-xs text-center text-slate-700 dark:text-zinc-300">Status Profil</TableHead>
                <TableHead className="w-[15%] font-bold text-xs text-right pr-4 text-slate-700 dark:text-zinc-300">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow 
                    key={student.id} 
                    className={`hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors border-b border-slate-100 dark:border-zinc-800 ${selectedIds.has(student.id) ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                  >
                    <TableCell className="align-middle py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(student.id)}
                        onChange={() => toggleSelect(student.id)}
                        className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                      />
                    </TableCell>
                    <TableCell className="align-middle py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-zinc-700">
                          {student.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={student.avatarUrl} alt={student.name} className="size-full object-cover" />
                          ) : (
                            <span className="font-bold text-xs text-slate-500">
                              {student.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {student.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle py-3 text-xs text-slate-600 dark:text-zinc-400 font-mono">
                      {student.username}
                    </TableCell>
                    <TableCell className="align-middle py-3">
                      <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        {student.nisn || "-"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {student.class?.name || "Belum diatur"}
                      </p>
                    </TableCell>
                    <TableCell className="align-middle py-3 text-center">
                      {student.profileCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="size-3" /> Lengkap
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <XCircle className="size-3" /> Belum Lengkap
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="align-middle py-3 text-right pr-4">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStudent(student)}
                          className="h-7 px-2 text-[11px] border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100"
                        >
                          <Eye className="size-3.5 mr-1" /> Detail
                        </Button>
                        <Link href={`/admin/requests?q=${encodeURIComponent(student.name)}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px] border-amber-200 text-amber-700 hover:bg-amber-50 cursor-pointer"
                            title="Lihat Riwayat Izin"
                          >
                            <History className="size-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStudentToEdit(student)}
                          className="h-7 px-2 text-[11px] border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          title="Edit Siswa"
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <ConfirmDeleteDialog
                          title={`Hapus Siswa: ${student.name}?`}
                          description="Semua data pengajuan izin siswa ini juga akan terhapus secara permanen. Tindakan ini tidak bisa dibatalkan."
                          onConfirm={() => handleDelete(student.id)}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-[11px] border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="size-12 rounded-full bg-slate-100 dark:bg-zinc-800/80 flex items-center justify-center">
                        <UserX className="size-6 text-slate-400 dark:text-zinc-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-white">Tidak ada data siswa</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                          Siswa tidak ditemukan atau belum ada data yang ditambahkan. Silakan klik &quot;Tambah Siswa&quot; untuk menambahkan data baru.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {selectedStudent && (
        <StudentDetailDialog student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
      {studentToEdit && (
        <EditStudentDialog 
          student={studentToEdit} 
          classes={classes} 
          open={!!studentToEdit} 
          onClose={() => setStudentToEdit(null)} 
        />
      )}
    </div>
  );
}
