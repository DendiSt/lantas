import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex">
      <AdminSidebar currentPath="/admin/settings" staffName={session.username} />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Pengaturan
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Pengaturan sistem dan akun
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6 max-w-4xl mx-auto">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Akun Admin</h2>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{session.username}</p>
                  <p className="text-xs text-slate-500">Administrator Utama</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" disabled>
                  Ubah Sandi
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Preferensi Sistem</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 opacity-70">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifikasi Email</p>
                    <p className="text-xs text-slate-500">Kirim email jika ada pengajuan izin baru</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">Segera Hadir</span>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 opacity-70">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Ekspor Data (Excel/PDF)</p>
                    <p className="text-xs text-slate-500">Fitur untuk mengunduh laporan perizinan</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">Segera Hadir</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3 text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left flex flex-col sm:flex-row justify-between gap-2">
          <p className="font-medium text-slate-700 dark:text-zinc-300">
            LANTAS • Layanan Terpadu Administrasi Sekolah
          </p>
          <p className="text-[11px]">Sistem Rekap & Verifikasi Perizinan Mandiri Siswa</p>
        </footer>
      </div>
    </div>
  );
}
