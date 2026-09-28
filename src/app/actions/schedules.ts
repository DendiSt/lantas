"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import * as xlsx from "xlsx";

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

export async function importSchedulesFromExcel(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "Pilih file Excel terlebih dahulu" };

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet) as any[];

    if (!data || data.length === 0) {
      return { success: false, error: "File kosong atau tidak ada baris data" };
    }

    const allClasses = await prisma.class.findMany();
    const allSubjects = await prisma.subject.findMany();
    const allTeachers = await prisma.user.findMany({ where: { role: "TEACHER" } });

    let importedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Helper to get time blocks
    const getTimeBlock = (day: number, jam: number) => {
      if (day === 5) { // Jumat
        if (jam === 1) return { startTime: "07:30", endTime: "09:30" };
        if (jam === 2) return { startTime: "09:30", endTime: "11:30" };
        return { startTime: "13:00", endTime: "15:00" };
      } else { // Senin-Kamis & Sabtu
        if (jam === 1) return { startTime: "07:30", endTime: "10:00" };
        if (jam === 2) return { startTime: "10:00", endTime: "12:00" };
        return { startTime: "13:00", endTime: "15:00" };
      }
    };

    const dayMap: Record<string, number> = {
      "senin": 1, "selasa": 2, "rabu": 3, "kamis": 4, "jumat": 5, "sabtu": 6
    };

    let currentDay = 1;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const hariStr = row["Hari"] ? String(row["Hari"]).trim().toLowerCase() : "";
      if (hariStr && dayMap[hariStr]) {
        currentDay = dayMap[hariStr];
      }

      const jamStr = row["Jam"] ? Number(row["Jam"]) : null;
      if (!jamStr) continue; // skip invalid row

      const timeBlock = getTimeBlock(currentDay, jamStr);

      // Iterate through all keys (classes)
      for (const key of Object.keys(row)) {
        if (key === "Hari" || key === "Jam") continue;

        const cellValue = row[key];
        if (!cellValue || String(cellValue).trim() === "") continue;

        // Class Name from Header
        const className = key.trim();
        const targetClass = allClasses.find(c => c.name.toLowerCase() === className.toLowerCase());
        if (!targetClass) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Kelas '${className}' tidak ditemukan di sistem`);
          continue;
        }

        // Parse "Mapel (Guru)"
        const cellStr = String(cellValue).trim();
        const match = cellStr.match(/^(.*?)\((.*?)\)$/);
        
        let subjectName = cellStr;
        let teacherKeyword = "";
        
        if (match) {
          subjectName = match[1].trim();
          teacherKeyword = match[2].trim();
        }

        const targetSubject = allSubjects.find(s => s.name.toLowerCase().includes(subjectName.toLowerCase()) || subjectName.toLowerCase().includes(s.name.toLowerCase()));
        if (!targetSubject) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Mata Pelajaran '${subjectName}' tidak ditemukan`);
          continue;
        }

        let targetTeacher = null;
        if (teacherKeyword) {
          targetTeacher = allTeachers.find(t => t.name.toLowerCase().includes(teacherKeyword.toLowerCase()));
        } else {
          // If no keyword provided, just pick the first teacher assigned to this subject (fallback)
          // We don't have subject-teacher mapping fetched here, so we just pick the first teacher generally or fail
          targetTeacher = allTeachers[0];
        }

        if (!targetTeacher) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Guru pengajar dengan kata kunci '${teacherKeyword}' tidak ditemukan`);
          continue;
        }

        try {
          await prisma.schedule.upsert({
            where: {
              classId_dayOfWeek_startTime: {
                classId: targetClass.id,
                dayOfWeek: currentDay,
                startTime: timeBlock.startTime
              }
            },
            update: {
              subjectId: targetSubject.id,
              teacherId: targetTeacher.id,
              endTime: timeBlock.endTime
            },
            create: {
              classId: targetClass.id,
              subjectId: targetSubject.id,
              teacherId: targetTeacher.id,
              dayOfWeek: currentDay,
              startTime: timeBlock.startTime,
              endTime: timeBlock.endTime
            }
          });
          importedCount++;
        } catch (err) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Gagal menyimpan jadwal ${subjectName} untuk ${className}`);
        }
      }
    }

    revalidatePath("/admin/schedules");
    revalidatePath("/dashboard");
    
    return { 
      success: true, 
      imported: importedCount, 
      failed: failedCount, 
      errors 
    };

  } catch (error: any) {
    console.error("Error importing schedules:", error);
    return { success: false, error: "Terjadi kesalahan saat memproses file Excel" };
  }
}

