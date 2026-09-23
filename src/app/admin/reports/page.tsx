import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getReportData } from "@/app/actions/reports";
import { AbsenceLineChart } from "@/components/admin/reports/AbsenceLineChart";
import { StudentAbsenceTable } from "@/components/admin/reports/StudentAbsenceTable";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const reportData = await getReportData();

  return (
    <>
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Laporan Siswa
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Grafik tingkat ketidakhadiran siswa
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="size-5 text-slate-700 dark:text-zinc-300" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Tren Ketidakhadiran Berdasarkan Alasan</h2>
              </div>
              <AbsenceLineChart data={reportData?.overviewData || []} />
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-2 mb-6">
                <Users className="size-5 text-slate-700 dark:text-zinc-300" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daftar Siswa & Detail Ketidakhadiran</h2>
              </div>
              <StudentAbsenceTable students={reportData?.studentsData || []} />
            </div>
          </div>
        </main>

        <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3 text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left flex flex-col sm:flex-row justify-between gap-2">
          <p className="font-medium text-slate-700 dark:text-zinc-300">
            LANTAS • Layanan Terpadu Administrasi Sekolah
          </p>
          <p className="text-[11px]">Sistem Rekap & Verifikasi Perizinan Mandiri Siswa</p>
        </footer>
    </>
  );
}
