"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSubject(name: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const existing = await prisma.subject.findUnique({
      where: { name },
    });

    if (existing) {
      return { success: false, error: "Mata pelajaran sudah ada" };
    }

    const subject = await prisma.subject.create({
      data: { name },
    });

    revalidatePath("/admin/subjects");
    return { success: true, subject };
  } catch (error: any) {
    console.error("Error creating subject:", error);
    return { success: false, error: "Gagal menambahkan mata pelajaran" };
  }
}

export async function deleteSubject(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.subject.delete({
      where: { id },
    });
    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting subject:", error);
    return { success: false, error: "Gagal menghapus mata pelajaran" };
  }
}

export async function updateSubject(id: string, name: string) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }
  
    try {
      const existing = await prisma.subject.findUnique({
        where: { name },
      });
  
      if (existing && existing.id !== id) {
        return { success: false, error: "Mata pelajaran sudah ada" };
      }
  
      const subject = await prisma.subject.update({
        where: { id },
        data: { name },
      });
  
      revalidatePath("/admin/subjects");
      return { success: true, subject };
    } catch (error: any) {
      console.error("Error updating subject:", error);
      return { success: false, error: "Gagal memperbarui mata pelajaran" };
    }
  }
