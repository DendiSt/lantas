"use server";

import { prisma } from "@/lib/prisma";
import { createSession, logout } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type AuthState = {
  success: boolean;
  error?: string;
  redirectTo?: string;
  userName?: string;
};

export async function login(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { success: false, error: "Username dan password harus diisi." };
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return { success: false, error: "Username atau password salah." };
  }

  // Cek apakah akun sedang terkunci (Rate Limiting)
  if (user.lockoutUntil && user.lockoutUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - new Date().getTime()) / 60000);
    return { success: false, error: `Akun sementara dikunci. Coba lagi dalam ${minutesLeft} menit.` };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    // Tambah attempt jika salah password
    const newAttempts = user.loginAttempts + 1;
    let newLockout = null;
    if (newAttempts >= 5) {
      newLockout = new Date(Date.now() + 15 * 60000); // 15 menit
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: newAttempts, lockoutUntil: newLockout }
    });
    
    if (newLockout) {
      return { success: false, error: "Terlalu banyak percobaan. Akun dikunci selama 15 menit." };
    }
    return { success: false, error: "Username atau password salah." };
  }

  // Jika berhasil login, reset attempt dan lockout
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      lastLogin: new Date(),
      loginAttempts: 0,
      lockoutUntil: null
    }
  });

  await createSession({
    userId: user.id,
    role: user.role,
    username: user.username,
  });

  let redirectTo = "/dashboard";
  if (user.role === "ADMIN") {
    redirectTo = "/admin";
  } else if (user.role === "TEACHER") {
    redirectTo = "/teacher";
  } else if (user.role === "SECURITY") {
    redirectTo = "/security";
  }

  return { 
    success: true, 
    redirectTo,
    userName: user.name
  };
}

export async function logoutAction() {
  await logout();
  redirect("/");
}
