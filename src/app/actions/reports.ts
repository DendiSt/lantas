"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { RequestType, RequestStatus } from "@prisma/client";

export async function getDashboardStats() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;

  const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
  
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const todayRequests = await prisma.request.count({
    where: {
      createdAt: {
        gte: startOfDay,
      }
    }
  });

  const pendingRequests = await prisma.request.count({
    where: { status: "PENDING" }
  });

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentRequests = await prisma.request.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
      status: "APPROVED"
    },
    select: { createdAt: true },
  });

  // Get distinct dates for Alpha from attendances
  const recentAttendancesRaw = await prisma.attendance.findMany({
    where: {
      date: { gte: sevenDaysAgo },
      status: "ALPHA"
    },
    select: { date: true, studentId: true }
  });

  // Unique (date + studentId)
  const uniqueAlphas = new Set<string>();
  recentAttendancesRaw.forEach(att => {
    uniqueAlphas.add(`${att.studentId}_${att.date.toISOString().split('T')[0]}`);
  });

  const trendDataMap: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
    trendDataMap[dateStr] = 0;
  }

  recentRequests.forEach((req) => {
    const dateStr = new Date(req.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
    if (trendDataMap[dateStr] !== undefined) {
      trendDataMap[dateStr]++;
    }
  });

  uniqueAlphas.forEach((str) => {
    const date = new Date(str.split('_')[1]);
    const dateStr = date.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
    if (trendDataMap[dateStr] !== undefined) {
      trendDataMap[dateStr]++;
    }
  });

  const trendData = Object.keys(trendDataMap).map(key => ({
    date: key,
    total: trendDataMap[key]
  }));

  const allRequests = await prisma.request.findMany({
    where: { status: "APPROVED" },
    select: { type: true }
  });

  // All time alphas
  const allAlphasRaw = await prisma.attendance.findMany({
    where: { status: "ALPHA" },
    select: { date: true, studentId: true }
  });
  const allUniqueAlphas = new Set<string>();
  allAlphasRaw.forEach(att => {
    allUniqueAlphas.add(`${att.studentId}_${att.date.toISOString().split('T')[0]}`);
  });

  const typeCount: Record<string, number> = {};
  allRequests.forEach(r => {
    let label: string = r.type;
    if (label === "SAKIT") label = "Sakit";
    else if (label === "IZIN_PULANG") label = "Pulang";
    else if (label === "TANPA_KETERANGAN") label = "Alpha";
    else label = label.replace("IZIN_", "").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    
    typeCount[label] = (typeCount[label] || 0) + 1;
  });

  if (allUniqueAlphas.size > 0) {
    typeCount["Alpha"] = (typeCount["Alpha"] || 0) + allUniqueAlphas.size;
  }

  const distributionData = Object.keys(typeCount).map(key => ({
    name: key,
    value: typeCount[key]
  }));

  return {
    totalStudents,
    todayRequests,
    pendingRequests,
    trendData,
    distributionData
  };
}

export async function getReportData() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      class: true,
      requests: {
        include: {
          reviewer: { select: { name: true } },
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

  const allAbsences: any[] = [];

  const studentsData = students.map(student => {
    const approvedRequests = student.requests.filter(r => r.status === "APPROVED");
    
    const requestCoverage: Record<string, { start: string, end: string }[]> = {};
    approvedRequests.forEach(r => {
      const dStr = new Date(r.createdAt).toISOString().split('T')[0];
      if (!requestCoverage[dStr]) requestCoverage[dStr] = [];
      const start = r.startTime || "00:00";
      const end = r.endTime === "Pulang" ? "23:59" : (r.endTime || "23:59");
      requestCoverage[dStr].push({ start, end });
    });

    // Group attendances by Date string
    const attByDate: Record<string, typeof student.attendances> = {};
    student.attendances.forEach(att => {
      const dStr = new Date(att.date).toISOString().split('T')[0];
      
      // Skip if this attendance period is covered by an approved request
      const isCovered = requestCoverage[dStr]?.some(
        range => att.startTime >= range.start && att.endTime <= range.end
      );
      if (isCovered) return;
      
      if (!attByDate[dStr]) attByDate[dStr] = [];
      attByDate[dStr].push(att);
    });

    const mappedAttendances: any[] = [];
    
    // For each date, analyze the uncovered periods
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
          reqType = RequestType.IZIN_KEGIATAN; // Fallback map
        }

        const details = absRecords.map(r => `${r.status} di waktu ${r.startTime}-${r.endTime} (${r.subject?.name || 'Unknown'})`).join(', ');

        mappedAttendances.push({
          id: `att_${student.id}_${dStr}`,
          type: reqType,
          reason: `${finalStatus} (Input Guru): ${details}`,
          status: RequestStatus.APPROVED,
          rejectionNote: null,
          attachmentUrl: null,
          createdAt: new Date(dStr),
          reviewer: absRecords[0]?.teacher
        });
      }
    });

    const fullHistory = [...student.requests, ...mappedAttendances].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Group fullHistory by date to get 1 absence per day for the report
    const historyByDate: Record<string, any[]> = {};
    fullHistory.forEach(item => {
      const dStr = new Date(item.createdAt).toISOString().split('T')[0];
      if (!historyByDate[dStr]) historyByDate[dStr] = [];
      historyByDate[dStr].push(item);
    });

    const collapsedAbsences = Object.keys(historyByDate).map(dStr => {
      const dayItems = historyByDate[dStr];
      // If there's an APPROVED Request, pick it as the representative absence for the day.
      const requestItem = dayItems.find(i => i.status === "APPROVED" && i.id && !i.id.startsWith("att_"));
      if (requestItem) return requestItem;
      // Otherwise fallback to the mapped manual attendance
      return dayItems.find(i => i.status === "APPROVED") || dayItems[0];
    }).filter(item => item.status === "APPROVED");

    const absences = collapsedAbsences.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    allAbsences.push(...absences);

    return {
      id: student.id,
      name: student.name,
      nisn: student.nisn || "-",
      classId: student.class?.name || null,
      totalAbsences: absences.length,
      requests: absences,
      fullHistory: fullHistory
    };
  }).sort((a, b) => b.totalAbsences - a.totalAbsences);

  const typeCount: Record<string, number> = {};
  allAbsences.forEach(r => {
    let label: string = r.type;
    if (label === "SAKIT") label = "Sakit";
    else if (label === "IZIN_PULANG") label = "Izin Pulang";
    else if (label === "TANPA_KETERANGAN") label = "Alpha";
    else label = label.replace("IZIN_", "").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    
    typeCount[label] = (typeCount[label] || 0) + 1;
  });

  const overviewData = Object.keys(typeCount).map(key => ({
    name: key,
    value: typeCount[key]
  }));

  return {
    overviewData,
    studentsData,
  };
}
