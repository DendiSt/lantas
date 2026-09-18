import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { QRScanner } from "@/components/security/QRScanner";
import { ShieldCheck } from "lucide-react";
import { StudentLogoutButton } from "@/components/dashboard/StudentLogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSecurityScanHistory } from "@/app/actions/requests";

export const dynamic = "force-dynamic";

export default async function SecurityDashboard() {
  const session = await getSession();
  if (!session || session.role !== "SECURITY") {
    redirect("/");
  }

  const historyRes = await getSecurityScanHistory();
  const history = historyRes.success ? historyRes.data : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm dark:shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white leading-none tracking-wide">
              LANTAS <span className="text-indigo-600 dark:text-indigo-400">SECURITY</span>
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Pos Gerbang Utama</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <StudentLogoutButton />
        </div>
      </header>

      <main className="flex-1 px-4 py-8 max-w-md w-full mx-auto flex flex-col items-center">
        <div className="text-center mb-8">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Sistem Gate Pass</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Petugas: <span className="font-semibold text-slate-900 dark:text-white">{session.username}</span>
          </p>
        </div>
        
        <div className="w-full">
          <QRScanner initialHistory={history} />
        </div>
        
        <p className="text-xs text-slate-500 text-center mt-8">
          Hanya memindai QR Code yang dihasilkan oleh sistem LANTAS milik Sekolah.
        </p>
      </main>
    </div>
  );
}
