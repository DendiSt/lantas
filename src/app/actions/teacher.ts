"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateTeacherSettings(
  data: {
    password?: string;
    subjectIds: string[];
  }
) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updateData: any = {
      subjects: {
        set: data.subjectIds.map((id) => ({ id })),
      },
    };

    if (data.password && data.password.trim() !== "") {
      updateData.password = data.password.trim();
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
    });

    revalidatePath("/teacher/settings");
    revalidatePath("/teacher");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating teacher settings:", error);
    return { success: false, error: "Gagal memperbarui pengaturan" };
  }
}
