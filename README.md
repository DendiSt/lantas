# LANTAS (Layanan Terpadu Administrasi Sekolah)

> **Sistem Perizinan Mandiri Siswa & Verifikasi Tata Usaha (TU) Real-time**  
> SMK Negeri 2 Subang

LANTAS adalah aplikasi web modern berbasis *self-service* yang mendigitalkan alur perizinan siswa (sakit, izin pulang lebih awal, dan izin lainnya) untuk mengeliminasi antrean fisik di ruang Tata Usaha dan mempercepat rekapitulasi data absensi secara real-time.

---

## 🚀 Fitur Utama

- **Portal Siswa (`/dashboard`)**:
  - Tampilan responsif (Mobile-first & Desktop).
  - Formulir pengajuan izin instan dengan kompresi foto surat dokter otomatis (*client-side canvas compression*).
  - Riwayat perizinan dengan filter kategori dan badge status real-time (`PENDING`, `APPROVED`, `REJECTED`).
  - Mobile bottom navigation bar untuk kemudahan akses di ponsel.

- **Panel Tata Usaha (`/admin`)**:
  - Sidebar navigasi lengkap.
  - 3 Kartu metrik ringkasan dengan indikator persentase.
  - Tabel data desktop interaktif dengan paginasi, pencarian, dan penyaringan jenis izin.
  - Modal pratinjau lampiran surat bukti.
  - Aksi verifikasi satu klik (*Approve* / *Reject*) dengan Server Actions.

- **Role Switcher (`/`)**:
  - Halaman awal untuk berpindah peran pengujian secara dinamis langsung dari database.

---

## 🛠️ Teknologi & Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS & shadcn/ui
- **Icons**: Lucide Icons
- **Database**: SQLite
- **ORM**: Prisma ORM v6

---

## 🏁 Memulai Pengembangan Lokal

1. **Clone repositori**:
   ```bash
   git clone https://github.com/DendiSt/lantas.git
   cd lantas
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Inisialisasi database & seeding**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Jalankan server pengembangan**:
   ```bash
   npm run dev
   ```

5. Buka [http://localhost:3000](http://localhost:3000) di browser Anda.
