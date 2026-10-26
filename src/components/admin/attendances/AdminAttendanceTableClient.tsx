"use client";

import { useMemo } from "react";
import { CheckCircle2, Clock, XCircle, Users, Filter, TrendingUp } from "lucide-react";

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
  className?: string;
  classId?: string;
  dateStr?: string;
  groupedAttendances: StudentAttendanceMap[];
  availableSubjects: Subject[];
}

export function AdminAttendanceTableClient({ groupedAttendances, availableSubjects }: AdminAttendanceTableClientProps) {
  const subjectsToDisplay = availableSubjects;
  
  // Hitung KPI agregat kelas
  const summaryStats = useMemo(() => {
    let totalHadir = 0;
    let totalSakit = 0;
    let totalIzin = 0;
    let totalAlpha = 0;

    groupedAttendances.forEach(item => {
      item.records.forEach(rec => {
        if (rec.status === "HADIR") totalHadir++;
        else if (rec.status === "SAKIT") totalSakit++;
        else if (rec.status === "IZIN") totalIzin++;
        else if (rec.status === "ALPHA") totalAlpha++;
      });
    });

    const totalRecorded = totalHadir + totalSakit + totalIzin + totalAlpha;
    const attendanceRate = totalRecorded > 0 ? ((totalHadir / totalRecorded) * 100).toFixed(1) : "0.0";

    return {
      totalStudents: groupedAttendances.length,
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpha,
      attendanceRate: parseFloat(attendanceRate),
      totalRecorded
    };
  }, [groupedAttendances]);

  // Data per baris siswa
  const renderData = useMemo(() => {
    return groupedAttendances.map(data => {
      const row: Record<string, string | number | null> = {
        "Nama Siswa": data.student.name,
      };
      
      let studentH = 0;
      let studentRecorded = 0;

      availableSubjects.forEach(sub => {
        const record = data.records.find(r => r.subjectIdWithTime === sub.id);
        const st = record?.status || "Belum Diisi";
        row[sub.name] = st;

        if (st === "HADIR") {
          studentH++;
          studentRecorded++;
        } else if (st === "SAKIT" || st === "IZIN" || st === "ALPHA") {
          studentRecorded++;
        }
      });

      row["_pct"] = studentRecorded > 0 ? Math.round((studentH / studentRecorded) * 100) : null;
      row["Diinput Oleh"] = Array.from(new Set(data.records.map(r => r.teacherName))).filter(Boolean).join(", ") || "-";
      
      return row;
    });
  }, [groupedAttendances, availableSubjects]);

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "Belum Diisi") {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 whitespace-nowrap block w-fit mx-auto">
          Belum Diisi
        </span>
      );
    }

    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap block w-fit mx-auto ${
        status === "HADIR" ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50" :
        status === "ALPHA" ? "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50" :
        "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
      }`}>
        {status}
      </span>
    );
  };

  return (
    <>
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Tingkat Kehadiran Kelas */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Tingkat Kehadiran</span>
            <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {summaryStats.totalRecorded > 0 ? `${summaryStats.attendanceRate}%` : "—"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {summaryStats.totalRecorded > 0 ? `Dari ${summaryStats.totalRecorded} total sesi absensi` : "Belum ada sesi diinput"}
          </p>
        </div>

        {/* Card 2: Total Siswa Hadir */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Hadir</span>
            <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {summaryStats.totalHadir}
            </span>
            <span className="text-xs font-semibold text-slate-400">kali hadir</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Total presensi sesi hadir
          </p>
        </div>

        {/* Card 3: Sakit & Izin */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Izin & Sakit</span>
            <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {summaryStats.totalSakit + summaryStats.totalIzin}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              ({summaryStats.totalSakit} S, {summaryStats.totalIzin} I)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Berhalangan sah
          </p>
        </div>

        {/* Card 4: Alpha (Tanpa Keterangan) */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Tanpa Keterangan</span>
            <div className="size-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <XCircle className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black tracking-tight ${summaryStats.totalAlpha > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
              {summaryStats.totalAlpha}
            </span>
            <span className="text-xs font-semibold text-slate-400">Alpha</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {summaryStats.totalAlpha > 0 ? "Perlu perhatian wali kelas" : "Nihil tanpa keterangan"}
          </p>
        </div>
      </div>

      {subjectsToDisplay.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs mb-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-zinc-300">
              <Filter className="size-4 text-slate-500" />
              <span>Mapel Terdaftar:</span>
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

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 ml-auto">
              <Users className="size-4" />
              <span>Total Siswa: {summaryStats.totalStudents}</span>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden print-table-container">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 font-semibold min-w-[200px] whitespace-nowrap">Nama Siswa</th>
                {subjectsToDisplay.map(sub => (
                  <th key={sub.id} className="px-6 py-3 font-semibold min-w-[160px] whitespace-nowrap text-center">{sub.name}</th>
                ))}
                <th className="px-6 py-3 font-semibold min-w-[120px] whitespace-nowrap text-center">% Kehadiran</th>
                <th className="px-6 py-3 font-semibold min-w-[180px] whitespace-nowrap">Diinput Oleh</th>
              </tr>
            </thead>
            <tbody>
              {renderData.length === 0 ? (
                <tr>
                  <td colSpan={subjectsToDisplay.length + 3} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data absensi yang disubmit oleh guru pada tanggal ini.
                  </td>
                </tr>
              ) : (
                renderData.map((att: any, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {att["Nama Siswa"]}
                    </td>
                    
                    {subjectsToDisplay.map(sub => (
                      <td key={sub.id} className="px-6 py-4 text-center">
                        <StatusBadge status={att[sub.name]} />
                      </td>
                    ))}

                    <td className="px-6 py-4 text-center">
                      {att["_pct"] !== null ? (
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-block ${
                          att["_pct"] >= 85 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" :
                          att["_pct"] >= 75 ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400" :
                          "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
                        }`}>
                          {att["_pct"]}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

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
