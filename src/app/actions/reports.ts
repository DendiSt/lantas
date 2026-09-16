"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

  const trendData = Object.keys(trendDataMap).map(key => ({
    date: key,
    total: trendDataMap[key]
  }));

  // Distribusi Izin
  const allRequests = await prisma.request.findMany({
    select: { type: true }
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
      }
    }
  });

  const allRequests = students.flatMap(s => s.requests);

  // 1. Ketidakhadiran Keseluruhan Berdasarkan Tipe
  const typeCount: Record<string, number> = {};
  allRequests.forEach(r => {
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

  // Format the student data for the table
  const studentsData = students.map(student => ({
    id: student.id,
    name: student.name,
    classId: student.class?.name || null,
    totalAbsences: student.requests.length,
    requests: student.requests
  })).sort((a, b) => b.totalAbsences - a.totalAbsences);

  return {
    overviewData,
    studentsData,
  };
}
