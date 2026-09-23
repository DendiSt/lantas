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
    return { success: false, error: "Username tidak ditemukan." };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return { success: false, error: "Password salah." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
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
