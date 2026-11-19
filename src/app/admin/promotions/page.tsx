import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ClassPromotionManager } from "@/components/admin/ClassPromotionManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kenaikan Kelas | Admin LANTAS",
};

export default async function AdminPromotionsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" },
    include: {
      students: {
        where: { role: "STUDENT" },
        select: {
          id: true,
          name: true,
          nisn: true,
          username: true,
        },
        orderBy: { name: "asc" },
      },
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Kenaikan Kelas"
        description="Pindahkan siswa antar kelas secara massal untuk tahun ajaran baru"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl w-full mx-auto">
        <ClassPromotionManager classes={classes} />
      </main>

      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3 text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left flex flex-col sm:flex-row justify-between gap-2">
        <p className="font-medium text-slate-700 dark:text-zinc-300">
          LANTAS • Layanan Terpadu Administrasi Sekolah
        </p>
        <p className="text-[11px]">Sistem Rekap & Verifikasi Perizinan Mandiri Siswa</p>
      </footer>
    </>
  );
}
