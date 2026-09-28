"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function resetPassword(prevState: any, formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token || !password || !confirmPassword) {
    return { success: false, error: "Semua kolom harus diisi." };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Kata sandi tidak cocok." };
  }

  if (password.length < 6) {
    return { success: false, error: "Kata sandi minimal 6 karakter." };
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Pastikan expiry time masih di masa depan
        }
      }
    });

    if (!user) {
      return { success: false, error: "Tautan reset kata sandi tidak valid atau sudah kedaluwarsa." };
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        loginAttempts: 0, // Reset login attempts also to unlock the account if it was locked
        lockoutUntil: null
      }
    });

    return { success: true, message: "Kata sandi berhasil direset. Silakan login dengan kata sandi baru Anda." };

  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "Terjadi kesalahan saat memproses permintaan." };
  }
}
