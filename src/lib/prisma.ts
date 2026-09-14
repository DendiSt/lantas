import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Khusus untuk Vercel: Salin database read-only ke /tmp agar bisa ditulis (writable)
let datasourceUrl = process.env.DATABASE_URL;

if (process.env.NODE_ENV === "production") {
  const tmpDbPath = "/tmp/dev.db";
  const bundledDbPath = path.join(process.cwd(), "prisma", "dev.db");
  
  if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundledDbPath)) {
    fs.copyFileSync(bundledDbPath, tmpDbPath);
  }
  datasourceUrl = "file:/tmp/dev.db";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: datasourceUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
