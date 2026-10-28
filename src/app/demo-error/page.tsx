"use client";

import { useState } from "react";
import AdminError from "@/app/admin/error";
import TeacherError from "@/app/teacher/error";
import StudentDashboardError from "@/app/dashboard/error";
import RootError from "@/app/error";

export default function DemoErrorPage() {
  const [activeTab, setActiveTab] = useState<"admin" | "teacher" | "student" | "root">("admin");
  const [shouldCrash, setShouldCrash] = useState(false);

  // Jika tombol simulasi crash diklik, lemparkan error sungguhan agar ditangkap error.tsx Next.js
  if (shouldCrash) {
    throw new Error("Simulasi kegagalan server: Koneksi database terputus sementara.");
  }

  const dummyError = {
    name: "Error",
    message: "Gagal mengambil data dari database.",
    digest: "ERR_LANTAS_503_DB_TIMEOUT",
  };

  const handleReset = () => {
    alert("Tombol 'Coba Lagi' ditekan! Sistem akan memuat ulang data.");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8">
      {/* Control Bar Preview */}
      <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">
            Preview Tampilan Error Boundary
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Pilih modul untuk melihat tampilan error barunya:
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("admin")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "admin"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
            }`}
          >
            Modul Admin (TU)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("teacher")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "teacher"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
            }`}
          >
            Modul Guru
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("student")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "student"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
            }`}
          >
            Modul Siswa
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("root")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "root"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
            }`}
          >
            Umum / Root
          </button>

          <button
            type="button"
            onClick={() => setShouldCrash(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-xs cursor-pointer ml-2"
            title="Memicu error sungguhan agar Next.js memunculkan error boundary live"
          >
            💥 Uji Crash Nyata
          </button>
        </div>
      </div>

      {/* Area Tampilan Komponen */}
      <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-md">
        {activeTab === "admin" && (
          <AdminError error={dummyError} reset={handleReset} />
        )}

        {activeTab === "teacher" && (
          <TeacherError error={dummyError} reset={handleReset} />
        )}

        {activeTab === "student" && (
          <StudentDashboardError error={dummyError} reset={handleReset} />
        )}

        {activeTab === "root" && (
          <RootError error={dummyError} reset={handleReset} />
        )}
      </div>
    </div>
  );
}

