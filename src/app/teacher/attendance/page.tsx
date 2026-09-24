import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import Link from "next/link";
import { Users, ChevronRight, School } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherClassesPage() {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/");
  }

  // Get teacher details to get homeroom class
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      homeroomClass: true,
      subjects: true,
    }
  });

  if (!user) {
    redirect("/");
  }

  // If the teacher hasn't set up subjects, maybe warn them, but let them pass.
  
  // Get ALL classes
  const classes = await prisma.class.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { students: true }
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col lg:flex-row">
      <TeacherSidebar teacherName={user.name} className={user.homeroomClass?.name} currentPath="/teacher/attendance" />
      
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Jurnal Kelas
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Pilih kelas yang sedang Anda ajar untuk mengisi absensi (jurnal kelas).
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
          
          {user.subjects.length === 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 shadow-xs">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Perhatian: Mata Pelajaran Belum Diatur</p>
              <p className="text-xs text-amber-700/80 mt-1">Anda belum memilih mata pelajaran yang diampu. Silakan atur di menu Pengaturan terlebih dahulu.</p>
              <Link href="/teacher/settings" className="inline-block mt-3 px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl">Buka Pengaturan</Link>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(cls => (
              <Link 
                key={cls.id} 
                href={`/teacher/attendance/${cls.id}`}
                className="group p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs hover:border-indigo-500 hover:shadow-md transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <School className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{cls.name}</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                      <Users className="size-3" /> {cls._count.students} Siswa
                    </p>
                  </div>
                </div>
                <ChevronRight className="size-5 text-slate-300 dark:text-zinc-600 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
