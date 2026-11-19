import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClassListTable } from "@/components/admin/classes/ClassListTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manajemen Kelas | Admin LANTAS",
};

export default async function AdminClassesPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" },
    include: {
      homeroomTeacher: true,
      _count: {
        select: { students: true }
      }
    }
  });

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { name: "asc" }
  });

  return (
    <>
      <ClassListTable initialClasses={classes} teachers={teachers} />

      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3 text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left flex flex-col sm:flex-row justify-between gap-2">
        <p className="font-medium text-slate-700 dark:text-zinc-300">
          LANTAS • Layanan Terpadu Administrasi Sekolah
        </p>
        <p className="text-[11px]">Sistem Rekap & Verifikasi Perizinan Mandiri Siswa</p>
      </footer>
    </>
  );
}
