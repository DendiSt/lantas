import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SubjectManager } from "@/components/admin/SubjectManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mata Pelajaran | Admin LANTAS",
};

export default async function AdminSubjectsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { teachers: true }
      },
      teachers: {
        select: { name: true },
        orderBy: { name: "asc" }
      }
    },
  });

  return (
    <>
      <SubjectManager initialSubjects={subjects} />

      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3 text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left flex flex-col sm:flex-row justify-between gap-2">
        <p className="font-medium text-slate-700 dark:text-zinc-300">
          LANTAS • Layanan Terpadu Administrasi Sekolah
        </p>
        <p className="text-[11px]">Sistem Rekap & Verifikasi Perizinan Mandiri Siswa</p>
      </footer>
    </>
  );
}
