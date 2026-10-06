import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

const secretKey = process.env.JWT_SECRET;
if (!secretKey) throw new Error("FATAL: JWT_SECRET environment variable is not set!");
const key = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  userId: string;
  role: Role;
  username: string;
}

export async function encrypt(payload: SessionPayload, expiresAt: Date) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  // Hitung kedaluwarsa: Hari ini + 3 hari, diset tepat pada jam 00:00:00
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 3);
  expiresAt.setHours(0, 0, 0, 0); // Jam 00 malam

  const session = await encrypt(payload, expiresAt);
  const cookieStore = await cookies();
  
  cookieStore.set("lantas_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("lantas_session");
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("lantas_session")?.value;
  if (!session) return null;
  return await decrypt(session);
}
