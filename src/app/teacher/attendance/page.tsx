import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { AttendanceClient } from "./AttendanceClient";

export const dynamic = "force-dynamic";

export default async function TeacherAttendancePage() {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/");
  }
  
  // Always use today (local timezone)
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA'); // e.g. "2026-09-16"
  
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  // Get teacher's homeroom class
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      homeroomClass: {
        include: {
          students: {
            orderBy: { name: 'asc' }
          }
        }
      }
    }
  });

  if (!user?.homeroomClass) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center text-slate-500">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Akses Ditolak</h1>
        <p>Anda belum ditugaskan sebagai Wali Kelas. Hubungi TU.</p>
      </div>
    );
  }

  const students = user.homeroomClass.students;

  // Get existing attendances for this date
  const attendances = await prisma.attendance.findMany({
    where: {
      studentId: { in: students.map(s => s.id) },
      date: date
    }
  });

  // Get approved LANTAS requests for this date
  const requests = await prisma.request.findMany({
    where: {
      studentId: { in: students.map(s => s.id) },
      status: "APPROVED",
      createdAt: {
        gte: date,
        lt: nextDay
      }
    }
  });

  const attendanceMap: Record<string, string> = {};
  
  // Fill LANTAS requests first (they lock the status)
  const lockedStudents = new Set<string>();
  requests.forEach(req => {
    if (req.type === "SAKIT") {
      attendanceMap[req.studentId] = "SAKIT";
    } else if (req.type === "IZIN_PULANG" || req.type === "DISPENSASI") {
      // For some cases, maybe they are present initially then go home, but let's mark IZIN
      attendanceMap[req.studentId] = "IZIN";
    } else {
      attendanceMap[req.studentId] = "IZIN";
    }
    lockedStudents.add(req.studentId);
  });

  // Fill existing attendances if not locked
  attendances.forEach(att => {
    if (!lockedStudents.has(att.studentId)) {
      attendanceMap[att.studentId] = att.status;
    }
  });

  // Format mapping
  const mappedStudents = students.map(s => ({
    id: s.id,
    name: s.name,
    avatarUrl: s.avatarUrl
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col lg:flex-row">
      <TeacherSidebar teacherName={user.name} className={user.homeroomClass.name} currentPath="/teacher/attendance" />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Jurnal Kelas {user.homeroomClass.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Catat absensi harian siswa Anda di sini.
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl w-full">
          <AttendanceClient 
            dateStr={dateStr}
            students={mappedStudents} 
            initialAttendanceMap={attendanceMap}
            lockedStudents={Array.from(lockedStudents)}
            className={user.homeroomClass.name}
            hasSubmittedToday={attendances.length > 0}
          />
        </main>
      </div>
    </div>
  );
}
