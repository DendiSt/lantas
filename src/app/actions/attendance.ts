"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAttendanceForTimeRange(classId: string, date: Date, startTime: string, endTime: string) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const students = await prisma.user.findMany({
      where: { classId, role: "STUDENT" },
      select: { id: true },
    });
    const studentIds = students.map(s => s.id);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const requests = await prisma.request.findMany({
      where: {
        studentId: { in: studentIds },
        status: "APPROVED",
        createdAt: { gte: date, lt: nextDay }
      }
    });

    const lockedStudents: Record<string, string> = {};
    
    // Time overlap logic
    const tStart = startTime || "00:00";
    const tEnd = endTime === "Pulang" ? "23:59" : (endTime || "23:59");

    requests.forEach(req => {
      const rStart = req.startTime || "00:00";
      const rEnd = req.endTime === "Pulang" ? "23:59" : (req.endTime || "23:59");
      
      // Check overlap: T_start < R_end && T_end > R_start
      if (tStart < rEnd && tEnd > rStart) {
        if (req.type === "SAKIT") lockedStudents[req.studentId] = "SAKIT";
        else lockedStudents[req.studentId] = "IZIN";
      }
    });

    const currentAttendances = await prisma.attendance.findMany({
      where: {
        studentId: { in: studentIds },
        date: date,
        startTime: startTime,
        endTime: endTime,
      }
    });

    const attendanceMap: Record<string, string> = {};
    
    currentAttendances.forEach(att => {
      attendanceMap[att.studentId] = att.status;
    });

    // Apply locks
    Object.keys(lockedStudents).forEach(studentId => {
      attendanceMap[studentId] = lockedStudents[studentId];
    });

    return { 
      success: true, 
      attendanceMap, 
      lockedStudents: Object.keys(lockedStudents),
      subjectId: currentAttendances[0]?.subjectId || "",
      isSaved: currentAttendances.length > 0
    };

  } catch (error: any) {
    console.error("Error fetching attendance:", error);
    return { success: false, error: "Gagal memuat absensi" };
  }
}

export async function submitAttendanceForTimeRange(
  classId: string, 
  date: Date, 
  startTime: string, 
  endTime: string, 
  subjectId: string, 
  attendanceMap: Record<string, "HADIR" | "SAKIT" | "IZIN" | "ALPHA">
) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const students = await prisma.user.findMany({
      where: { classId, role: "STUDENT" },
      select: { id: true },
    });
    const studentIds = students.map(s => s.id);

    // Overlap validation
    const overlaps = await prisma.attendance.findFirst({
      where: {
        studentId: { in: studentIds },
        date: date,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
        NOT: {
          startTime: startTime,
          endTime: endTime
        }
      }
    });

    if (overlaps) {
      return { success: false, error: "Waktu tumpang tindih dengan jurnal absensi yang sudah ada!" };
    }

    for (const student of students) {
      const status = attendanceMap[student.id] || "HADIR";

      await prisma.attendance.upsert({
        where: {
          studentId_date_startTime_endTime: {
            studentId: student.id,
            date: date,
            startTime: startTime,
            endTime: endTime
          }
        },
        update: {
          status: status,
          subjectId: subjectId,
          teacherId: session.userId
        },
        create: {
          studentId: student.id,
          date: date,
          startTime: startTime,
          endTime: endTime,
          status: status,
          subjectId: subjectId,
          teacherId: session.userId
        }
      });
    }

    revalidatePath("/teacher/attendance");
    revalidatePath(`/teacher/attendance/${classId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error saving attendance:", error);
    return { success: false, error: "Gagal menyimpan absensi" };
  }
}
