"use client";

import { CheckCircle2, XCircle, Clock, Award, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface AttendanceSummaryStats {
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  total: number;
  attendanceRate: number; // 0 - 100
  latestTodaySession?: {
    subjectName: string;
    status: "HADIR" | "SAKIT" | "IZIN" | "ALPHA";
    time: string;
  } | null;
}

interface StudentAttendanceSummaryProps {
  stats: AttendanceSummaryStats;
}

export function StudentAttendanceSummary({ stats }: StudentAttendanceSummaryProps) {
  const { hadir, sakit, izin, alpha, total, attendanceRate, latestTodaySession } = stats;

  // Rate Tier calculation
  const getRateBadge = (rate: number) => {
    if (rate >= 90) {
      return {
        label: "Kehadiran Prima",
        desc: "Sangat disiplin mengikuti pembelajaran",
        colorClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        barColor: "bg-emerald-500",
      };
    }

    if (rate >= 80) {
      return {
        label: "Kehadiran Baik",
        desc: "Memenuhi standar kedisiplinan sekolah",
        colorClass: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800",
        barColor: "bg-sky-500",
      };
    }

    if (rate >= 75) {
      return {
        label: "Cukup (Batas Minimum)",
        desc: "Mendekati ambang batas presensi 75%",
        colorClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        barColor: "bg-amber-500",
      };
    }

    return {
      label: "Perlu Perhatian (<75%)",
      desc: "Kehadiran di bawah batas kelulusan semester",
      colorClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      barColor: "bg-rose-500",
    };
  };

  const rateInfo = getRateBadge(attendanceRate);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Header Card */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300">
            <Award className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Rekap Kehadiran Akademik
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Akumulasi presensi dari guru mata pelajaran
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${rateInfo.colorClass}`}
        >
          {rateInfo.label}
        </Badge>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Primary Highlight: Percentage & Progress Bar */}
        <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {attendanceRate}%
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                Tingkat Kehadiran
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300">
              {rateInfo.desc}
            </p>
          </div>

          <div className="sm:w-56 w-full space-y-1.5">
            <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              <span>{hadir} dari {total} pertemuan</span>
              <span className="font-semibold text-slate-700 dark:text-zinc-200">{attendanceRate}%</span>
            </div>
            {/* Visual multi-segment or single rate bar */}
            <div className="h-2.5 w-full bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden flex">
              {total > 0 ? (
                <>
                  <div
                    style={{ width: `${(hadir / total) * 100}%` }}
                    className="bg-emerald-500 transition-all duration-500"
                    title={`Hadir: ${hadir}`}
                  />
                  <div
                    style={{ width: `${(sakit / total) * 100}%` }}
                    className="bg-amber-400 transition-all duration-500"
                    title={`Sakit: ${sakit}`}
                  />
                  <div
                    style={{ width: `${(izin / total) * 100}%` }}
                    className="bg-sky-400 transition-all duration-500"
                    title={`Izin: ${izin}`}
                  />
                  <div
                    style={{ width: `${(alpha / total) * 100}%` }}
                    className="bg-rose-500 transition-all duration-500"
                    title={`Alpha: ${alpha}`}
                  />
                </>
              ) : (
                <div className="w-full bg-slate-300 dark:bg-zinc-600" />
              )}
            </div>
          </div>
        </div>

        {/* 4 Attendance Status Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Hadir */}
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Hadir</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">{hadir}</p>
            </div>
            <div className="size-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>

          {/* Sakit */}
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Sakit</p>
              <p className="text-lg sm:text-xl font-bold text-amber-700 dark:text-amber-300 mt-0.5">{sakit}</p>
            </div>
            <div className="size-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>

          {/* Izin */}
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Izin</p>
              <p className="text-lg sm:text-xl font-bold text-sky-700 dark:text-sky-300 mt-0.5">{izin}</p>
            </div>
            <div className="size-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <BookOpen className="size-4" />
            </div>
          </div>

          {/* Alpha */}
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Alpha</p>
              <p className="text-lg sm:text-xl font-bold text-rose-700 dark:text-rose-300 mt-0.5">{alpha}</p>
            </div>
            <div className="size-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="size-4" />
            </div>
          </div>
        </div>

        {/* Latest Session Today Indicator */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300 flex items-center gap-2.5">
          <Clock className="size-4 text-slate-500 dark:text-zinc-400 shrink-0" />
          {latestTodaySession ? (
            <p>
              Presensi terakhir hari ini: <span className="font-semibold text-slate-900 dark:text-white">{latestTodaySession.subjectName}</span> ({latestTodaySession.time}) — Status: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{latestTodaySession.status}</span>
            </p>
          ) : (
            <p className="text-slate-500 dark:text-zinc-400">
              Belum ada pencatatan presensi hari ini oleh guru kelas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

