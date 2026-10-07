import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ParticleBackground } from "@/components/shared/ParticleBackground";

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
      <ParticleBackground particleCount={50} speed={0.2} particleColor="rgba(156, 163, 175, 0.3)" connectionColor="rgba(156, 163, 175, 0.1)" />
      <AdminSidebar staffName={staffName} pendingCount={pendingCount} />
      <div className="relative z-10 flex-1 print:pl-0 print:w-full flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
