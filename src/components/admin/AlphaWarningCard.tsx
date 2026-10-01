"use client";

import { useState } from "react";
import { AlertTriangle, AlertCircle, Skull, Users, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WarningData {
  id: string;
  name: string;
  nisn: string;
  className: string;
  alphaCount: number;
}

export function AlphaWarningCard({ warnings }: { warnings: WarningData[] }) {
  const [showAll, setShowAll] = useState(false);

  if (warnings.length === 0) return null;

  const topWarnings = warnings.slice(0, 5);

  const WarningRow = ({ w }: { w: WarningData }) => {
    let statusColor = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
    let icon = <AlertCircle className="size-4 mr-1.5" />;
    let actionText = "Perlu Perhatian";

    if (w.alphaCount === 4) {
      statusColor = "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/50";
      actionText = "Peringatan Terakhir";
    } else if (w.alphaCount >= 5) {
      statusColor = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50 animate-pulse";
      icon = <Skull className="size-4 mr-1.5" />;
      actionText = "Panggil ke BK";
    }

    return (
      <tr key={w.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors">
        <td className="px-5 lg:px-6 py-4">
          <div className="font-bold text-slate-900 dark:text-white">{w.name}</div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">NISN: {w.nisn}</div>
        </td>
        <td className="px-5 lg:px-6 py-4">
          <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
            {w.className}
          </span>
        </td>
        <td className="px-5 lg:px-6 py-4 text-center font-black text-lg text-slate-900 dark:text-white">
          {w.alphaCount}
        </td>
        <td className="px-5 lg:px-6 py-4">
          <span className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold border ${statusColor}`}>
            {icon} {actionText}
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
              Peringatan Alpha Siswa (Semester Ini)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Siswa dengan jumlah Alpha (Tanpa Keterangan) ≥ 3 hari. Diurutkan dari yang terbanyak.
            </p>
          </div>
          {warnings.length > 5 && (
            <button
              onClick={() => setShowAll(true)}
              className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <Users className="size-4" />
              Lihat Semua ({warnings.length})
            </button>
          )}
        </div>
        
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 lg:px-6 py-4">Siswa</th>
                  <th className="px-5 lg:px-6 py-4">Kelas</th>
                  <th className="px-5 lg:px-6 py-4 text-center">Jumlah Alpha</th>
                  <th className="px-5 lg:px-6 py-4">Status & Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {topWarnings.map((w) => <WarningRow key={w.id} w={w} />)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-50 dark:bg-zinc-950 border-0 rounded-[2rem]">
          <div className="bg-white dark:bg-zinc-900 p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl font-black text-slate-900 dark:text-white">
                <AlertTriangle className="size-6 text-amber-500" />
                Seluruh Peringatan Alpha
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-5 lg:px-6 py-4">Siswa</th>
                  <th className="px-5 lg:px-6 py-4">Kelas</th>
                  <th className="px-5 lg:px-6 py-4 text-center">Jumlah Alpha</th>
                  <th className="px-5 lg:px-6 py-4">Status & Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                {warnings.map((w) => <WarningRow key={w.id} w={w} />)}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
