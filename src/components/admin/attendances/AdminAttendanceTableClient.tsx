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
  startTime: string;
  endTime: string;
  subjectIdWithTime: string | null;
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
  const subjectsToDisplay = availableSubjects;
  
  // What to render in the table
  const renderData = useMemo(() => {
    return groupedAttendances.map(data => {
      // Always show matrix
      const row: any = {
        "Nama Siswa": data.student.name,
      };
      
      availableSubjects.forEach(sub => {
        const record = data.records.find(r => r.subjectIdWithTime === sub.id);
        row[sub.name] = record?.status || "Belum Diisi";
      });

      row["Diinput Oleh"] = Array.from(new Set(data.records.map(r => r.teacherName))).filter(Boolean).join(", ") || "-";
      
      return row;
    });
  }, [groupedAttendances, availableSubjects]);

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "Belum Diisi") return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-500 whitespace-nowrap block w-fit mx-auto">Belum Diisi</span>;
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap block w-fit mx-auto ${
        status === "HADIR" ? "bg-emerald-100 text-emerald-700" :
        status === "ALPHA" ? "bg-rose-100 text-rose-700" :
        "bg-amber-100 text-amber-700"
      }`}>
        {status}
      </span>
    );
  };

  return (
    <>
      <div className="absolute top-0 right-0 -mt-16 mr-6 hidden md:block z-20">
         <ExportButtons 
            classNameName={className} 
            dateStr={dateStr}
            data={renderData}
            availableSubjects={availableSubjects}
          />
      </div>

      {subjectsToDisplay.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-zinc-300 mr-2">
              <Filter className="size-4" />
              <span>Mapel Hari Ini:</span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {subjectsToDisplay.map(sub => (
                <span
                  key={sub.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                >
                  {sub.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden print-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 font-semibold min-w-[200px] whitespace-nowrap">Nama Siswa</th>
                {subjectsToDisplay.map(sub => (
                  <th key={sub.id} className="px-6 py-3 font-semibold min-w-[200px] whitespace-nowrap text-center">{sub.name}</th>
                ))}
                <th className="px-6 py-3 font-semibold min-w-[200px] whitespace-nowrap">Diinput Oleh</th>
              </tr>
            </thead>
            <tbody>
              {renderData.length === 0 ? (
                <tr>
                  <td colSpan={subjectsToDisplay.length + 2} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data absensi yang disubmit oleh guru pada tanggal ini.
                  </td>
                </tr>
              ) : (
                renderData.map((att: any, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {att["Nama Siswa"]}
                    </td>
                    
                    {subjectsToDisplay.map(sub => (
                      <td key={sub.id} className="px-6 py-4 text-center">
                        <StatusBadge status={att[sub.name]} />
                      </td>
                    ))}

                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {att["Diinput Oleh"]}
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
