import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "@/components/siswa/ChangePasswordForm";
import { UpdateAdminProfileForm } from "@/components/admin/UpdateAdminProfileForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  if (!user) redirect("/");

  return (
    <>
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0">
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
              
              <UpdateAdminProfileForm initialName={user.name} initialUsername={user.username} />

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/50">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Keamanan</h2>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Kata Sandi</p>
                    <p className="text-xs text-slate-500">Perbarui kata sandi akun Anda secara berkala</p>
                  </div>
                  <ChangePasswordDialog trigger={
                    <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs cursor-pointer shadow-xs bg-white dark:bg-zinc-900">
                      Ubah Sandi
                    </Button>
                  } />
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
    </>
  );
}
