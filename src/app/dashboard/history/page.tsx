import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RequestHistoryList } from "@/components/siswa/RequestHistoryList";
import { BottomNav } from "@/components/siswa/BottomNav";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function SiswaHistoryPage() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/");
  }

  const student = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      class: true,
      requests: {
        include: {
          reviewer: {
            select: { name: true },
          },
          security: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!student) {
    redirect("/");
  }

  const studentName = student.name;
  const studentClass = student.class?.name || "Belum diatur";

  // Use the new helper to get all unified history including manual absences
  const { getStudentCombinedHistory } = await import("@/app/actions/student");
  const requests = await getStudentCombinedHistory(student.id);
  
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col md:flex-row font-sans selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900/30 dark:selection:text-indigo-200">
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 pb-24 md:pb-8">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-slate-700 dark:text-zinc-300"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="size-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Semua Riwayat
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* History List */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 shadow-xs">
          <RequestHistoryList 
            requests={requests as any} 
            studentId={student.id}
            studentName={studentName}
          />
        </div>

      </main>

      <BottomNav 
        studentName={studentName}
        studentClass={studentClass}
        totalRequests={totalRequests}
        pendingRequests={pendingRequests}
      />
    </div>
  );
}
