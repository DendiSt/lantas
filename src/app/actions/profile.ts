"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function updateProfile(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") return { success: false, error: "Unauthorized" };

  const classId = formData.get("classId") as string;
  const nisn = formData.get("nisn") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const gender = formData.get("gender") as string;
  const parentName = formData.get("parentName") as string;
  const birthDateStr = formData.get("birthDate") as string;

  if (!classId || !nisn || !address || !phone || !gender || !parentName || !birthDateStr) {
    return { success: false, error: "Harap isi semua field profil" };
  }

  try {
    const existingNisn = await prisma.user.findFirst({ where: { nisn, id: { not: session.userId } } });
    if (existingNisn) return { success: false, error: "NISN sudah digunakan oleh siswa lain" };

    const birthDate = new Date(birthDateStr);

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        classId,
        nisn,
        address,
        phone,
        gender,
        parentName,
        birthDate,
        profileCompleted: true,
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan saat menyimpan profil" };
  }
}

export async function updateAvatar(avatarUrl: string) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") return { success: false, error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: { avatarUrl }
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan saat menyimpan foto profil" };
  }
}

export async function changePassword(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") return { success: false, error: "Unauthorized" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "Semua field harus diisi" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Kata sandi baru dan konfirmasi tidak cocok" };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return { success: false, error: "Pengguna tidak ditemukan" };

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { success: false, error: "Kata sandi saat ini salah" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.userId },
      data: { password: hashedPassword }
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mengganti kata sandi" };
  }
}
