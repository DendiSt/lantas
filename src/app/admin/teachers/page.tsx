import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTeachers } from "@/app/actions/teachers";
import { TeacherListTable } from "@/components/admin/teachers/TeacherListTable";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const teachers = await getTeachers();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col lg:flex-row">
      <AdminSidebar currentPath="/admin/teachers" staffName={session.username} />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Manajemen Guru (Wali Kelas)
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Kelola akun Guru yang memiliki akses ke sistem Jurnal Kelas
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          <TeacherListTable teachers={teachers} currentUserId={session.userId} />
        </main>
      </div>
    </div>
  );
}
