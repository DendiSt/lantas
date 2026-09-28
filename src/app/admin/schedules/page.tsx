import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ScheduleManager } from "@/components/admin/ScheduleManager";

export const dynamic = "force-dynamic";

export default async function AdminSchedulesPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const [schedules, classes, subjects, teachers] = await Promise.all([
    prisma.schedule.findMany({
      include: {
        class: true,
        subject: true,
        teacher: true
      },
      orderBy: [
        { class: { name: 'asc' } },
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    }),
    prisma.class.findMany({ orderBy: { name: 'asc' } }),
    prisma.subject.findMany({ include: { teachers: true }, orderBy: { name: 'asc' } }),
    prisma.user.findMany({ where: { role: 'TEACHER' }, orderBy: { name: 'asc' } })
  ]);

  return (
    <>
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Jadwal Pelajaran
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Kelola jadwal pelajaran untuk setiap kelas dan guru
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ScheduleManager 
            initialSchedules={schedules} 
            classes={classes}
            subjects={subjects}
            teachers={teachers}
          />
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
