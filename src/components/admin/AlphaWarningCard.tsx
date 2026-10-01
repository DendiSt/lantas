"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, AlertCircle, Skull, Users, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAlphaWarnings } from "@/app/actions/reports";

interface WarningData {
  id: string;
  name: string;
  nisn: string;
  className: string;
  alphaCount: number;
}

export function AlphaWarningCard({ warnings: initialWarnings }: { warnings: WarningData[] }) {
  const [showAll, setShowAll] = useState(false);
  const [period, setPeriod] = useState("semester-ini");
  const [warnings, setWarnings] = useState<WarningData[]>(initialWarnings);
  const [loading, setLoading] = useState(false);

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
        const now = new Date();
        const year = now.getFullYear();
        let startStr = "";
        let endStr = "";

        if (period === "semester-ini") {
          const isGanjil = now.getMonth() >= 6;
          startStr = isGanjil ? `${year}-07-01` : `${year}-01-01`;
          endStr = isGanjil ? `${year}-12-31` : `${year}-06-30`;
        } else if (period === "semester-lalu") {
          const isGanjil = now.getMonth() >= 6; // currently ganjil means lalu is genap
          startStr = isGanjil ? `${year}-01-01` : `${year - 1}-07-01`;
          endStr = isGanjil ? `${year}-06-30` : `${year - 1}-12-31`;
        }

        const data = await getAlphaWarnings(startStr, endStr);
        setWarnings(data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
    fetchData();
  }, [period]);

  if (warnings.length === 0 && period === "semester-ini") return null;

  const topWarnings = warnings.slice(0, 5);

  const WarningRow = ({ w }: { w: WarningData }) => {
    let statusColor = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
    let icon = <div className="size-2 rounded-full bg-emerald-500 mr-2" />;
    let actionText = "Aman";

    if (w.alphaCount === 3) {
      statusColor = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
      icon = <AlertCircle className="size-4 mr-1.5" />;
      actionText = "Perlu Perhatian";
    } else if (w.alphaCount === 4) {
      statusColor = "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/50";
      icon = <AlertCircle className="size-4 mr-1.5" />;
      actionText = "Peringatan Terakhir";
    } else if (w.alphaCount >= 5) {
      statusColor = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50 animate-pulse";
      icon = <Skull className="size-4 mr-1.5" />;
      actionText = "Panggil ke BK";
    }

    return (
      <tr key={w.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors">
        <td className="px-2 sm:px-5 lg:px-6 py-2 sm:py-4 max-w-[100px] sm:max-w-none">
          <div className="font-bold text-slate-900 dark:text-white text-[11px] sm:text-sm truncate">{w.name}</div>
          <div className="text-[9px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">NISN: {w.nisn}</div>
        </td>
        <td className="px-2 sm:px-5 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
          <span className="inline-flex px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
            {w.className.replace('Kelas ', 'Kls ')}
          </span>
        </td>
        <td className="px-2 sm:px-5 lg:px-6 py-2 sm:py-4 text-center font-black text-sm sm:text-lg text-slate-900 dark:text-white">
          {w.alphaCount}
        </td>
        <td className="px-2 sm:px-5 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold border ${statusColor}`}>
            {icon} <span className="hidden sm:inline">{actionText}</span><span className="sm:hidden">{actionText === 'Panggil ke BK' ? 'BK' : actionText === 'Peringatan Terakhir' ? 'Awas' : actionText}</span>
          </span>
        </td>
      </tr>
    );
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 dark:border-zinc-800 p-5 lg:p-6 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              Peringatan Alpha Siswa
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Siswa dengan jumlah Alpha (Tanpa Keterangan) ≥ 1 hari. Diurutkan dari yang terbanyak.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 outline-none w-full sm:w-auto"
            >
              <option value="semester-ini">{semesterIniLabel}</option>
              <option value="semester-lalu">{semesterLaluLabel}</option>
              <option value="semua">Semua Waktu</option>
            </select>
            {warnings.length > 5 && (
              <button
                onClick={() => setShowAll(true)}
                className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors w-full sm:w-auto"
              >
                <Users className="size-4" />
                Semua ({warnings.length})
              </button>
            )}
          </div>
        </div>
        
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 text-[9px] sm:text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-2 sm:px-5 lg:px-6 py-2 sm:py-4">Siswa</th>
                  <th className="px-2 sm:px-5 lg:px-6 py-2 sm:py-4">Kelas</th>
                  <th className="px-2 sm:px-5 lg:px-6 py-2 sm:py-4 text-center">Alpha</th>
                  <th className="px-2 sm:px-5 lg:px-6 py-2 sm:py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                      <Loader2 className="size-5 animate-spin mx-auto mb-2 text-indigo-500" />
                      Memuat data...
                    </td>
                  </tr>
                ) : warnings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500 text-xs font-semibold">
                      Tidak ada data alpha pada rentang waktu ini.
                    </td>
                  </tr>
                ) : (
                  topWarnings.map((w) => <WarningRow key={w.id} w={w} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-4xl lg:max-w-5xl p-0 overflow-hidden bg-slate-50 dark:bg-zinc-950 border-0 rounded-[2rem]">
          <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                <AlertTriangle className="size-5 sm:size-6 text-amber-500" />
                Seluruh Peringatan Alpha
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="max-h-[70vh] overflow-y-auto w-full">
            <div className="w-full min-w-full inline-block align-middle">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 text-[9px] sm:text-xs font-semibold uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="px-2 sm:px-5 lg:px-6 py-2 sm:py-4">Siswa</th>
                    <th className="px-2 sm:px-5 lg:px-6 py-2 sm:py-4">Kelas</th>
                    <th className="px-2 sm:px-5 lg:px-6 py-2 sm:py-4 text-center">Alpha</th>
                    <th className="px-2 sm:px-5 lg:px-6 py-2 sm:py-4">Status</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                {warnings.map((w) => <WarningRow key={w.id} w={w} />)}
              </tbody>
            </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
