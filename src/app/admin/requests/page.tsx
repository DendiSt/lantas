import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminRequestsTable } from "@/components/admin/AdminRequestsTable";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { resolveExpiredQRRequests } from "@/app/actions/requests";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pengajuan Izin | Admin LANTAS",
};

export default async function AdminRequestsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  // Auto-resolve QR kedaluwarsa secara lazy
  await resolveExpiredQRRequests();

  const searchParams = await props.searchParams;
  const page = parseInt((searchParams.page as string) || "1", 10);
  const status = (searchParams.status as string) || "ALL";
  const type = (searchParams.type as string) || "ALL";
  const classId = (searchParams.classId as string) || "ALL";
  const q = (searchParams.q as string) || "";
  const startDate = (searchParams.startDate as string) || "";
  const endDate = (searchParams.endDate as string) || "";
  const itemsPerPage = 5;

  const where: any = {};

  if (status !== "ALL") where.status = status;

  if (type !== "ALL") where.type = type;

  if (classId !== "ALL") {
    where.student = { ...where.student, classId };
  }

  if (startDate || endDate) {
    where.createdAt = {};

    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (q) {
    where.OR = [
      { student: { name: { contains: q, mode: "insensitive" } } },
      { student: { class: { name: { contains: q, mode: "insensitive" } } } },
      { reason: { contains: q, mode: "insensitive" } },
    ];
  }

  // Ambil daftar kelas untuk filter
  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Hitung total data untuk pagination
  const totalRequests = await prisma.request.count({ where });
  const pendingCount = await prisma.request.count({ where: { status: "PENDING" } });

  const requests = await prisma.request.findMany({
    where,
    skip: (page - 1) * itemsPerPage,
    take: itemsPerPage,
    include: {
      student: {
        select: {
          id: true,
          name: true,
          nisn: true,
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
      <AdminRequestsTable
        initialRequests={requests}
        totalItems={totalRequests}
        currentPage={page}
        itemsPerPage={itemsPerPage}
        pendingCount={pendingCount}
        classes={classes}
        selectedClassId={classId}
      />

      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3 text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left flex flex-col sm:flex-row justify-between gap-2">
        <p className="font-medium text-slate-700 dark:text-zinc-300">
          LANTAS • Layanan Terpadu Administrasi Sekolah
        </p>
        <p className="text-[11px]">Sistem Rekap & Verifikasi Perizinan Mandiri Siswa</p>
      </footer>
    </>
  );
}
