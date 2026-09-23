"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { getSession } from "@/lib/auth";
import * as xlsx from "xlsx";

export async function createStudent(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const nisn = formData.get("nisn") as string || null;
  const classId = formData.get("classId") as string || null;

  if (!name || !username || !password) return { success: false, error: "Harap isi semua field wajib" };
  if (name.length < 3) return { success: false, error: "Nama minimal 3 karakter" };
  if (username.length < 4 || !/^[a-z0-9_]+$/.test(username)) return { success: false, error: "Username minimal 4 karakter (hanya huruf kecil, angka, underscore)" };
  if (password.length < 6) return { success: false, error: "Password minimal 6 karakter" };

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return { success: false, error: "Username sudah digunakan" };

    if (nisn) {
      if (!/^\d{10}$/.test(nisn)) return { success: false, error: "NISN harus berupa 10 digit angka" };
      const existingNisn = await prisma.user.findFirst({ where: { nisn } });
      if (existingNisn) return { success: false, error: "NISN sudah digunakan oleh siswa lain" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        nisn,
        classId,
        role: Role.STUDENT,
      }
    });

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan saat menambahkan siswa" };
  }
}

export async function deleteStudent(studentId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    await prisma.user.delete({ where: { id: studentId } });
    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan saat menghapus data" };
  }
}

export async function resetPassword(studentId: string, newPassword: string = "password123") {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: studentId },
      data: { password: hashedPassword }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan saat mereset password" };
  }
}

export async function updateStudent(id: string, formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Akses ditolak" };
    }

    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const nisn = formData.get("nisn") as string || null;
    const classId = formData.get("classId") as string || null;

    if (!name || !username) {
      return { success: false, error: "Nama dan Username wajib diisi" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser && existingUser.id !== id) {
      return { success: false, error: "Username sudah digunakan oleh pengguna lain" };
    }

    if (nisn) {
      const existingNisn = await prisma.user.findFirst({ where: { nisn, id: { not: id } } });
      if (existingNisn) {
        return { success: false, error: "NISN sudah digunakan oleh siswa lain" };
      }
    }

    const dataToUpdate: any = { 
      name, 
      username, 
      nisn, 
      classId 
    };

    if (password && password.trim().length > 0) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    console.error("Gagal mengupdate siswa:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function importStudentsFromExcel(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File;
  const classId = formData.get("classId") as string || null;

  if (!file) return { success: false, error: "Pilih file Excel terlebih dahulu" };

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet) as any[];

    if (!data || data.length === 0) {
      return { success: false, error: "File kosong atau tidak ada baris data" };
    }

    const defaultPassword = await bcrypt.hash("password123", 10);
    
    let importedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const usedUsernames = new Set<string>();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const keys = Object.keys(row);
      const nameKey = keys.find(k => k.toLowerCase().includes("nama") && !k.toLowerCase().includes("orang") && !k.toLowerCase().includes("parent"));
      const nisnKey = keys.find(k => k.toLowerCase().includes("nisn"));
      const genderKey = keys.find(k => k.toLowerCase().includes("kelamin") || k.toLowerCase().includes("gender") || k.toLowerCase() === "jk" || k.toLowerCase() === "l/p");
      const parentKey = keys.find(k => k.toLowerCase().includes("orang tua") || k.toLowerCase().includes("parent") || k.toLowerCase().includes("wali"));
      const addressKey = keys.find(k => k.toLowerCase().includes("alamat") || k.toLowerCase().includes("address"));

      if (!nameKey || !row[nameKey]) {
        failedCount++;
        errors.push(`Baris ${i + 2}: Kolom Nama tidak ditemukan`);
        continue;
      }

      const fullName = String(row[nameKey]).trim();
      const nisnStr = nisnKey && row[nisnKey] ? String(row[nisnKey]).trim() : null;
      
      // Parse gender: L/Laki-laki → "Laki-laki", P/Perempuan → "Perempuan"
      let gender: string | null = null;
      if (genderKey && row[genderKey]) {
        const raw = String(row[genderKey]).trim().toUpperCase();
        if (raw === "L" || raw.startsWith("LAKI")) gender = "Laki-laki";
        else if (raw === "P" || raw.startsWith("PEREMP")) gender = "Perempuan";
        else gender = String(row[genderKey]).trim();
      }

      const parentName = parentKey && row[parentKey] ? String(row[parentKey]).trim() : null;
      const address = addressKey && row[addressKey] ? String(row[addressKey]).trim() : null;

      if (nisnStr && !/^\d{10}$/.test(nisnStr)) {
        failedCount++;
        errors.push(`Baris ${i + 2} (${fullName}): NISN harus 10 digit`);
        continue;
      }
      
      if (nisnStr) {
        const existingNisn = await prisma.user.findFirst({ where: { nisn: nisnStr } });
        if (existingNisn) {
          failedCount++;
          errors.push(`Baris ${i + 2} (${fullName}): NISN sudah terdaftar`);
          continue;
        }
      }

      const baseUsername = fullName.split(' ')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      let username = baseUsername.length < 4 ? baseUsername + Math.floor(1000 + Math.random() * 9000) : baseUsername;

      let isUnique = false;
      let counter = 1;
      let finalUsername = username;
      
      while (!isUnique) {
        if (usedUsernames.has(finalUsername)) {
          finalUsername = `${username}${counter}`;
          counter++;
          continue;
        }
        
        const existing = await prisma.user.findUnique({ where: { username: finalUsername } });
        if (existing) {
          finalUsername = `${username}${counter}`;
          counter++;
        } else {
          isUnique = true;
          usedUsernames.add(finalUsername);
        }
      }

      // Auto-complete profile if gender, parentName, and address are all filled
      const isProfileComplete = !!(gender && parentName && address);

      try {
        await prisma.user.create({
          data: {
            name: fullName,
            username: finalUsername,
            password: defaultPassword,
            nisn: nisnStr,
            classId: classId,
            role: Role.STUDENT,
            gender,
            parentName,
            address,
            profileCompleted: isProfileComplete,
          }
        });
        importedCount++;
      } catch (err) {
        failedCount++;
        errors.push(`Baris ${i + 2} (${fullName}): Gagal simpan ke DB`);
      }
    }

    revalidatePath("/admin/students");
    return { 
      success: true, 
      imported: importedCount, 
      failed: failedCount,
      errors: errors.slice(0, 5)
    };

  } catch (error) {
    console.error("Excel import error:", error);
    return { success: false, error: "Gagal memproses file. Pastikan format Excel (.xlsx/.csv) valid." };
  }
}

export async function bulkDeleteStudents(studentIds: string[]) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  if (!studentIds || studentIds.length === 0) return { success: false, error: "Tidak ada siswa yang dipilih" };

  try {
    await prisma.request.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.attendance.deleteMany({ where: { studentId: { in: studentIds } } });
    
    const result = await prisma.user.deleteMany({
      where: { id: { in: studentIds }, role: Role.STUDENT }
    });

    revalidatePath("/admin/students");
    return { success: true, deleted: result.count };
  } catch (error) {
    console.error("Bulk delete error:", error);
    return { success: false, error: "Terjadi kesalahan saat menghapus data siswa" };
  }
}

export async function promoteStudents(studentIds: string[], targetClassId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  if (!studentIds || studentIds.length === 0) return { success: false, error: "Tidak ada siswa yang dipilih" };
  if (!targetClassId) return { success: false, error: "Kelas tujuan harus dipilih" };

  try {
    const targetClass = await prisma.class.findUnique({ where: { id: targetClassId } });
    if (!targetClass) return { success: false, error: "Kelas tujuan tidak ditemukan" };

    const result = await prisma.user.updateMany({
      where: { id: { in: studentIds }, role: Role.STUDENT },
      data: { classId: targetClassId }
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/promotions");
    return { success: true, promoted: result.count, targetClassName: targetClass.name };
  } catch (error) {
    console.error("Promote error:", error);
    return { success: false, error: "Terjadi kesalahan saat memindahkan siswa" };
  }
}
