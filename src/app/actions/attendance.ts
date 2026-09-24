"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAttendanceForPeriod(classId: string, date: Date, period: number) {
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

    // 1. Get LANTAS Requests (Sakit, Izin Pulang, dll) for this date
    // These should override any manual teacher entry (or lock it)
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
    requests.forEach(req => {
      const start = req.startPeriod ?? 1;
      const end = req.endPeriod ?? 15;
      if (period >= start && period <= end) {
        if (req.type === "SAKIT") lockedStudents[req.studentId] = "SAKIT";
        else lockedStudents[req.studentId] = "IZIN";
      }
    });

    // 2. Get explicitly saved attendance for THIS period
    const currentPeriodAttendances = await prisma.attendance.findMany({
      where: {
        studentId: { in: studentIds },
        date: date,
        period: period,
      }
    });

    const attendanceMap: Record<string, string> = {};
    let isNewPeriod = currentPeriodAttendances.length === 0;

    if (!isNewPeriod) {
      currentPeriodAttendances.forEach(att => {
        attendanceMap[att.studentId] = att.status;
      });
    } else if (period > 1) {
      // 3. Cascading Logic: If no data for current period, pull from previous period
      const prevPeriodAttendances = await prisma.attendance.findMany({
        where: {
          studentId: { in: studentIds },
          date: date,
          period: period - 1,
        }
      });
      prevPeriodAttendances.forEach(att => {
        attendanceMap[att.studentId] = att.status;
      });
    }

    // 4. Apply locks (LANTAS requests always win)
    Object.keys(lockedStudents).forEach(studentId => {
      attendanceMap[studentId] = lockedStudents[studentId];
    });

    return { 
      success: true, 
      attendanceMap, 
      lockedStudents: Object.keys(lockedStudents),
      subjectId: currentPeriodAttendances[0]?.subjectId || ""
    };

  } catch (error: any) {
    console.error("Error fetching attendance:", error);
    return { success: false, error: "Gagal memuat absensi" };
  }
}

export async function submitAttendanceForPeriod(
  classId: string, 
  date: Date, 
  period: number, 
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

    // We will do upsert for each student for this specific date and period
    for (const student of students) {
      const status = attendanceMap[student.id];
      if (!status) continue;

      await prisma.attendance.upsert({
        where: {
          studentId_date_period: {
            studentId: student.id,
            date: date,
            period: period
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
          period: period,
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
