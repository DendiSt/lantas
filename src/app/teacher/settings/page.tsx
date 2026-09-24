import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TeacherSettingsClient } from "@/components/teacher/TeacherSettingsClient";

export const dynamic = "force-dynamic";

export default async function TeacherSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/");
  }

  // Get all subjects
  const allSubjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
  });

  // Get teacher's currently selected subjects
  const teacher = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { subjects: true },
  });

  const selectedSubjectIds = teacher?.subjects.map(s => s.id) || [];

  return (
    <>
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Pengaturan Guru
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Atur mata pelajaran yang Anda ampu dan profil Anda
          </p>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <TeacherSettingsClient 
          allSubjects={allSubjects} 
          initialSelectedSubjectIds={selectedSubjectIds} 
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
