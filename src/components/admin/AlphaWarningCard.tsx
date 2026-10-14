"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Skull,
  Loader2,
  Search,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import { getAlphaWarnings } from "@/app/actions/reports";
import { UserAvatar } from "@/components/shared/UserAvatar";

interface WarningData {
  id: string;
  name: string;
  avatarUrl?: string | null;
  nisn: string;
  className: string;
  alphaCount: number;
}

export function AlphaWarningCard({
  warnings: initialWarnings,
}: {
  warnings: WarningData[];
}) {
  const [period, setPeriod] = useState("semester-ini");
  const [warnings, setWarnings] = useState<WarningData[]>(initialWarnings);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<
    "all" | "attention" | "warning" | "critical"
  >("all");

  const now = new Date();
  const currentYear = now.getFullYear();
  const isCurrentGanjil = now.getMonth() >= 6; // >= 6 means July to December

  const semesterIniLabel = isCurrentGanjil
    ? `Semester Ini (Juli-Desember ${currentYear})`
    : `Semester Ini (Januari-Juni ${currentYear})`;

  const semesterLaluLabel = isCurrentGanjil
    ? `Semester Lalu (Januari-Juni ${currentYear})`
    : `Semester Lalu (Juli-Desember ${currentYear - 1})`;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        let startStr = "";
        let endStr = "";

        if (period === "semester-ini") {
          const isGanjil = currentDate.getMonth() >= 6;
          startStr = isGanjil ? `${year}-07-01` : `${year}-01-01`;
          endStr = isGanjil ? `${year}-12-31` : `${year}-06-30`;
        } else if (period === "semester-lalu") {
          const isGanjil = currentDate.getMonth() >= 6;
          startStr = isGanjil ? `${year}-01-01` : `${year - 1}-07-01`;
          endStr = isGanjil ? `${year}-06-30` : `${year - 1}-12-31`;
        }

        const data = await getAlphaWarnings(startStr, endStr);
        setWarnings(data);
      } catch (error) {
        console.error("Error fetching alpha warnings:", error);
      }
      setLoading(false);
    }
    fetchData();
  }, [period]);

  // Aggregate stats
  const attentionCount = useMemo(
    () => warnings.filter((w) => w.alphaCount === 3).length,
    [warnings]
  );
  const warningCount = useMemo(
    () => warnings.filter((w) => w.alphaCount === 4).length,
    [warnings]
  );
  const criticalCount = useMemo(
    () => warnings.filter((w) => w.alphaCount >= 5).length,
    [warnings]
  );

  // Filtered warnings by search query and severity filter
  const filteredWarnings = useMemo(() => {
    return warnings.filter((w) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.className.toLowerCase().includes(q) ||
        (w.nisn && w.nisn.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (severityFilter === "attention") return w.alphaCount === 3;
      if (severityFilter === "warning") return w.alphaCount === 4;
      if (severityFilter === "critical") return w.alphaCount >= 5;
      return true;
    });
  }, [warnings, searchQuery, severityFilter]);

  // Determine dynamic border accent
  const borderAccentClass =
    criticalCount > 0
      ? "border-l-4 border-l-rose-500"
      : warningCount > 0 || attentionCount > 0
      ? "border-l-4 border-l-amber-500"
      : "border-l-4 border-l-emerald-500";

  const WarningRow = ({ w }: { w: WarningData }) => {
    let statusColor =
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
    let icon = <div className="size-2 rounded-full bg-emerald-500 mr-2" />;
    let actionText = "Aman";

    if (w.alphaCount === 3) {
      statusColor =
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
      icon = <AlertCircle className="size-4 mr-1.5" />;
      actionText = "Perlu Perhatian";
    } else if (w.alphaCount === 4) {
      statusColor =
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/50";
      icon = <AlertCircle className="size-4 mr-1.5" />;
      actionText = "Peringatan Terakhir";
    } else if (w.alphaCount >= 5) {
      statusColor =
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50 animate-pulse";
      icon = <Skull className="size-4 mr-1.5" />;
      actionText = "Panggil ke BK";
    }

    return (
      <tr
        key={w.id}
        className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors"
      >
        <td className="px-2 sm:px-5 lg:px-6 py-2.5 sm:py-4 max-w-[140px] sm:max-w-none">
          <div className="flex items-center gap-3">
            <UserAvatar name={w.name} avatarUrl={w.avatarUrl} size="sm" />
            <div className="min-w-0">
              <div className="font-bold text-slate-900 dark:text-white text-[11px] sm:text-sm truncate">
                {w.name}
              </div>
              <div className="text-[9px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                NISN: {w.nisn || "-"}
              </div>
            </div>
          </div>
        </td>
        <td className="px-2 sm:px-5 lg:px-6 py-2.5 sm:py-4 whitespace-nowrap">
          <span className="inline-flex px-2 py-1 rounded-lg text-[9px] sm:text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700">
            {w.className.replace("Kelas ", "Kls ")}
          </span>
        </td>
        <td className="px-2 sm:px-5 lg:px-6 py-2.5 sm:py-4 text-center">
          <div className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-none">
            {w.alphaCount}
          </div>
          <div className="flex items-center justify-center gap-1 mt-1.5">
            {[1, 2, 3, 4, 5].map((level) => {
              let dotColor = "bg-slate-200 dark:bg-zinc-800";
              if (level <= w.alphaCount) {
                if (w.alphaCount >= 5) dotColor = "bg-rose-500 shadow-xs shadow-rose-500/50";
                else if (w.alphaCount === 4) dotColor = "bg-orange-500";
                else if (w.alphaCount === 3) dotColor = "bg-amber-500";
                else dotColor = "bg-emerald-500";
              }
              return (
                <span
                  key={level}
                  className={`size-1.5 rounded-full ${dotColor} transition-colors`}
                />
              );
            })}
          </div>
        </td>
        <td className="px-2 sm:px-5 lg:px-6 py-2.5 sm:py-4 whitespace-nowrap">
          <span
            className={`inline-flex items-center px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold border ${statusColor}`}
          >
            {icon}
            <span className="hidden sm:inline">{actionText}</span>
            <span className="sm:hidden">
              {actionText === "Panggil ke BK"
                ? "BK"
                : actionText === "Peringatan Terakhir"
                ? "Awas"
                : actionText}
            </span>
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 ${borderAccentClass} shadow-xs overflow-hidden transition-all`}
    >
      {/* CARD HEADER */}
      <div className="border-b border-slate-200 dark:border-zinc-800 p-5 lg:p-6 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Peringatan Alpha Siswa
              </h2>
              {criticalCount > 0 && (
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex size-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Monitoring siswa dengan akumulasi Alpha (Tanpa Keterangan) ≥ 1 hari.
            </p>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <div className="relative min-w-[200px]">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Cari nama atau kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-slate-400/20 dark:focus:ring-zinc-600/30 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full sm:w-auto appearance-none pl-8 pr-8 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-slate-400/20 dark:focus:ring-zinc-600/30 cursor-pointer"
            >
              <option value="semester-ini">{semesterIniLabel}</option>
              <option value="semester-lalu">{semesterLaluLabel}</option>
              <option value="semua">Semua Waktu</option>
            </select>
            <CalendarDays className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* MINI STAT CHIPS / SUMMARY BAR */}
      {warnings.length > 0 && (
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-zinc-900/30 border-b border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSeverityFilter("all")}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all border ${
              severityFilter === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-xs"
                : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/50"
            }`}
          >
            Semua ({warnings.length})
          </button>
          <button
            type="button"
            onClick={() =>
              setSeverityFilter(severityFilter === "attention" ? "all" : "attention")
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all border ${
              severityFilter === "attention"
                ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/50 hover:bg-amber-100/70"
            }`}
          >
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span>Perlu Perhatian (3x):</span>
            <span className="font-black">{attentionCount}</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setSeverityFilter(severityFilter === "warning" ? "all" : "warning")
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all border ${
              severityFilter === "warning"
                ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                : "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200/80 dark:border-orange-900/50 hover:bg-orange-100/70"
            }`}
          >
            <span className="size-1.5 rounded-full bg-orange-500" />
            <span>Peringatan (4x):</span>
            <span className="font-black">{warningCount}</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setSeverityFilter(severityFilter === "critical" ? "all" : "critical")
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all border ${
              severityFilter === "critical"
                ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-900/50 hover:bg-rose-100/70"
            }`}
          >
            <span className="size-1.5 rounded-full bg-rose-500" />
            <span>Panggil BK (≥5x):</span>
            <span className="font-black">{criticalCount}</span>
          </button>
        </div>
      )}

      {/* CONTENT: TABLE OR EMPTY STATE */}
      <div className="p-0">
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center text-center text-slate-500 dark:text-zinc-400">
            <Loader2 className="size-6 animate-spin text-slate-900 dark:text-white mb-2" />
            <p className="text-xs font-semibold">Memuat data peringatan...</p>
          </div>
        ) : warnings.length === 0 ? (
          /* EMPTY STATE APRESIATIF */
          <div className="p-8 sm:p-10 flex flex-col items-center justify-center text-center">
            <div className="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-xs">
              <ShieldCheck className="size-7" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Kedisiplinan Kehadiran Sangat Baik!
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mt-1 leading-relaxed">
              Tidak ada siswa yang tercatat Alpha (Tanpa Keterangan) pada rentang waktu{" "}
              {period === "semester-ini" ? "semester ini" : "yang dipilih"}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[340px] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-700 rounded-b-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 text-[9px] sm:text-xs font-semibold uppercase tracking-wider sticky top-0 z-10 shadow-[0_1px_0_0_#e2e8f0] dark:shadow-[0_1px_0_0_#27272a]">
                <tr>
                  <th className="px-2 sm:px-5 lg:px-6 py-2.5 sm:py-3.5">Siswa</th>
                  <th className="px-2 sm:px-5 lg:px-6 py-2.5 sm:py-3.5">Kelas</th>
                  <th className="px-2 sm:px-5 lg:px-6 py-2.5 sm:py-3.5 text-center">
                    Alpha
                  </th>
                  <th className="px-2 sm:px-5 lg:px-6 py-2.5 sm:py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredWarnings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-slate-500 dark:text-zinc-400 text-xs font-semibold"
                    >
                      Tidak ada data siswa yang cocok dengan filter atau kata kunci &ldquo;
                      {searchQuery}&rdquo;.
                    </td>
                  </tr>
                ) : (
                  filteredWarnings.map((w) => <WarningRow key={w.id} w={w} />)
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
