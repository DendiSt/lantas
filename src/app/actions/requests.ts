"use server";

import { prisma } from "@/lib/prisma";
import { RequestType, RequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type CreateRequestState = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function createPermissionRequest(
  _prevState: CreateRequestState | null,
  formData: FormData
): Promise<CreateRequestState> {
  const studentId = (formData.get("studentId") as string) || "student-budi";
  const type = formData.get("type") as RequestType;
  const reason = formData.get("reason") as string;
  const attachmentUrl = (formData.get("attachmentUrl") as string) || null;

  if (!type || !["SAKIT", "PULANG", "LAINNYA"].includes(type)) {
    return {
      success: false,
      error: "Silakan pilih jenis izin yang valid (Sakit, Pulang, atau Lainnya).",
    };
  }

  if (!reason || reason.trim().length < 5) {
    return {
      success: false,
      error: "Alasan izin minimal 5 karakter agar dapat diproses oleh TU.",
    };
  }

  try {
    // Pastikan student ada
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return {
        success: false,
        error: "Data siswa tidak ditemukan di sistem.",
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
  newStatus: RequestStatus
) {
  try {
    const updated = await prisma.request.update({
      where: { id: requestId },
      data: { status: newStatus },
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Gagal memperbarui status pengajuan:", error);
    return { success: false, error: "Gagal memperbarui status pengajuan." };
  }
}
