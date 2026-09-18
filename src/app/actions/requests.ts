"use server";

import { prisma } from "@/lib/prisma";
import { RequestType, RequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

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

    const updated = await prisma.request.update({
      where: { id: requestId },
      data: { 
        status: newStatus,
        rejectionNote: newStatus === "REJECTED" ? rejectionNote : null,
        reviewerId: newStatus !== "PENDING" ? session.userId : null
      },
    });

    // Update tabel Attendance jika sudah ada (misal disetujui siang hari setelah guru absen)
    // Jika belum ada (pagi hari), biarkan Guru yang menyimpannya via Jurnal Kelas
    if (newStatus === "APPROVED") {
      const attendanceDate = new Date(updated.createdAt);
      attendanceDate.setHours(0, 0, 0, 0);

      const attendanceStatus = updated.type === "SAKIT" ? "SAKIT" : "IZIN";

      const existingAttendance = await prisma.attendance.findUnique({
        where: {
          studentId_date: {
            studentId: updated.studentId,
            date: attendanceDate,
          }
        }
      });

      if (existingAttendance) {
        await prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            status: attendanceStatus,
            teacherId: session.userId, // Admin yang menyetujui bertindak sebagai pengubah
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
