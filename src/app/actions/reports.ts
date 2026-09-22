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

  // Trend 7 Hari Terakhir
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentRequests = await prisma.request.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      createdAt: true,
    },
  });

  const recentAttendances = await prisma.attendance.findMany({
    where: {
      date: {
        gte: sevenDaysAgo,
      },
      status: "ALPHA"
    },
    select: {
      date: true,
    }
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

  recentAttendances.forEach((att) => {
    const dateStr = new Date(att.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
    if (trendDataMap[dateStr] !== undefined) {
      trendDataMap[dateStr]++;
    }
  });

  const trendData = Object.keys(trendDataMap).map(key => ({
    date: key,
    total: trendDataMap[key]
  }));

  // Distribusi Izin
  const allRequests = await prisma.request.findMany({
    select: { type: true }
  });

  const allAlphas = await prisma.attendance.count({
    where: { status: "ALPHA" }
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

  if (allAlphas > 0) {
    typeCount["Alpha"] = (typeCount["Alpha"] || 0) + allAlphas;
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
          reviewer: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" }
      },
      attendances: {
        where: { status: "ALPHA" },
        include: {
          teacher: {
            select: { name: true },
          }
        },
        orderBy: { date: "desc" }
      }
    }
  });

  const allAbsences: any[] = [];

  const studentsData = students.map(student => {
    // Format attendances to look like requests for unified UI
    const mappedAttendances = student.attendances.map(att => ({
      id: att.id,
      type: RequestType.TANPA_KETERANGAN,
      reason: "Alpha (Input Wali Kelas)",
      status: RequestStatus.APPROVED,
      rejectionNote: null,
      attachmentUrl: null,
      createdAt: att.date,
      reviewer: att.teacher
    }));

    const approvedRequests = student.requests.filter(r => r.status === "APPROVED");

    const absences = [...approvedRequests, ...mappedAttendances].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const fullHistory = [...student.requests, ...mappedAttendances].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    allAbsences.push(...absences);

    return {
      id: student.id,
      name: student.name,
      classId: student.class?.name || null,
      totalAbsences: absences.length,
      requests: absences,
      fullHistory: fullHistory
    };
  }).sort((a, b) => b.totalAbsences - a.totalAbsences);

  // 1. Ketidakhadiran Keseluruhan Berdasarkan Tipe
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
