import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StudentTable } from "@/components/admin/StudentTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CreateStudentDialog } from "@/components/admin/CreateStudentDialog";
import { ImportStudentsDialog } from "@/components/admin/ImportStudentsDialog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manajemen Siswa | Admin LANTAS",
};

export default async function AdminStudentsPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const searchParams = await props.searchParams;
  const page = typeof searchParams?.page === 'string' ? Number(searchParams.page) : 1;
  const currentPage = page > 0 ? page : 1;
  const take = 20;
  const skip = (currentPage - 1) * take;
  
  const query = typeof searchParams?.query === 'string' ? searchParams.query : '';
  const classId = typeof searchParams?.classId === 'string' ? searchParams.classId : 'ALL';
  const sortParam = typeof searchParams?.sort === 'string' ? searchParams.sort.toLowerCase() : 'asc';
  const sort = sortParam === 'desc' ? 'desc' : 'asc';

  const whereCondition: any = { role: "STUDENT" };
  
  if (query) {
    whereCondition.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { username: { contains: query, mode: "insensitive" } },
      { nisn: { contains: query, mode: "insensitive" } },
    ];
  }
  
  if (classId !== 'ALL') {
    whereCondition.classId = classId;
  }

  const [students, totalStudents, classes] = await Promise.all([
    prisma.user.findMany({
      where: whereCondition,
      orderBy: [
        { name: sort },
        { id: "asc" }
      ],
      include: { class: true },
      skip,
      take
    }),
    prisma.user.count({ where: whereCondition }),
    prisma.class.findMany({ orderBy: { name: "asc" } })
  ]);

  const totalPages = Math.ceil(totalStudents / take) || 1;

  return (
    <>
      <AdminPageHeader
        title="Manajemen Siswa"
        description="Kelola data seluruh siswa aktif dan alumni di sekolah"
        action={
          <div className="flex items-center gap-2.5">
            <ImportStudentsDialog classes={classes} />
            <CreateStudentDialog classes={classes} />
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <StudentTable 
          initialStudents={students} 
          classes={classes} 
          totalPages={totalPages}
          currentPage={currentPage}
          totalStudents={totalStudents}
        />
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
