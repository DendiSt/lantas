"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function forgotPassword(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, error: "Alamat email harus diisi" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // We don't want to reveal if the email exists or not to prevent enumeration
    if (!user) {
      return { 
        success: true, 
        message: "Jika email Anda terdaftar, kami telah mengirimkan instruksi untuk mereset kata sandi." 
      };
    }

    // Generate random token (64 hex characters)
    const resetToken = crypto.randomBytes(32).toString("hex");
    // Token expires in 15 minutes
    const resetTokenExpiry = new Date(Date.now() + 15 * 60000);

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Determine the base URL (for the reset link)
    // Vercel otomatis menyediakan VERCEL_URL. Jika tidak ada, gunakan NEXT_PUBLIC_APP_URL, lalu fallback ke localhost.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    // Send email via Resend
    // Note: On free tier, 'to' must be your verified email address if you don't have a verified domain.
    // Jika nanti sudah pakai domain beneran, email otomatis akan terkirim ke email siswa yang bersangkutan.
    await resend.emails.send({
      from: 'LANTAS <onboarding@resend.dev>',
      to: email, // <--- DIUBAH: Sekarang otomatis mengambil email dari input form/database
      subject: 'Reset Kata Sandi Anda - LANTAS',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f172a;">Lupa Kata Sandi?</h2>
          <p>Halo <strong>${user.name}</strong>,</p>
          <p>Kami menerima permintaan untuk mereset kata sandi akun LANTAS Anda. Jika ini memang Anda, silakan klik tombol di bawah ini:</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Kata Sandi</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">Tautan ini hanya berlaku selama 15 menit.</p>
          <p style="color: #64748b; font-size: 14px;">Jika Anda tidak pernah meminta reset kata sandi, abaikan email ini.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Tim IT LANTAS Sekolah</p>
        </div>
      `
    });

    return { 
      success: true, 
      message: "Jika email Anda terdaftar, kami telah mengirimkan instruksi untuk mereset kata sandi." 
    };

  } catch (error) {
    console.error("Forgot password error:", error);
    return { success: false, error: "Terjadi kesalahan saat memproses permintaan." };
  }
}
