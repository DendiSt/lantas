"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function createClass(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  if (!name || name.trim() === "") return { success: false, error: "Nama kelas tidak boleh kosong" };

  try {
    const existingClass = await prisma.class.findUnique({ where: { name: name.trim() } });
    if (existingClass) return { success: false, error: "Kelas dengan nama ini sudah ada" };

    await prisma.class.create({ data: { name: name.trim() } });

    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal membuat kelas" };
  }
}

export async function updateClass(id: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  if (!name || name.trim() === "") return { success: false, error: "Nama kelas tidak boleh kosong" };

  try {
    const existingClass = await prisma.class.findUnique({ where: { name: name.trim() } });
    if (existingClass && existingClass.id !== id) return { success: false, error: "Kelas dengan nama ini sudah ada" };

    await prisma.class.update({
      where: { id },
      data: { name: name.trim() }
    });

    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal memperbarui kelas" };
  }
}

export async function deleteClass(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    // Check if any students are assigned to this class
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    if (classData?._count.students && classData._count.students > 0) {
      return { success: false, error: "Tidak dapat menghapus kelas yang masih memiliki siswa" };
    }

    await prisma.class.delete({ where: { id } });

    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus kelas" };
  }
}
