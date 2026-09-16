"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AttendanceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function submitAttendance(dateStr: string, records: { studentId: string, status: AttendanceStatus }[]) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    throw new Error("Unauthorized");
  }

  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  // We use a transaction to upsert all records
  await prisma.$transaction(
    records.map(record => {
      return prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: record.studentId,
            date: date
          }
        },
        update: {
          status: record.status,
          teacherId: session.userId
        },
        create: {
          studentId: record.studentId,
          date: date,
          status: record.status,
          teacherId: session.userId
        }
      });
    })
  );

  revalidatePath("/teacher/attendance");
  revalidatePath("/admin/attendances");
  
  return { success: true };
}
