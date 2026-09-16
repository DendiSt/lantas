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
import { Search, UserPlus, Eye, KeyRound, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { CreateStudentDialog } from "./CreateStudentDialog";
import { StudentDetailDialog } from "./StudentDetailDialog";
import { deleteStudent, resetPassword } from "@/app/actions/students";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  username: string;
  class?: { name: string } | null;
  nisn: string | null;
  profileCompleted: boolean;
  avatarUrl: string | null;
  address: string | null;
  phone: string | null;
  birthDate: Date | null;
  gender: string | null;
  parentName: string | null;
}

export function StudentTable({ initialStudents }: { initialStudents: Student[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = initialStudents.filter((student) => {
    const q = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(q) ||
      student.username.toLowerCase().includes(q) ||
      (student.class?.name?.toLowerCase() || "").includes(q) ||
      (student.nisn?.toLowerCase() || "").includes(q)
    );
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus siswa ${name}? Semua data pengajuan izinnya juga akan terhapus.`)) {
      const result = await deleteStudent(id);
      if (result.success) {
        toast.success("Siswa berhasil dihapus");
      } else {
        toast.error(result.error);
      }
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    if (confirm(`Reset password siswa ${name} ke "password123"?`)) {
      const result = await resetPassword(id);
      if (result.success) {
        toast.success("Password berhasil direset menjadi 'password123'");
      } else {
        toast.error(result.error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <Input
            type="text"
            placeholder="Cari nama, username, nisn, kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 rounded-xl bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 focus:border-slate-900"
          />
        </div>
        <CreateStudentDialog />
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-xs text-slate-700 dark:text-zinc-300">Nama Lengkap</TableHead>
                <TableHead className="font-bold text-xs text-slate-700 dark:text-zinc-300">Username</TableHead>
                <TableHead className="font-bold text-xs text-slate-700 dark:text-zinc-300">NISN / Kelas</TableHead>
                <TableHead className="font-bold text-xs text-center text-slate-700 dark:text-zinc-300">Status Profil</TableHead>
                <TableHead className="font-bold text-xs text-right pr-4 text-slate-700 dark:text-zinc-300">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors border-b border-slate-100 dark:border-zinc-800">
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(student.id, student.name)}
                          className="h-7 px-2 text-[11px] border-amber-200 text-amber-700 hover:bg-amber-50"
                          title="Reset Password"
                        >
                          <KeyRound className="size-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(student.id, student.name)}
                          className="h-7 px-2 text-[11px] border-rose-200 text-rose-700 hover:bg-rose-50"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500 text-xs">
                    Tidak ada siswa ditemukan
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
    </div>
  );
}
