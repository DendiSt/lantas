import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/");
  }

  const teacher = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      homeroomClass: true,
    },
  });

  const teacherName = teacher?.name || session.username;
  const targetClass = teacher?.homeroomClass;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col lg:flex-row">
      <TeacherSidebar teacherName={teacherName} className={targetClass?.name} />
      <div className="flex-1 print:pl-0 print:w-full flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
