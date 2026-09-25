"use server";

import { prisma } from "@/lib/prisma";
import { RequestType, RequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";

export type CreateRequestState = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function createPermissionRequest(
  _prevState: CreateRequestState | null,
  formData: FormData
): Promise<CreateRequestState> {
  let studentId = (formData.get("studentId") as string) || "student-zibril";
  const type = formData.get("type") as RequestType;
  const reason = formData.get("reason") as string;
  const attachmentUrl = (formData.get("attachmentUrl") as string) || null;

  if (!type || !["SAKIT", "IZIN_PULANG", "IZIN_KELUARGA", "IZIN_KEGIATAN", "DISPENSASI"].includes(type)) {
    return {
      success: false,
      error: "Silakan pilih jenis izin yang valid.",
    };
  }

  if (!reason || reason.trim().length < 5) {
    return {
      success: false,
      error: "Alasan izin minimal 5 karakter agar dapat diproses oleh TU.",
    };
  }

  const requestDate = formData.get("requestDate") as string;
  if (requestDate) {
    const today = new Date();
    // Set jam ke 00:00:00 untuk perbandingan tanggal saja
    today.setHours(0, 0, 0, 0);
    
    const selectedDate = new Date(requestDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return {
        success: false,
        error: "Tanggal pengajuan tidak boleh sebelum hari ini.",
      };
    }
  }

  const durationType = formData.get("durationType") as string;
  let startTime: string | null = null;
  let endTime: string | null = null;

  if (durationType === "SPECIFIC_PERIODS") {
    startTime = formData.get("startTime") as string || null;
    endTime = formData.get("endTime") as string || null;
  }

  try {
    // Pastikan student ada
    let student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    // Fallback jika ID berbeda (misal ID siswa utama diubah di Prisma Studio)
    if (!student) {
      student = await prisma.user.findFirst({
        where: { role: "STUDENT" },
      });
      if (student) {
        studentId = student.id;
      } else {
        return {
          success: false,
          error: "Data siswa tidak ditemukan di sistem.",
        };
      }
    }

    // BATASAN: 1 PENGAJUAN PER HARI
    // (Bisa juga diperbarui jika izin beda jam, tapi sementara kita biarkan 1 izin per hari)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existingRequest = await prisma.request.findFirst({
      where: {
        studentId,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    if (existingRequest) {
      return {
        success: false,
        error: "Anda sudah mengajukan izin hari ini. Silakan edit atau batalkan pengajuan Anda yang masih pending.",
      };
    }

    await prisma.request.create({
      data: {
        studentId,
        type,
        reason: reason.trim(),
        attachmentUrl: attachmentUrl && attachmentUrl.trim() ? attachmentUrl.trim() : null,
        status: RequestStatus.PENDING,
        startTime,
        endTime,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Pengajuan izin berhasil dikirim ke ruang Tata Usaha (TU).",
    };
  } catch (error) {
    console.error("Gagal membuat pengajuan izin:", error);
    return {
      success: false,
      error: "Terjadi kesalahan sistem saat menyimpan pengajuan izin.",
    };
  }
}

export async function updateRequestStatus(
  requestId: string,
  newStatus: RequestStatus,
  rejectionNote?: string
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Akses ditolak" };
    }

    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) {
      return { success: false, error: "Pengajuan tidak ditemukan" };
    }

    let qrToken: string | null = null;
    let qrExpiresAt: Date | null = null;

    if (newStatus === "APPROVED") {
      const isFullDay = !request.startTime || request.startTime === "";
      const createdAtDate = new Date(request.createdAt);
      
      if (request.type === "SAKIT") {
        if (!isFullDay) {
          qrToken = randomUUID();
          qrExpiresAt = new Date();
          qrExpiresAt.setHours(qrExpiresAt.getHours() + 2); // 2 hours from approval
        }
      } else if (request.type === "IZIN_PULANG") {
          qrToken = randomUUID();
          qrExpiresAt = new Date(createdAtDate);
          qrExpiresAt.setHours(17, 0, 0, 0); // 17:00
      } else if (request.type === "DISPENSASI" || request.type === "IZIN_KEGIATAN") {
          qrToken = randomUUID();
          if (isFullDay) {
            qrExpiresAt = new Date(createdAtDate);
            qrExpiresAt.setHours(9, 0, 0, 0); // 09:00
          } else {
            qrExpiresAt = new Date(createdAtDate);
            qrExpiresAt.setHours(17, 0, 0, 0); // 17:00
          }
      }
    }

    const updated = await prisma.request.update({
      where: { id: requestId },
      data: { 
        status: newStatus,
        rejectionNote: newStatus === "REJECTED" ? rejectionNote : null,
        reviewerId: newStatus !== "PENDING" ? session.userId : null,
        qrToken,
        qrExpiresAt
      },
    });

    // Update tabel Attendance jika sudah ada (misal disetujui siang hari setelah guru absen)
    // Jika belum ada (pagi hari), biarkan Guru yang menyimpannya via Jurnal Kelas
    if (newStatus === "APPROVED") {
      const attendanceDate = new Date(updated.createdAt);
      attendanceDate.setHours(0, 0, 0, 0);

      const attendanceStatus = updated.type === "SAKIT" ? "SAKIT" : "IZIN";

      // Update overlapping attendances for that date if they exist
      const allAttendances = await prisma.attendance.findMany({
        where: {
          studentId: updated.studentId,
          date: attendanceDate
        }
      });
      
      const rStart = updated.startTime || "00:00";
      const rEnd = updated.endTime === "Pulang" ? "23:59" : (updated.endTime || "23:59");
      
      const overlappingIds = allAttendances.filter(att => {
        const tStart = att.startTime || "00:00";
        const tEnd = att.endTime === "Pulang" ? "23:59" : (att.endTime || "23:59");
        return tStart < rEnd && tEnd > rStart;
      }).map(att => att.id);

      if (overlappingIds.length > 0) {
        await prisma.attendance.updateMany({
          where: { id: { in: overlappingIds } },
          data: {
            status: attendanceStatus,
          }
        });
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Gagal memperbarui status pengajuan:", error);
    return { success: false, error: "Gagal memperbarui status pengajuan." };
  }
}

export async function deletePermissionRequest(requestId: string): Promise<CreateRequestState> {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return { success: false, error: "Akses ditolak. Hanya siswa yang dapat menghapus pengajuan." };
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request || request.studentId !== session.userId) {
      return { success: false, error: "Pengajuan tidak ditemukan atau bukan milik Anda." };
    }

    if (request.status !== "PENDING") {
      return { success: false, error: "Pengajuan sudah diproses dan tidak dapat dihapus." };
    }

    await prisma.request.delete({
      where: { id: requestId },
    });

    revalidatePath("/dashboard");
    
    return { success: true, message: "Pengajuan izin berhasil dibatalkan." };
  } catch (error) {
    console.error("Gagal membatalkan pengajuan:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat membatalkan pengajuan." };
  }
}

export async function updatePermissionRequest(
  requestId: string,
  formData: FormData
): Promise<CreateRequestState> {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return { success: false, error: "Akses ditolak." };
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request || request.studentId !== session.userId) {
      return { success: false, error: "Pengajuan tidak ditemukan atau bukan milik Anda." };
    }

    if (request.status !== "PENDING") {
      return { success: false, error: "Pengajuan sudah diproses dan tidak dapat diedit." };
    }

    const type = formData.get("type") as RequestType;
    const reason = formData.get("reason") as string;
    const attachmentUrl = (formData.get("attachmentUrl") as string) || null;
    
    const durationType = formData.get("durationType") as string;
    let startTime: string | null = null;
    let endTime: string | null = null;

    if (durationType === "SPECIFIC_PERIODS") {
      startTime = formData.get("startTime") as string || null;
      endTime = formData.get("endTime") as string || null;
    }

    if (!type || !["SAKIT", "IZIN_PULANG", "IZIN_KELUARGA", "IZIN_KEGIATAN", "DISPENSASI"].includes(type)) {
      return { success: false, error: "Silakan pilih jenis izin yang valid." };
    }

    if (!reason || reason.trim().length < 5) {
      return { success: false, error: "Alasan izin minimal 5 karakter." };
    }

    // Jika tidak ada foto baru, gunakan foto lama.
    // Tetapi jika form mengirimkan 'attachmentUrl' = '' (string kosong), artinya foto dihapus, 
    // kecuali logic di form kita tidak mengirimkan string kosong.
    // Di form kita akan selalu mengirim `attachmentUrl` baik itu yang baru, lama, atau null.
    let finalAttachmentUrl = request.attachmentUrl;
    if (attachmentUrl !== null) {
      finalAttachmentUrl = attachmentUrl.trim() ? attachmentUrl.trim() : null;
    }

    await prisma.request.update({
      where: { id: requestId },
      data: {
        type,
        reason: reason.trim(),
        attachmentUrl: finalAttachmentUrl,
        startTime,
        endTime,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return { success: true, message: "Pengajuan izin berhasil diperbarui." };
  } catch (error) {
    console.error("Gagal memperbarui pengajuan:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat memperbarui pengajuan." };
  }
}

// ==========================================
// SECURITY / QR SCAN ACTIONS
// ==========================================

export async function getScanDetails(token: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SECURITY") {
      return { success: false, error: "Akses ditolak" };
    }

    const request = await prisma.request.findUnique({
      where: { qrToken: token },
      include: {
        student: {
          include: { class: true }
        }
      }
    });

    if (!request) {
      return { success: false, error: "QR Code tidak valid atau sudah tidak berlaku." };
    }

    if (request.scannedAt) {
      return { success: false, error: "QR Code ini sudah pernah digunakan sebelumnya." };
    }

    if (request.qrExpiresAt && new Date() > new Date(request.qrExpiresAt)) {
      return { success: false, error: "QR Code sudah kedaluwarsa sesuai waktu yang ditentukan sistem." };
    }

    return { success: true, data: request };
  } catch (error) {
    console.error("Gagal mengambil detail QR:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}

export async function confirmStudentExit(token: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SECURITY") {
      return { success: false, error: "Akses ditolak" };
    }

    const request = await prisma.request.findUnique({
      where: { qrToken: token }
    });

    if (!request) return { success: false, error: "QR Code tidak valid." };
    if (request.scannedAt) return { success: false, error: "QR Code sudah digunakan." };

    await prisma.request.update({
      where: { qrToken: token },
      data: {
        scannedAt: new Date(),
        securityId: session.userId,
        departureStatus: "FROM_SCHOOL",
      }
    });

    revalidatePath("/security");
    revalidatePath("/admin/requests");

    return { success: true, message: "Berhasil mengonfirmasi siswa keluar gerbang." };
  } catch (error) {
    console.error("Gagal mengonfirmasi QR:", error);
    return { success: false, error: "Gagal memproses konfirmasi." };
  }
}

export async function getSecurityScanHistory() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SECURITY") {
      return { success: false, error: "Akses ditolak" };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const history = await prisma.request.findMany({
      where: {
        securityId: session.userId,
        scannedAt: {
          not: null,
          gte: thirtyDaysAgo,
        },
      },
      include: {
        student: {
          include: { class: true }
        }
      },
      orderBy: {
        scannedAt: "desc"
      }
    });

    return { success: true, data: history };
  } catch (error) {
    console.error("Gagal mengambil riwayat scan:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}

export async function getSecurityWaitlist() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SECURITY") {
      return { success: false, error: "Akses ditolak" };
    }

    const now = new Date();
    const waitlist = await prisma.request.findMany({
      where: {
        qrToken: { not: null },
        scannedAt: null,
        departureStatus: "PENDING",
        qrExpiresAt: { gt: now },
      },
      include: {
        student: {
          include: { class: true }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return { success: true, data: waitlist };
  } catch (error) {
    console.error("Gagal mengambil waitlist:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}

export async function resolveExpiredQRRequests() {
  try {
    const now = new Date();

    // Temukan semua request yang kedaluwarsa QR-nya, belum di-scan, dan departureStatus PENDING
    const expiredRequests = await prisma.request.findMany({
      where: {
        qrToken: { not: null },
        scannedAt: null,
        qrExpiresAt: { lte: now },
        departureStatus: "PENDING"
      }
    });

    if (expiredRequests.length === 0) return { success: true, resolved: 0 };

    // Pisahkan berdasarkan jenis fallback
    const fromHomeIds: string[] = [];
    const fromSchoolIds: string[] = [];

    expiredRequests.forEach(req => {
      const isFullDay = !req.startTime || req.startTime === "";
      
      // Izin Seharian Lomba/Dispensasi -> FROM_HOME
      if (isFullDay && (req.type === "DISPENSASI" || req.type === "IZIN_KEGIATAN")) {
        fromHomeIds.push(req.id);
      } else {
        // Sisanya (Izin Pulang, Sakit Parsial, Dispensasi Parsial, dll) -> FROM_SCHOOL
        fromSchoolIds.push(req.id);
      }
    });

    // Lakukan bulk update
    if (fromHomeIds.length > 0) {
      await prisma.request.updateMany({
        where: { id: { in: fromHomeIds } },
        data: { departureStatus: "FROM_HOME" }
      });
    }

    if (fromSchoolIds.length > 0) {
      await prisma.request.updateMany({
        where: { id: { in: fromSchoolIds } },
        data: { departureStatus: "FROM_SCHOOL" }
      });
    }

    return { success: true, resolved: expiredRequests.length };
  } catch (error) {
    console.error("Gagal meresolve status QR kedaluwarsa:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}
