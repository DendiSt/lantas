# LANTAS (Layanan Terpadu Administrasi Sekolah)

LANTAS adalah aplikasi web modern berbasis *self-service* yang mendigitalkan alur perizinan siswa, absensi harian kelas, hingga pemindaian keamanan (Satpam) untuk mengeliminasi antrean fisik di ruang Tata Usaha dan mempercepat rekapitulasi data absensi secara *real-time*.

---

## 🚀 Fitur Utama

- **Portal Siswa (`/dashboard`)**:
  - Tampilan responsif (Mobile-first & Desktop).
  - Formulir pengajuan izin instan dengan pembatasan waktu (izin parsial atau seharian) dan kompresi foto surat dokter otomatis (*client-side canvas compression*).
  - Riwayat perizinan dengan filter kategori dan *badge* status *real-time* (`PENDING`, `APPROVED`, `REJECTED`).
  - **Sistem QR Code Dinamis**: Menampilkan kode QR aktif yang memiliki waktu kedaluwarsa otomatis sesuai jenis izin, lengkap dengan tampilan peringatan (fallback otomatis) bila batas waktu habis.
  - *Mobile bottom navigation bar* untuk kemudahan akses di ponsel.

- **Panel Tata Usaha / Admin (`/admin`)**:
  - Sidebar navigasi lengkap dan dasbor metrik interaktif dengan grafik (Chart) persentase/distribusi.
  - Verifikasi perizinan satu klik (*Approve* / *Reject*) terintegrasi Server Actions.
  - **Rekap Absensi Harian**: Memantau absensi keseluruhan, menimpa absen alfa jika perizinan disetujui belakangan.
  - **Manajemen Master Data**: Pengelolaan data Siswa, Kelas, Guru, Mata Pelajaran, dan Penugasan (*Mapping*).

- **Portal Guru (`/teacher`)**:
  - **Jurnal Kelas Terpadu**: Guru Mata Pelajaran dapat mengisi absensi kelas (*bulk absen*) sesuai jam mata pelajaran.
  - **Dasbor Ganda**: Tampilan pintar yang menyesuaikan—apakah guru tersebut sekadar Guru Mapel atau juga menjabat sebagai Wali Kelas.
  - **Sistem Peringatan Dini (Wali Kelas)**: Dasbor Wali Kelas mendeteksi dan memperingatkan guru jika ada siswa di kelasnya yang sudah memiliki jumlah **Alfa >= 3**.
  - **Riwayat Jurnal Hari Ini**: Ringkasan kelas apa saja yang sudah diabsen oleh guru tersebut pada hari berjalan.

- **Pos Satpam (`/security`)**:
  - Halaman kerja khusus untuk petugas keamanan (Satpam) di gerbang.
  - **Pemindai QR Code Internal**: Pemindai kamera langsung via *browser* untuk mencatat jam keluar siswa.
  - **Daftar Tunggu (Waitlist)**: Daftar antrean *real-time* menampilkan siapa saja yang diharapkan akan menuju gerbang dengan kode QR aktif.
  - **Validasi Cerdas**: Secara instan memblokir QR palsu, QR yang sudah digunakan, atau QR yang sudah kedaluwarsa.

- **Logika Latar Belakang Cerdas (*Lazy Fallback*)**:
  - Menangani siklus hidup izin tanpa *cron-job* berat. Jika QR Code kedaluwarsa sebelum di-*scan*, sistem mendeteksi dan secara reaktif (*lazy update*) menetapkan status siswa ke *"Berangkat dari Rumah"* (untuk dispensasi seharian) atau *"Telah Keluar Gerbang"* (untuk izin pulang sekolah).

---

## 🛠️ Teknologi & Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS & shadcn/ui
- **Icons**: Lucide Icons
- **Database**: PostgreSQL (Via Neon)
- **ORM**: Prisma ORM v6
- **QR Scanner**: HTML5-QRCode
- **Generator QR**: qrcode.react

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
   Pastikan Anda mengatur `DATABASE_URL` pada berkas `.env`. Lalu jalankan:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Jalankan server pengembangan**:
   ```bash
   npm run dev
   ```

5. Buka [http://localhost:3000](http://localhost:3000) di *browser* Anda.
