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

  // Buat Siswa 1 (Profil Lengkap)
  const student1 = await prisma.user.upsert({
    where: { username: "siswa1" },
    update: {},
    create: {
      username: "siswa1",
      password: hashedPassword,
      name: "Andi Saputra",
      role: Role.STUDENT,
      classId: "12 RPL 1",
      nisn: "0051234567",
      address: "Jl. Diponegoro No. 10, Subang",
      phone: "081234567890",
      gender: "LAKI_LAKI",
      parentName: "Budi Santoso",
      birthDate: new Date("2005-08-15"),
      profileCompleted: true,
      avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Andi",
    },
  });

  // Buat Siswa 2 (Profil Belum Lengkap)
  const student2 = await prisma.user.upsert({
    where: { username: "siswa2" },
    update: {},
    create: {
      username: "siswa2",
      password: hashedPassword,
      name: "Siti Rahmawati",
      role: Role.STUDENT,
      classId: "11 TKJ 2",
    },
  });
  
  // Buat Siswa 3
  const student3 = await prisma.user.upsert({
    where: { username: "siswa3" },
    update: {},
    create: {
      username: "siswa3",
      password: hashedPassword,
      name: "Bagas Pratama",
      role: Role.STUDENT,
      classId: "10 TKR 1",
      profileCompleted: true,
      nisn: "0067654321",
      address: "Jl. Ahmad Yani No. 5",
      phone: "081987654321",
      gender: "LAKI_LAKI",
      parentName: "Wahyu",
      birthDate: new Date("2006-03-20")
    }
  });

  // Buat Pengajuan Izin
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.request.createMany({
    data: [
      {
        studentId: student1.id,
        type: RequestType.SAKIT,
        reason: "Sakit demam dan flu sejak kemarin",
        status: RequestStatus.PENDING,
        attachmentUrl: "https://placehold.co/600x400/png?text=Surat+Dokter",
        createdAt: new Date(),
      },
      {
        studentId: student2.id,
        type: RequestType.IZIN_PULANG,
        reason: "Ada keperluan keluarga mendadak (kakek masuk rumah sakit)",
        status: RequestStatus.APPROVED,
        createdAt: yesterday,
      },
      {
        studentId: student3.id,
        type: RequestType.DISPENSASI,
        reason: "Mengikuti lomba LKS tingkat provinsi",
        status: RequestStatus.APPROVED,
        attachmentUrl: "https://placehold.co/600x400/png?text=Surat+Tugas",
        createdAt: yesterday,
      },
      {
        studentId: student1.id,
        type: RequestType.TANPA_KETERANGAN,
        reason: "Terlambat bangun",
        status: RequestStatus.REJECTED,
        rejectionNote: "Alasan tidak dapat diterima, masuk kategori Alpha",
        createdAt: yesterday,
      }
    ],
  });

  const requestCount = await prisma.request.count();
  const userCount = await prisma.user.count();

  console.log("✅ Reset Database LANTAS Berhasil!");
  console.log({
    tabelRequest: `${requestCount} pengajuan`,
    tabelUser: `${userCount} akun pengguna siap digunakan`,
    akunTersedia: [
      `${student1.name} (Siswa - ${student1.classId})`,
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
