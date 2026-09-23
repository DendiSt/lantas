import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const tuStaff = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  const staffName = tuStaff?.name || session.username;

  const pendingCount = await prisma.request.count({
    where: { status: "PENDING" }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col lg:flex-row">
      <AdminSidebar staffName={staffName} pendingCount={pendingCount} />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
