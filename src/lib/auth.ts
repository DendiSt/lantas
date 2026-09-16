import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

const secretKey = process.env.JWT_SECRET || "default_super_secret_key_lantas";
const key = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  userId: string;
  role: Role;
  username: string;
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
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
  const session = await encrypt(payload);
  const cookieStore = await cookies();
  
  cookieStore.set("lantas_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
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
