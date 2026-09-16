"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getTeachers() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return [];

  return await prisma.user.findMany({
    where: { role: "TEACHER" },
    include: { homeroomClass: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createTeacher(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Akses ditolak" };
    }

    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!name || !username || !password) {
      return { success: false, error: "Semua kolom wajib diisi" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { success: false, error: "Username sudah digunakan" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role: "TEACHER",
        profileCompleted: true,
      },
    });

    revalidatePath("/admin/teachers");
    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error) {
    console.error("Gagal menambah guru:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function updateTeacher(id: string, formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Akses ditolak" };
    }

    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!name || !username) {
      return { success: false, error: "Nama dan Username wajib diisi" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser && existingUser.id !== id) {
      return { success: false, error: "Username sudah digunakan guru/user lain" };
    }

    const dataToUpdate: any = { name, username };

    if (password && password.trim().length > 0) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/admin/teachers");
    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error) {
    console.error("Gagal mengupdate guru:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function deleteTeacher(id: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Akses ditolak" };
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/teachers");
    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus guru:", error);
    return { success: false, error: "Terjadi kesalahan sistem (Mungkin guru ini masih menjadi wali kelas atau memiliki data absensi)" };
  }
}
