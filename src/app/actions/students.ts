"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { getSession } from "@/lib/auth";

export async function createStudent(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!name || !username || !password) return { success: false, error: "Harap isi semua field" };

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return { success: false, error: "Username sudah digunakan" };

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role: Role.STUDENT,
      }
    });

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan saat menambahkan siswa" };
  }
}

export async function deleteStudent(studentId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    await prisma.user.delete({ where: { id: studentId } });
    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan saat menghapus data" };
  }
}

export async function resetPassword(studentId: string, newPassword: string = "password123") {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: studentId },
      data: { password: hashedPassword }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan saat mereset password" };
  }
}
