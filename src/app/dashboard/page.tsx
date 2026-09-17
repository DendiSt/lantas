import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CreateRequestDialog } from "@/components/siswa/CreateRequestDialog";
import { RequestHistoryList } from "@/components/siswa/RequestHistoryList";
import { BottomNav } from "@/components/siswa/BottomNav";
import {
  GraduationCap,
  ArrowLeftRight,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Thermometer,
  LogOut,
  CalendarDays,
  Plus,
  AlertCircle,
  Settings,
  User
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { StudentLogoutButton } from "@/components/dashboard/StudentLogoutButton";
import { ProfileIncompletePopup } from "@/components/siswa/ProfileIncompletePopup";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function SiswaDashboardPage() {
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
  const requests = student.requests || [];

  // Statistik ringkasan
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === "PENDING").length;
  const approvedRequests = requests.filter((r) => r.status === "APPROVED").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col pb-16 md:pb-8">
      <ProfileIncompletePopup profileCompleted={student.profileCompleted} />
      {/* Top Navbar Header - Seamless Mobile & Desktop */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  LANTAS
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-semibold border border-slate-200 dark:border-zinc-700">
                  PORTAL SISWA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                SMK Negeri 2 Subang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <div className="hidden md:block">
              <CreateRequestDialog
                studentId={student.id}
                studentName={studentName}
                triggerClassName="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              />
            </div>

            <Link href="/dashboard/profile" className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700 transition-colors">
              <User className="size-4" />
              <span className="hidden sm:inline">Profil</span>
            </Link>

            {/* Switch Role Link */}
            <StudentLogoutButton />
          </div>
        </div>
      </header>

      {/* Main Container: Fully Responsive (max-w-4xl mx-auto py-6 sm:py-8 px-4) */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* User Greeting & Header Ringkas */}
        <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-12 sm:size-14 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-lg sm:text-xl font-bold shrink-0 shadow-xs overflow-hidden">
              {student.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={student.avatarUrl} alt={studentName} className="size-full object-cover" />
              ) : (
                studentName
                  .split(" ")
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join("")
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Halo, {studentName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Aktif
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                Class <span className="font-semibold text-slate-800 dark:text-zinc-200">{studentClass}</span>
                {student.nisn ? ` • NISN: ${student.nisn}` : " • NISN: Belum diisi"}
              </p>
            </div>
          </div>

          {/* Quick Notice Info */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-300">
            <ShieldCheck className="size-4 text-slate-800 dark:text-white shrink-0" />
            <span>Perizinan mandiri terhubung real-time dengan TU</span>
          </div>
        </div>

        {!student.profileCompleted && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex gap-3">
              <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="font-bold text-amber-800 dark:text-amber-200 text-sm">Profil Belum Lengkap!</p>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">Lengkapi data diri (NISN, Alamat, dll) agar pengajuan izin dapat diproses.</p>
              </div>
            </div>
            <Link
              href="/dashboard/profile"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0 whitespace-nowrap self-end sm:self-auto"
            >
              Lengkapi Profil
            </Link>
          </div>
        )}

        {/* Metric Summary Cards Grid (Clean Monochromatic & Neutral) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Izin</span>
              <FileText className="size-4" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{totalRequests}</p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Semua pengajuan</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 shadow-xs">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Menunggu</span>
              <Clock className="size-4" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-200">{pendingRequests}</p>
            <p className="text-[11px] text-amber-700/70 dark:text-amber-400 mt-0.5">Dalam verifikasi</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Disetujui</span>
              <CheckCircle2 className="size-4" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-200">{approvedRequests}</p>
            <p className="text-[11px] text-emerald-700/70 dark:text-emerald-400 mt-0.5">Izin terverifikasi</p>
          </div>
        </div>

        {/* Mobile View CTA Button (Visible on mobile, hidden on desktop since header already has it) */}
        <div className="block md:hidden">
          <CreateRequestDialog
            studentId={student.id}
            studentName={studentName}
          />
        </div>

        <div id="history-section" className="space-y-3 pt-1">
          <RequestHistoryList 
            requests={requests as any} 
            studentId={student.id}
            studentName={studentName}
          />
        </div>
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block mt-auto border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 px-6 text-center text-xs text-slate-500 dark:text-zinc-400">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="font-medium text-slate-700 dark:text-zinc-300">
            LANTAS • Layanan Terpadu Administrasi Sekolah
          </p>
          <p className="text-[11px]">SMK Negeri 2 Subang  • MVP Prototyping</p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Home, History, Profile) */}
      <BottomNav
        studentName={studentName}
        studentClass={studentClass}
        totalRequests={totalRequests}
        pendingRequests={pendingRequests}
      />
    </div>
  );
}
