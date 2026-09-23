import { prisma } from "@/lib/prisma";
import { AdminRequestsTable } from "@/components/admin/AdminRequestsTable";
import { ShieldCheck } from "lucide-react";

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const searchParams = await props.searchParams;
  const page = parseInt((searchParams.page as string) || "1", 10);
  const status = (searchParams.status as string) || "ALL";
  const type = (searchParams.type as string) || "ALL";
  const q = (searchParams.q as string) || "";
  const itemsPerPage = 5;

  const where: any = {};
  if (status !== "ALL") where.status = status;
  if (type !== "ALL") where.type = type;
  if (q) {
    where.OR = [
      { student: { name: { contains: q, mode: 'insensitive' } } },
      { student: { class: { name: { contains: q, mode: 'insensitive' } } } },
      { reason: { contains: q, mode: 'insensitive' } },
    ];
  }

  // Hitung total data untuk pagination
  const totalRequests = await prisma.request.count({ where });
  const pendingCount = await prisma.request.count({ where: { status: "PENDING" } });

  // Ambil data sesuai halaman dan filter
  const requests = await prisma.request.findMany({
    where,
    take: itemsPerPage,
    skip: (page - 1) * itemsPerPage,
    include: {
      student: {
        select: {
          id: true,
          name: true,
          class: true,
          avatarUrl: true,
        },
      },
      reviewer: {
        select: {
          name: true,
        },
      },
      security: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Pengajuan Izin
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold border border-slate-200 dark:border-zinc-700">
                Live Data
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Verifikasi dan rekap data perizinan siswa Sekolah
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              <ShieldCheck className="size-3.5 text-slate-900 dark:text-white" />
              <span>Sistem Terverifikasi TU</span>
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Daftar Pengajuan Masuk
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Pembaruan instan tanpa refresh
              </p>
            </div>
            <AdminRequestsTable 
              initialRequests={requests} 
              totalItems={totalRequests} 
              currentPage={page}
              itemsPerPage={itemsPerPage}
              pendingCount={pendingCount}
            />
          </div>
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
