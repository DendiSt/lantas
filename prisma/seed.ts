import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Mengosongkan data transaksi (tabel Request)...");
  await prisma.request.deleteMany();

  console.log("👤 Memastikan akun pengguna dasar tersedia...");
  await prisma.user.deleteMany();

  // 1. Akun Siswa Utama (Zibril Suhendar Noor - 10 TAB B)
  const zibril = await prisma.user.create({
    data: {
      id: "student-zibril",
      name: "Zibril Suhendar Noor",
      role: Role.STUDENT,
      classId: "10 TAB B",
    },
  });

  // 2. Akun Staf Tata Usaha / Admin
  const tuAdmin = await prisma.user.create({
    data: {
      id: "admin-tu",
      name: "Bambang, S.Pd (Staf TU)",
      role: Role.ADMIN,
      classId: null,
    },
  });

  const requestCount = await prisma.request.count();
  const userCount = await prisma.user.count();

  console.log("✅ Reset Database LANTAS Berhasil!");
  console.log({
    tabelRequest: `${requestCount} pengajuan (BERSIH / KOSONG)`,
    tabelUser: `${userCount} akun pengguna siap digunakan`,
    akunTersedia: [
      `${zibril.name} (Siswa - ${zibril.classId})`,
      `${tuAdmin.name} (Admin TU)`,
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
