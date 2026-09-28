"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSchedule(data: {
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Cek apakah jadwal sudah ada di kelas dan jam yang sama
    const existing = await prisma.schedule.findUnique({
      where: {
        classId_dayOfWeek_startTime: {
          classId: data.classId,
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime
        }
      }
    });

    if (existing) {
      return { success: false, error: "Sudah ada jadwal di kelas dan jam tersebut" };
    }

    const schedule = await prisma.schedule.create({
      data: {
        classId: data.classId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime
      }
    });

    revalidatePath("/dashboard/admin/schedules");
    return { success: true, schedule };
  } catch (error: any) {
    console.error("Error creating schedule:", error);
    return { success: false, error: "Gagal membuat jadwal" };
  }
}

export async function updateSchedule(id: string, data: {
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Cek konflik jika merubah waktu/hari/kelas
    const existing = await prisma.schedule.findUnique({
      where: {
        classId_dayOfWeek_startTime: {
          classId: data.classId,
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime
        }
      }
    });

    if (existing && existing.id !== id) {
      return { success: false, error: "Sudah ada jadwal di kelas dan jam tersebut" };
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        classId: data.classId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime
      }
    });

    revalidatePath("/dashboard/admin/schedules");
    return { success: true, schedule };
  } catch (error: any) {
    console.error("Error updating schedule:", error);
    return { success: false, error: "Gagal mengupdate jadwal" };
  }
}

export async function deleteSchedule(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.schedule.delete({
      where: { id }
    });
    revalidatePath("/dashboard/admin/schedules");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting schedule:", error);
    return { success: false, error: "Gagal menghapus jadwal" };
  }
}
