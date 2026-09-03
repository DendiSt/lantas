import { FileText, Clock, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";

interface AdminStatsCardsProps {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export function AdminStatsCards({
  total,
  pending,
  approved,
  rejected,
}: AdminStatsCardsProps) {
  // Hitung persentase
  const pendingPercentage = total > 0 ? ((pending / total) * 100).toFixed(0) : "0";
  const processedTotal = approved + rejected;
  const approvalRate = processedTotal > 0 ? ((approved / processedTotal) * 100).toFixed(1) : "0.0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Total Requests Metric */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            Total Pengajuan
          </span>
          <div className="size-9 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
            <FileText className="size-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{total}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
          <TrendingUp className="size-3.5" />
          <span className="font-semibold">+12.5%</span>
          <span className="text-slate-400 dark:text-zinc-500">vs minggu lalu</span>
        </div>
      </div>

      {/* 2. Pending Verification Metric */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Menunggu Verifikasi
            </span>
            {pending > 0 && (
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <div className="size-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center">
            <Clock className="size-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{pending}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
          <AlertTriangle className="size-3.5" />
          <span className="font-semibold">{pendingPercentage}%</span>
          <span className="text-slate-400 dark:text-zinc-500">dari total antrean</span>
        </div>
      </div>

      {/* 3. Approval Rate Metric */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            Approval Rate
          </span>
          <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <CheckCircle2 className="size-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{approvalRate}%</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
          <TrendingUp className="size-3.5" />
          <span className="font-semibold">+4.2%</span>
          <span className="text-slate-400 dark:text-zinc-500">akurasi berkas</span>
        </div>
      </div>
    </div>
  );
}
