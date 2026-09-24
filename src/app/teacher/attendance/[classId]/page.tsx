import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { AttendanceClient } from "../AttendanceClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherClassAttendancePage({ params }: { params: { classId: string } }) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/");
  }

  const classId = params.classId;
  
  // Get teacher details to get homeroom class and subjects
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      homeroomClass: true,
      subjects: true,
    }
  });

  if (!user) redirect("/");

  // Get Class and its students
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      students: {
        orderBy: { name: 'asc' }
      }
    }
  });

  if (!classData) redirect("/teacher/attendance");

  // Always use today (local timezone)
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA'); // e.g. "2026-09-16"
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const mappedStudents = classData.students.map(s => ({
    id: s.id,
    name: s.name,
    avatarUrl: s.avatarUrl
  }));

  const subjects = user.subjects.map(s => ({ id: s.id, name: s.name }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col lg:flex-row">
      <TeacherSidebar teacherName={user.name} className={user.homeroomClass?.name} currentPath="/teacher/attendance" />
      
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/teacher/attendance" className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition-colors">
                <ArrowLeft className="size-5" />
              </Link>
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Jurnal Kelas {classData.name}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 ml-10">
              Isi kehadiran siswa berdasarkan mata pelajaran dan jam ke-
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl w-full mx-auto">
          <AttendanceClient 
            dateStr={dateStr}
            date={date}
            students={mappedStudents} 
            teacherSubjects={subjects}
            classId={classId}
          />
        </main>
      </div>
    </div>
  );
}
