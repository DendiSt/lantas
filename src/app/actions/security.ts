"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getSecurityGuards() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return [];

  return await prisma.user.findMany({
    where: { role: "SECURITY" },
    orderBy: { createdAt: "asc" },
  });
}

export async function createSecurityGuard(formData: FormData) {
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
        role: "SECURITY",
        profileCompleted: true,
      },
    });

    revalidatePath("/admin/security");
    return { success: true, message: "Satpam berhasil ditambahkan" };
  } catch (error) {
    console.error("Error createSecurityGuard:", error);
    return { success: false, error: "Terjadi kesalahan server" };
  }
}

export async function updateSecurityGuard(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Akses ditolak" };
    }

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!id || !name || !username) {
      return { success: false, error: "Kolom nama dan username wajib diisi" };
    }

    const existingUser = await prisma.user.findFirst({
      where: { username, NOT: { id } },
    });

    if (existingUser) {
      return { success: false, error: "Username sudah digunakan" };
    }

    const updateData: any = { name, username };
    if (password && password.trim().length > 0) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/security");
    return { success: true, message: "Data Satpam berhasil diperbarui" };
  } catch (error) {
    console.error("Error updateSecurityGuard:", error);
    return { success: false, error: "Terjadi kesalahan server" };
  }
}

export async function deleteSecurityGuard(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Akses ditolak" };
    }

    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ID tidak valid" };

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/security");
    return { success: true, message: "Satpam berhasil dihapus" };
  } catch (error) {
    console.error("Error deleteSecurityGuard:", error);
    return { success: false, error: "Gagal menghapus satpam" };
  }
}
