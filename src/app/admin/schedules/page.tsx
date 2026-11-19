import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ScheduleManager } from "@/components/admin/ScheduleManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jadwal Pelajaran | Admin LANTAS",
};

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
        { classId: 'asc' },
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
      <ScheduleManager 
        initialSchedules={schedules} 
        classes={classes}
        subjects={subjects}
        teachers={teachers}
      />

      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3 text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left flex flex-col sm:flex-row justify-between gap-2">
        <p className="font-medium text-slate-700 dark:text-zinc-300">
          LANTAS • Layanan Terpadu Administrasi Sekolah
        </p>
        <p className="text-[11px]">Sistem Rekap & Verifikasi Perizinan Mandiri Siswa</p>
      </footer>
    </>
  );
}
