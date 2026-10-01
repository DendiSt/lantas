"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import bcrypt from "bcryptjs";

export async function updateTeacherSettings(
  data: {
    currentPassword?: string;
    newPassword?: string;
    subjectIds?: string[];
    nip?: string | null;
    name?: string;
    username?: string;
  }
) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updateData: any = {};
    
    if (data.subjectIds) {
      updateData.subjects = {
        set: data.subjectIds.map((id) => ({ id })),
      };
    }
    
    if (data.nip !== undefined && data.nip !== null && data.nip.trim() !== "") {
      const existingNip = await prisma.user.findFirst({
        where: { nip: data.nip.trim() }
      });
      if (existingNip && existingNip.id !== session.userId) {
        return { success: false, error: "NIP sudah digunakan oleh pengguna lain" };
      }
      updateData.nip = data.nip.trim();
    } else if (data.nip === "") {
      updateData.nip = null;
    }

    if (data.name) updateData.name = data.name;
    if (data.username) updateData.username = data.username;

    if (data.newPassword && data.newPassword.trim() !== "") {
      if (!data.currentPassword) {
        return { success: false, error: "Kata sandi saat ini wajib diisi untuk mengubah kata sandi" };
      }
      
      const teacher = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!teacher) return { success: false, error: "Pengguna tidak ditemukan" };
      
      const isValid = await bcrypt.compare(data.currentPassword, teacher.password);
      if (!isValid) return { success: false, error: "Kata sandi saat ini salah" };

      updateData.password = await bcrypt.hash(data.newPassword.trim(), 10);
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
    });

    revalidatePath("/teacher/settings");
    revalidatePath("/teacher");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating teacher settings:", error);
    return { success: false, error: "Gagal memperbarui pengaturan" };
  }
}
