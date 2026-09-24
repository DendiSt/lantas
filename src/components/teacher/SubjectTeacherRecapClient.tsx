"use client";

import { useState, useMemo } from "react";
import { Filter, Users, Calendar, CheckCircle2 } from "lucide-react";
import { ExportButtons } from "@/components/admin/attendances/ExportButtons";

interface Student {
  id: string;
  name: string;
  className: string;
}

interface AttendanceRecord {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  student: Student;
  subjectName: string;
  subjectId: string;
}

interface SubjectTeacherRecapClientProps {
  teacherName: string;
  dateStr: string;
  attendances: AttendanceRecord[];
}

export function SubjectTeacherRecapClient({ teacherName, dateStr, attendances }: SubjectTeacherRecapClientProps) {
  // Extract unique subjects taught today
  const subjectsMap = new Map<string, string>();
  attendances.forEach(a => {
    subjectsMap.set(a.subjectId, a.subjectName);
  });
  const subjects = Array.from(subjectsMap.entries()).map(([id, name]) => ({ id, name }));

  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(subjects.length > 0 ? subjects[0].id : null);
  const [activeClassName, setActiveClassName] = useState<string | null>(null);

  // When subject changes, recalculate available classes and auto-select the first one
  const availableClassesForSubject = useMemo(() => {
    if (!activeSubjectId) return [];
    const classes = new Set<string>();
    attendances.filter(a => a.subjectId === activeSubjectId).forEach(a => {
      classes.add(a.student.className);
    });
    const classArr = Array.from(classes).sort();
    
    // Auto-select first class if current is not in the new list
    if (classArr.length > 0 && (!activeClassName || !classArr.includes(activeClassName))) {
      setActiveClassName(classArr[0]);
    }
    
    return classArr;
  }, [activeSubjectId, attendances, activeClassName]);

  // The final records to render
  const renderRecords = useMemo(() => {
    if (!activeSubjectId || !activeClassName) return [];
    return attendances.filter(a => a.subjectId === activeSubjectId && a.student.className === activeClassName)
      .sort((a, b) => a.student.name.localeCompare(b.student.name));
  }, [activeSubjectId, activeClassName, attendances]);

  // Data for export (we map it to the structure ExportButtons expects)
  // For subject teacher, the columns are: No, Nama Siswa, [Subject Name] (status), Diinput Oleh
  const exportData = useMemo(() => {
    const subjectName = subjects.find(s => s.id === activeSubjectId)?.name || "Mapel";
    return renderRecords.map(r => ({
      "Nama Siswa": r.student.name,
      [subjectName]: r.status,
      "Diinput Oleh": teacherName
    }));
  }, [renderRecords, activeSubjectId, subjects, teacherName]);

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

  if (subjects.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs p-10 flex flex-col items-center justify-center text-slate-500 text-center mt-6">
        <Calendar className="size-12 text-slate-300 dark:text-zinc-700 mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Belum Ada Jurnal Tersimpan</h2>
        <p className="text-sm">Anda belum menyimpan data absensi/jurnal kelas apapun pada tanggal ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="absolute top-0 right-0 -mt-16 mr-6 hidden md:block z-20">
         <ExportButtons 
            classNameName={`Kelas_${activeClassName}`} 
            dateStr={dateStr}
            data={exportData}
            availableSubjects={subjects.filter(s => s.id === activeSubjectId)}
          />
      </div>

      {/* Select Subject */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-zinc-300 min-w-[150px]">
            <Filter className="size-4" />
            <span>Pilih Mata Pelajaran:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {subjects.map(sub => (
              <button
                key={sub.id}
                onClick={() => setActiveSubjectId(sub.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  activeSubjectId === sub.id 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                  : "bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Select Class (if subject selected) */}
      {availableClassesForSubject.length > 0 && (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-800 dark:text-indigo-300 min-w-[150px]">
              <Users className="size-4" />
              <span>Pilih Kelas:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableClassesForSubject.map(cls => (
                <button
                  key={cls}
                  onClick={() => setActiveClassName(cls)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeClassName === cls 
                    ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-zinc-950" 
                    : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700"
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {activeSubjectId && activeClassName && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden print-table-container">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/30 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-zinc-200">
              <CheckCircle2 className="size-4 text-emerald-500" />
              Rekap Absensi: {subjects.find(s => s.id === activeSubjectId)?.name} - Kelas {activeClassName}
            </h3>
            <span className="text-xs font-semibold text-slate-500 bg-white dark:bg-zinc-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-700">
              {renderRecords.length} Siswa
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3 font-semibold min-w-[200px] whitespace-nowrap">Nama Siswa</th>
                  <th className="px-6 py-3 font-semibold min-w-[200px] whitespace-nowrap text-center">Waktu</th>
                  <th className="px-6 py-3 font-semibold min-w-[200px] whitespace-nowrap text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {renderRecords.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      Belum ada data absensi untuk kelas ini.
                    </td>
                  </tr>
                ) : (
                  renderRecords.map((att) => (
                    <tr key={att.id} className="border-b border-slate-50 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {att.student.name}
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-slate-500 font-semibold">
                        {att.startTime} - {att.endTime}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={att.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
