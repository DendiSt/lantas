"use client";

import { useState, useEffect } from "react";
import { ActivityCalendar, type Activity, type BlockElement } from "react-activity-calendar";
import { getAttendanceHeatmapData } from "@/app/actions/reports";
import { CalendarDays, Loader2, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";

interface AttendanceHeatmapProps {
  studentId: string;
  studentName?: string;
  compact?: boolean;
}

const THEME = {
  light: ["#e2e8f0", "#fde68a", "#fdba74", "#f87171"],
  dark: ["#27272a", "#92400e", "#9a3412", "#991b1b"],
};

const LEGEND_ITEMS = [
  { color: "#e2e8f0", darkColor: "#27272a", label: "Hadir" },
  { color: "#fde68a", darkColor: "#92400e", label: "Izin" },
  { color: "#fdba74", darkColor: "#9a3412", label: "Sakit" },
  { color: "#f87171", darkColor: "#991b1b", label: "Alpha" },
];

export function AttendanceHeatmap({ studentId, studentName, compact = false }: AttendanceHeatmapProps) {
  const { resolvedTheme } = useTheme();
  const [data, setData] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ izin: 0, sakit: 0, alpha: 0 });

  // Generate Academic Years (Tahun Ajaran)
  const now = new Date();
  const currentYear = now.getFullYear();
  const startYear = now.getMonth() >= 6 ? currentYear : currentYear - 1;
  
  const PERIODS = [
    { 
      id: "current", 
      label: `Tahun Ajaran ${startYear}/${startYear + 1}`, 
      start: `${startYear}-07-01`,
      end: `${startYear + 1}-06-30`
    },
    { 
      id: "prev", 
      label: `Tahun Ajaran ${startYear - 1}/${startYear}`, 
      start: `${startYear - 1}-07-01`,
      end: `${startYear}-06-30`
    },
  ];
  
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0].id);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const period = PERIODS.find(p => p.id === selectedPeriod) || PERIODS[0];
        const raw = await getAttendanceHeatmapData(studentId, period.start, period.end);
        setData(raw as Activity[]);

        // Calculate stats
        const izin = raw.filter(d => d.level === 1).length;
        const sakit = raw.filter(d => d.level === 2).length;
        const alpha = raw.filter(d => d.level === 3).length;
        setStats({ izin, sakit, alpha });
      } catch (err) {
        console.error("Failed to load heatmap data:", err);
      }
      setLoading(false);
    }
    fetchData();
  }, [studentId, selectedPeriod]);

  return (
    <div className={`bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm ${compact ? "p-4" : "p-5 lg:p-6"}`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${compact ? "mb-3" : "mb-5"}`}>
        <div>
          <h3 className={`font-bold text-slate-900 dark:text-white flex items-center gap-2 ${compact ? "text-sm" : "text-base"}`}>
            <CalendarDays className={`text-indigo-500 ${compact ? "size-4" : "size-5"}`} />
            {studentName ? `Kalender Kehadiran — ${studentName}` : "Kalender Kehadiran"}
          </h3>
          {!compact && (
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Visualisasi kehadiran siswa per Tahun Ajaran
            </p>
          )}
        </div>

        {/* Filters and Stats in Header */}
        <div className="flex flex-col sm:items-end gap-2">
          {/* Period Selector */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              {PERIODS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <ChevronDown className="size-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          {/* Mini Stats */}
          {!loading && (stats.izin > 0 || stats.sakit > 0 || stats.alpha > 0) && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                <div className="size-2 rounded-full bg-amber-400" />
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{stats.izin} Izin</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50">
                <div className="size-2 rounded-full bg-orange-400" />
                <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400">{stats.sakit} Sakit</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
                <div className="size-2 rounded-full bg-red-400" />
                <span className="text-[10px] font-bold text-red-700 dark:text-red-400">{stats.alpha} Alpha</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 dark:text-zinc-500">
          <Loader2 className="size-5 animate-spin mr-2" />
          <span className="text-sm font-medium">Memuat kalender...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-slate-400 dark:text-zinc-500">
          <CalendarDays className="size-6 opacity-40 mr-2" />
          <span className="text-sm font-medium">Belum ada data kehadiran</span>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 w-full">
          <div className="w-max mx-auto min-w-full sm:min-w-0">
            <ActivityCalendar
              data={data}
              blockSize={compact ? 10 : 13}
              blockMargin={compact ? 3 : 4}
              blockRadius={3}
              fontSize={11}
              showColorLegend={false}
              showMonthLabels
              showTotalCount={false}
              maxLevel={3}
              colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
              theme={{
                light: THEME.light,
                dark: THEME.dark,
              }}
              labels={{
                months: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
                weekdays: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
                totalCount: "{{count}} kejadian di tahun ajaran ini",
              }}
              renderBlock={(block: BlockElement, activity: Activity) => {
                const levelLabels = ["Hadir", "Izin", "Sakit", "Alpha"];
                const dateStr = new Date(activity.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
                const title = `${dateStr} — ${levelLabels[activity.level]}`;

                return (
                  <g>
                    <title>{title}</title>
                    {block}
                  </g>
                );
              }}
            />
          </div>
        </div>
      )}

      {/* Custom Legend */}
      {!loading && data.length > 0 && (
        <div className={`flex items-center gap-4 ${compact ? "mt-3" : "mt-4"} pt-3 border-t border-slate-100 dark:border-zinc-800`}>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Keterangan:</span>
          <div className="flex items-center gap-3 flex-wrap">
            {LEGEND_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div
                  className="size-3 rounded-sm border border-slate-200 dark:border-zinc-700"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
