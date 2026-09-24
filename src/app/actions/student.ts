"use server";

import { prisma } from "@/lib/prisma";
import { RequestType, RequestStatus } from "@prisma/client";

export async function getStudentCombinedHistory(studentId: string) {
  const student = await prisma.user.findUnique({
    where: { id: studentId, role: "STUDENT" },
    include: {
      requests: {
        include: {
          reviewer: { select: { name: true } },
          security: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" }
      },
      attendances: {
        include: {
          teacher: { select: { name: true } },
          subject: { select: { name: true } }
        }
      }
    }
  });

  if (!student) return [];

  const approvedRequests = student.requests.filter(r => r.status === "APPROVED");
  
  const requestCoverage: Record<string, { start: string, end: string }[]> = {};
  approvedRequests.forEach(r => {
    const dStr = new Date(r.createdAt).toISOString().split('T')[0];
    if (!requestCoverage[dStr]) requestCoverage[dStr] = [];
    const start = r.startTime || "00:00";
    const end = r.endTime === "Pulang" ? "23:59" : (r.endTime || "23:59");
    requestCoverage[dStr].push({ start, end });
  });

  const attByDate: Record<string, typeof student.attendances> = {};
  student.attendances.forEach(att => {
    const dStr = new Date(att.date).toISOString().split('T')[0];
    
    const isCovered = requestCoverage[dStr]?.some(
      range => att.startTime >= range.start && att.endTime <= range.end
    );
    if (isCovered) return;
    
    if (!attByDate[dStr]) attByDate[dStr] = [];
    attByDate[dStr].push(att);
  });

  const mappedAttendances: any[] = [];
  
  Object.keys(attByDate).forEach(dStr => {
    const records = attByDate[dStr];
    const absRecords = records.filter(r => r.status !== "HADIR");
    
    if (absRecords.length > 0) {
      let finalStatus = "ALPHA";
      let reqType: RequestType = RequestType.TANPA_KETERANGAN;
      
      if (absRecords.some(r => r.status === "SAKIT")) {
        finalStatus = "SAKIT";
        reqType = RequestType.SAKIT;
      } else if (absRecords.some(r => r.status === "IZIN")) {
        finalStatus = "IZIN";
        reqType = RequestType.IZIN_KEGIATAN; 
      }

      const details = absRecords.map(r => `${r.status} di waktu ${r.startTime}-${r.endTime} (${r.subject?.name || 'Unknown'})`).join(', ');

      mappedAttendances.push({
        id: `att_${studentId}_${dStr}`,
        type: reqType,
        reason: `${finalStatus} (Input Wali/Guru): ${details}`,
        status: RequestStatus.APPROVED,
        rejectionNote: null,
        attachmentUrl: null,
        createdAt: new Date(dStr),
        reviewer: absRecords[0]?.teacher,
        security: null
      });
    }
  });

  const fullHistory = [...student.requests, ...mappedAttendances].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return fullHistory;
}
