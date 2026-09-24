"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, Clock, XCircle, FileText, Filter } from "lucide-react";
import { ExportButtons } from "./ExportButtons";

type AttendanceStatus = "HADIR" | "SAKIT" | "IZIN" | "ALPHA";

interface Student {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface AttendanceRecord {
  id: string;
  status: AttendanceStatus;
  period: number;
  subject: Subject | null;
  teacherName: string;
}

interface StudentAttendanceMap {
  student: Student;
  records: AttendanceRecord[];
}

interface AdminAttendanceTableClientProps {
  className: string;
  dateStr: string;
  groupedAttendances: StudentAttendanceMap[];
  availableSubjects: Subject[];
}

export function AdminAttendanceTableClient({ className, dateStr, groupedAttendances, availableSubjects }: AdminAttendanceTableClientProps) {
  const [activeFilter, setActiveFilter] = useState<string | "ALL">("ALL");

  // Determine if all subjects have identical attendance
  const hasMixedAttendance = useMemo(() => {
    for (const data of groupedAttendances) {
      if (data.records.length > 0) {
        const firstStatus = data.records[0].status;
        const isMixed = data.records.some(r => r.status !== firstStatus);
        if (isMixed) return true;
      }
    }
    return false;
  }, [groupedAttendances]);

  // Handle auto-filtering if mixed
  const subjectsToDisplay = availableSubjects;
  
  // What to render in the table
  const renderData = useMemo(() => {
    return groupedAttendances.map(data => {
      // If we are filtering by a specific subject
      if (activeFilter !== "ALL") {
        const record = data.records.find(r => r.subject?.id === activeFilter);
        return {
          studentName: data.student.name,
          status: record?.status || "Belum Diisi",
          teacherName: record?.teacherName || "-"
        };
      }
      
      // If not filtering, and it's NOT mixed, just show the first record's status
      // (because we already established all records for a student are the same)
      const firstRecord = data.records[0];
      return {
        studentName: data.student.name,
        status: firstRecord?.status || "Belum Diisi",
        teacherName: firstRecord?.teacherName || "-" // Could be multiple, but we simplify
      };
    });
  }, [groupedAttendances, activeFilter]);

  const exportData = renderData.map(r => ({
    studentName: r.studentName,
    status: r.status as AttendanceStatus,
    teacherName: r.teacherName
  }));

  return (
    <>
      <div className="absolute top-0 right-0 -mt-16 mr-6 hidden md:block">
         <ExportButtons 
            classNameName={className} 
            dateStr={dateStr}
            attendances={exportData}
          />
      </div>

      {subjectsToDisplay.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-zinc-300 mr-2">
              <Filter className="size-4" />
              <span>Mapel Hari Ini:</span>
            </div>
            
            {!hasMixedAttendance ? (
              // ACT AS LABELS
              <div className="flex items-center gap-2">
                {subjectsToDisplay.map(sub => (
                  <span key={sub.id} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs font-semibold border border-slate-200 dark:border-zinc-700">
                    {sub.name}
                  </span>
                ))}
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold ml-2 flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> Absen Seragam (Seluruh Mapel Sama)
                </span>
              </div>
            ) : (
              // ACT AS FILTERS
              <div className="flex items-center gap-2 flex-wrap">
                <button
                   onClick={() => setActiveFilter("ALL")}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                     activeFilter === "ALL" 
                     ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent" 
                     : "bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-100"
                   }`}
                >
                  Semua Mapel (Tampilan Awal)
                </button>
                {subjectsToDisplay.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveFilter(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      activeFilter === sub.id 
                      ? "bg-indigo-600 text-white border-indigo-600" 
                      : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold ml-2 flex items-center gap-1">
                  <Clock className="size-3.5" /> Terdapat Perbedaan Absen (Pilih Filter)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden print-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 font-semibold">Nama Siswa</th>
                <th className="px-6 py-3 font-semibold">Status {activeFilter !== "ALL" ? `(${subjectsToDisplay.find(s => s.id === activeFilter)?.name})` : ''}</th>
                <th className="px-6 py-3 font-semibold">Diinput Oleh</th>
              </tr>
            </thead>
            <tbody>
              {renderData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data absensi yang disubmit oleh guru pada tanggal ini.
                  </td>
                </tr>
              ) : (
                renderData.map((att, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {att.studentName}
                    </td>
                    <td className="px-6 py-4">
                      {att.status === "Belum Diisi" ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-500">Belum Diisi</span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          att.status === "HADIR" ? "bg-emerald-100 text-emerald-700" :
                          att.status === "ALPHA" ? "bg-rose-100 text-rose-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {att.status}
                        </span>
                      )}
                      
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {att.teacherName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
