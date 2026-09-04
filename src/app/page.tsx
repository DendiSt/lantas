import Link from "next/link";
import { GraduationCap, User, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Ambil data siswa dan admin secara dinamis dari database
  const student = await prisma.user.findFirst({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "asc" },
  });

  const tuStaff = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  const studentName = student?.name || "Zibril Suhendar Noor";
  const studentClass = student?.classId ? `(${student.classId})` : "(10 TAB B)";
  const staffName = tuStaff?.name || "Bambang, S.Pd (Staf TU)";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-900 dark:text-zinc-100">
      <div className="w-full max-w-md space-y-6">
        {/* App Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex size-14 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 items-center justify-center shadow-md shadow-slate-900/10 mb-1">
            <GraduationCap className="size-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            LANTAS
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">
            Layanan Terpadu Administrasi Sekolah
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Sistem Perizinan Mandiri Siswa & Verifikasi Tata Usaha (TU) Real-time
          </p>
        </div>

        {/* Role Switcher Selection */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 text-center">
            Pilih Peran untuk Pengujian
          </p>

          {/* Role 1: Siswa */}
          <Link href="/dashboard" className="block group">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 group-hover:border-slate-400 dark:group-hover:border-zinc-600 bg-white dark:bg-zinc-900 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <User className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Portal Siswa</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 font-medium">
                      Responsive
                    </span>
                  </h2>
                  {/* Teks Dinamis Dari Database */}
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Masuk sebagai <strong className="font-semibold text-slate-700 dark:text-zinc-300">{studentName}</strong> {studentClass}
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Role 2: Staf TU */}
          <Link href="/admin" className="block group">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 group-hover:border-slate-400 dark:group-hover:border-zinc-600 bg-white dark:bg-zinc-900 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldAlert className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Dashboard Staf TU</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 font-medium">
                      Admin Panel
                    </span>
                  </h2>
                  {/* Teks Dinamis Dari Database */}
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Petugas: <strong className="font-semibold text-slate-700 dark:text-zinc-300">{staffName}</strong>
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        {/* Prototype Highlights */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs shadow-xs">
          <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>Alur Pengujian MVP:</span>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-500 dark:text-zinc-400">
            <li>Buka <strong>Portal Siswa</strong> dan klik &quot;+ AJUKAN IZIN BARU&quot;.</li>
            <li>Kirim perizinan sakit atau pulang awal.</li>
            <li>Buka <strong>Dashboard Staf TU</strong> untuk verifikasi dan klik Approve/Reject.</li>
            <li>Lihat status izin siswa langsung terupdate secara instan.</li>
          </ol>
        </div>

        <p className="text-[11px] text-center text-slate-400 dark:text-zinc-500">
          SMK Negeri 2 Subang • MVP Prototyping Phase
        </p>
      </div>
    </div>
  );
}
