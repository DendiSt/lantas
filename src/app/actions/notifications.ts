"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function checkNewAdminRequests(lastChecked: Date) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;

  try {
    // Cari request yang dibuat SETELAH lastChecked
    const newRequests = await prisma.request.findMany({
      where: {
        createdAt: {
          gt: lastChecked,
        },
      },
      include: {
        student: {
          select: { name: true, class: { select: { name: true } } },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: newRequests,
    };
  } catch (error) {
    console.error("Error checking new requests:", error);
    return { success: false, error: "Failed to check notifications" };
  }
}

export async function checkStudentRequestUpdates(lastChecked: Date) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") return null;

  try {
    // Cari request milik siswa ini yang statusnya BUKAN PENDING, 
    // dan di-update (diproses) SETELAH lastChecked
    const updatedRequests = await prisma.request.findMany({
      where: {
        studentId: session.userId,
        status: {
          not: "PENDING",
        },
        updatedAt: {
          gt: lastChecked,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return {
      success: true,
      data: updatedRequests,
    };
  } catch (error) {
    console.error("Error checking student updates:", error);
    return { success: false, error: "Failed to check notifications" };
  }
}
