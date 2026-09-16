import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/siswa/ProfileForm";
import { AvatarUpload } from "@/components/siswa/AvatarUpload";
import { ChangePasswordDialog } from "@/components/siswa/ChangePasswordForm";
import { User, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SiswaProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/");
  }

  const student = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!student) redirect("/");

  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="pb-24 max-w-lg mx-auto">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="px-4 py-4 sm:px-6 flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <User className="size-6 text-slate-900 dark:text-white" /> Profil Saya
          </h1>
        </div>
      </header>
      
      <main className="p-4 sm:p-6 space-y-6">
        <AvatarUpload 
          currentAvatarUrl={student.avatarUrl} 
          studentName={student.name} 
        />
        <ProfileForm student={student} classes={classes} />
        <div className="mt-4">
          <ChangePasswordDialog />
        </div>
      </main>
    </div>
  );
}
