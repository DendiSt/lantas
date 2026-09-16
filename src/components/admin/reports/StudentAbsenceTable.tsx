"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, FileText, CheckCircle2, XCircle, Clock, Download } from "lucide-react";
import { RequestType, RequestStatus } from "@prisma/client";
import * as XLSX from "xlsx";

interface RequestItem {
  id: string;
  type: RequestType;
  reason: string;
  status: RequestStatus;
  rejectionNote: string | null;
  attachmentUrl: string | null;
  createdAt: Date;
  reviewer?: { name: string } | null;
}

interface StudentData {
  id: string;
  name: string;
  classId: string | null;
  totalAbsences: number;
  requests: RequestItem[];
}

interface StudentAbsenceTableProps {
  students: StudentData[];
}

export function StudentAbsenceTable({ students }: StudentAbsenceTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700"><CheckCircle2 className="size-3" /> Disetujui</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700"><XCircle className="size-3" /> Ditolak</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700"><Clock className="size-3" /> Menunggu</span>;
    }
  };

  const handleExportExcel = () => {
    const exportData = students.map((student, index) => {
      let sakit = 0, pulang = 0, alpha = 0, lainnya = 0;
      student.requests.forEach(req => {
        if (req.type === 'SAKIT') sakit++;
        else if (req.type === 'IZIN_PULANG') pulang++;
        else if (req.type === 'TANPA_KETERANGAN') alpha++;
        else lainnya++;
      });

      return {
        "No": index + 1,
        "Nama Siswa": student.name,
        "Kelas": student.classId || "-",
        "Total Izin": student.totalAbsences,
        "Sakit": sakit,
        "Pulang Awal": pulang,
        "Alpha": alpha,
        "Lain-lain": lainnya
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Absensi");
    XLSX.writeFile(workbook, `Laporan_Absensi_Siswa_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          <Download className="size-4" />
          Export ke Excel
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-zinc-800/50 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-xl">Nama Siswa</th>
              <th className="px-4 py-3 font-semibold">Kelas</th>
              <th className="px-4 py-3 font-semibold text-center">Jumlah Ketidakhadiran</th>
              <th className="px-4 py-3 font-semibold text-center rounded-tr-xl">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Belum ada data siswa
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {student.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">
                    {student.classId || "-"}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-zinc-200">
                    {student.totalAbsences}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="size-3.5" />
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-0 overflow-hidden">
          {selectedStudent && (
            <div className="flex flex-col h-full">
              <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
                <DialogTitle className="text-xl font-bold">Detail Ketidakhadiran: {selectedStudent.name}</DialogTitle>
                <div className="flex gap-4 mt-2 text-sm text-slate-600 dark:text-zinc-400">
                  <p>Kelas: <span className="font-semibold text-slate-900 dark:text-white">{selectedStudent.classId || "-"}</span></p>
                  <p>Total Absen: <span className="font-semibold text-slate-900 dark:text-white">{selectedStudent.totalAbsences} kali</span></p>
                </div>
              </DialogHeader>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                    <FileText className="size-4 text-slate-500" /> Riwayat Perizinan
                  </h3>
                  
                  {selectedStudent.requests.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                      Siswa ini belum pernah mengajukan izin.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedStudent.requests.map((req) => (
                        <div key={req.id} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="inline-block px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                {req.type.replace("IZIN_", "").replace("_", " ")}
                              </span>
                              <p className="text-xs text-slate-500 mt-1">{new Date(req.createdAt).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            {getStatusBadge(req.status)}
                          </div>
                          
                          <div className="mt-3 text-sm text-slate-700 dark:text-zinc-300 flex justify-between items-end">
                            <p className="flex-1"><span className="font-semibold">Alasan:</span> {req.reason}</p>
                            {req.attachmentUrl && (
                              <button
                                onClick={() => setSelectedEvidence(req.attachmentUrl)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg transition-colors ml-4 shrink-0"
                              >
                                <FileText className="size-3.5" />
                                Lihat Bukti
                              </button>
                            )}
                          </div>
                          
                          {req.status === "REJECTED" && req.rejectionNote && (
                            <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
                              <p className="text-xs font-semibold text-rose-800 dark:text-rose-400 mb-0.5 flex items-center gap-1.5">
                                <XCircle className="size-3.5" /> Alasan Penolakan:
                              </p>
                              <p className="text-sm text-rose-700 dark:text-rose-300">{req.rejectionNote}</p>
                            </div>
                          )}

                          {req.reviewer && req.status !== "PENDING" && (
                            <div className="bg-slate-50 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-700/50 mt-2 flex items-center gap-2">
                              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-500" />
                              <p className="text-xs text-slate-600 dark:text-zinc-300">
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  Diproses oleh {req.type === 'TANPA_KETERANGAN' ? 'Wali Kelas' : 'Admin'}:
                                </span> {req.reviewer.name}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedEvidence} onOpenChange={(open) => !open && setSelectedEvidence(null)}>
        <DialogContent className="max-w-md bg-transparent border-none p-0 shadow-none">
          <div className="relative rounded-2xl overflow-hidden bg-black/80 flex items-center justify-center p-2">
            {selectedEvidence && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedEvidence} alt="Bukti Lampiran" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
