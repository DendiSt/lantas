import { PrismaClient, Role, RequestType, RequestStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Mengosongkan data transaksi (tabel Request)...");
  await prisma.request.deleteMany();

  console.log("👤 Memastikan akun pengguna dasar tersedia...");
  await prisma.user.deleteMany();

  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Buat Admin
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      name: "Admin TU",
      role: Role.ADMIN,
    },
  });

  // ======================================================================
  // DATA DUMMY (Siswa dan Request) TELAH DIHAPUS UNTUK VERSI PRODUCTION
  // ======================================================================
  // Jika butuh data dummy untuk testing lagi, tambahkan secara manual.

  const requestCount = await prisma.request.count();
  const userCount = await prisma.user.count();

  console.log("✅ Reset Database LANTAS Berhasil!");
  console.log({
    tabelRequest: `${requestCount} pengajuan`,
    tabelUser: `${userCount} akun pengguna siap digunakan`,
    akunTersedia: [
      `${admin.name} (Admin TU)`,
    ],
  });
}

main()
  .catch((e) => {
    console.error("❌ Gagal mereset database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
