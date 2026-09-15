"use server";

import { prisma } from "@/lib/prisma";
import { createSession, logout } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type AuthState = {
  success: boolean;
  error?: string;
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
    return { success: false, error: "Username tidak ditemukan." };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return { success: false, error: "Password salah." };
  }

  await createSession({
    userId: user.id,
    role: user.role,
    username: user.username,
  });

  if (user.role === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/dashboard");
  }
}

export async function logoutAction() {
  await logout();
  redirect("/");
}
