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

  // Validasi server-side: pastikan lampiran adalah gambar atau URL valid
  if (attachmentUrl && attachmentUrl.startsWith("data:") && !attachmentUrl.startsWith("data:image/")) {
    return { success: false, error: "Lampiran harus berupa file gambar (JPG, PNG, dll)." };
  }

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

    let createdAtValue = new Date();

    if (requestDate) {
      const selectedDate = new Date(requestDate);
      createdAtValue = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), createdAtValue.getHours(), createdAtValue.getMinutes(), createdAtValue.getSeconds());
    }

    // BATASAN: 1 PENGAJUAN PER HARI (Berdasarkan tanggal izin yang dipilih)
    const targetStart = new Date(createdAtValue);
    targetStart.setHours(0, 0, 0, 0);
    const targetEnd = new Date(createdAtValue);
    targetEnd.setHours(23, 59, 59, 999);

    const existingRequest = await prisma.request.findFirst({
      where: {
        studentId,
        createdAt: {
          gte: targetStart,
          lte: targetEnd,
        },
      },
    });

    if (existingRequest) {
      return {
        success: false,
        error: "Anda sudah mengajukan izin untuk tanggal tersebut. Silakan edit atau batalkan pengajuan Anda yang masih pending.",
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
        createdAt: createdAtValue,
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

    const updated = await prisma.request.update({
      where: { id: requestId },
      data: { 
        status: newStatus,
        rejectionNote: newStatus === "REJECTED" ? rejectionNote : null,
        reviewerId: newStatus !== "PENDING" ? session.userId : null,
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

export async function batchUpdateRequestStatus(
  requestIds: string[],
  newStatus: RequestStatus
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Akses ditolak" };
    }

    if (!requestIds || requestIds.length === 0) {
      return { success: false, error: "Tidak ada pengajuan yang dipilih" };
    }

    const requests = await prisma.request.findMany({
      where: { id: { in: requestIds } },
    });

    if (requests.length === 0) {
      return { success: false, error: "Pengajuan tidak ditemukan" };
    }

    await prisma.request.updateMany({
      where: { id: { in: requestIds } },
      data: {
        status: newStatus,
        rejectionNote: null,
        reviewerId: session.userId,
      },
    });

    if (newStatus === "APPROVED") {
      for (const req of requests) {
        const attendanceDate = new Date(req.createdAt);
        attendanceDate.setHours(0, 0, 0, 0);
        const attendanceStatus = req.type === "SAKIT" ? "SAKIT" : "IZIN";

        const allAttendances = await prisma.attendance.findMany({
          where: {
            studentId: req.studentId,
            date: attendanceDate,
          },
        });

        const rStart = req.startTime || "00:00";
        const rEnd = req.endTime === "Pulang" ? "23:59" : (req.endTime || "23:59");

        const overlappingIds = allAttendances
          .filter((att) => {
            const tStart = att.startTime || "00:00";
            const tEnd = att.endTime === "Pulang" ? "23:59" : (att.endTime || "23:59");

            return tStart < rEnd && tEnd > rStart;
          })
          .map((att) => att.id);

        if (overlappingIds.length > 0) {
          await prisma.attendance.updateMany({
            where: { id: { in: overlappingIds } },
            data: {
              status: attendanceStatus,
            },
          });
        }
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/requests");

    return { success: true, count: requests.length };
  } catch (error) {
    console.error("Gagal memperbarui status pengajuan massal:", error);

    return { success: false, error: "Gagal memperbarui status pengajuan massal." };
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


/**
 * Mengambil data pengajuan izin untuk keperluan unduh Excel
 */
export async function getRequestExportData(params?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
}) {
  try {
    const session = await getSession();

    if (!session || (session.role !== "ADMIN" && session.role !== "TEACHER")) {
      return { success: false, error: "Akses ditolak" };
    }

    const where: any = {};

    if (params?.status && params.status !== "ALL") {
      where.status = params.status;
    }

    if (params?.type && params.type !== "ALL") {
      where.type = params.type;
    }

    if (params?.startDate || params?.endDate) {
      where.createdAt = {};

      if (params.startDate) {
        where.createdAt.gte = new Date(params.startDate + "T00:00:00");
      }

      if (params.endDate) {
        where.createdAt.lte = new Date(params.endDate + "T23:59:59.999");
      }
    }

    const requests = await prisma.request.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            nisn: true,
            class: { select: { name: true } },
          },
        },
        reviewer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const data = requests.map((req, idx) => {
      const d = new Date(req.createdAt);

      const dateStr = d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const timeStr = d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      let typeLabel = req.type as string;

      switch (req.type) {
        case "SAKIT":
          typeLabel = "Sakit";
          break;
        case "IZIN_PULANG":
          typeLabel = "Pulang Awal";
          break;
        case "IZIN_KELUARGA":
          typeLabel = "Acara Keluarga";
          break;
        case "IZIN_KEGIATAN":
          typeLabel = "Kegiatan Luar";
          break;
        case "DISPENSASI":
          typeLabel = "Dispensasi";
          break;
        case "TANPA_KETERANGAN":
          typeLabel = "Alpha";
          break;
        default:
          typeLabel = req.type.replace("IZIN_", "");
          break;
      }

      let statusLabel = req.status as string;

      switch (req.status) {
        case "APPROVED":
          statusLabel = "Disetujui";
          break;
        case "PENDING":
          statusLabel = "Menunggu";
          break;
        case "REJECTED":
          statusLabel = "Ditolak";
          break;
      }

      return {
        no: idx + 1,
        nisn: req.student.nisn || "-",
        name: req.student.name,
        className: req.student.class?.name || "-",
        type: typeLabel,
        waktu: `${dateStr} ${timeStr}`,
        reason: req.reason,
        status: statusLabel,
        reviewer: req.reviewer?.name || (req.status === "PENDING" ? "-" : "Sistem"),
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error("Gagal mengambil data ekspor perizinan:", error);

    return { success: false, error: "Gagal mengambil data dari server" };
  }
}

