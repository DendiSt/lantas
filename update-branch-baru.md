# Daftar Pembaruan Sistem LANTAS (Post-Pengerucutan Fitur)

> **Dokumen Logbook & Dokumentasi Teknis Tugas Akhir**  
> **Aplikasi:** LANTAS (Layanan Administrasi & Notifikasi Terpadu Akademik Sekolah)  
> **Cakupan Update:** Pasca commit `05a83d4` (*Perampingan Fokus Projek*) hingga `c77bf93` (*HEAD*)  
> **Fokus Utama:** Efisiensi Administrasi Tata Usaha (TU), Keandalan Sistem (*Resilience*), Verifikasi Publik, dan Presensi Guru.

---

## 📌 Ringkasan Eksekutif Pembaruan

Setelah tahap pengerucutan fitur yang memfokuskan LANTAS pada administrasi TU dan presensi guru, pengembangan dilanjutkan ke tahap **penyempurnaan mendalam (*deep refinement*)**, **otomatisasi administrasi**, **verifikasi digital**, dan **peningkatan ketahanan sistem (*fault tolerance*)**.

### Tabel Rekapitulasi Pembaruan

| No | Modul / Area | Fitur Utama yang Ditambahkan / Berubah | Dampak Operasional / Pengguna |
|---|---|---|---|
| 1 | **Tata Usaha (Admin)** | *Batch Approval* (Persetujuan Massal) & *Floating Action Bar* | TU dapat menyetujui/menolak puluhan izin siswa dalam 1 klik |
| 2 | **Tata Usaha (Admin)** | Filter Kelas & Shortcut Tanggal *"Hari Ini"* | Penyaringan antrean izin lebih cepat dan terfokus |
| 3 | **Tata Usaha (Admin)** | Modal Preview Surat Izin di Tabel Admin | TU dapat langsung memeriksa dan mencetak surat izin siswa |
| 4 | **Verifikasi Digital** | Halaman Verifikasi Publik Online (`/verifikasi/[id]`) | Siapapun dapat memeriksa keabsahan surat via kamera HP/Google Lens |
| 5 | **Portal Siswa** | Cetak & Ekspor PDF Surat Izin Resmi (Format A5) | Siswa memiliki bukti fisik/digital resmi ber-kop dan stempel TU |
| 6 | **Portal Siswa** | Widget KPI Kehadiran Akademik (`StudentAttendanceSummary`) | Siswa dapat memantau persentase hadir, izin, sakit, dan alpa |
| 7 | **Keamanan (Security)** | Stealth 404 Route Protection (*Anti-Probing*) | Mencegah scanning URL rahasia oleh pihak tak berwenang |
| 8 | **Presensi Guru** | Validasi Ketat Jadwal vs Mata Pelajaran Server-Side | Mencegah salah input presensi di luar jadwal mengajar guru |
| 9 | **Pelaporan (Reports)** | Rekap Excel Berwarna (*Styled XLSX*) & % Tingkat Kehadiran | Laporan rekap siap cetak/arsip dengan conditional formatting |
| 10 | **Ketahanan Sistem** | Arsitektur Multi-Tier *Error Boundaries* | Mengisolasi error per-role sehingga sistem tidak crash total |
| 11 | **Navigasi & UX** | *Role-Aware Brand Logo Redirection* | Klik logo LANTAS langsung kembali ke dashboard peran masing-masing |
| 12 | **Tampilan & Tema** | *Celestial Theme Morphing* & *Ripple Transitions* | Transisi mode gelap/terang sangat mulus tanpa *flicker* |
| 13 | **Pengujian (Testing)** | Automated Unit Test dengan Vitest | Pengujian otomatis alur persetujuan izin dan presensi |

---

## 🔍 Rincian Lengkap Pembaruan Berdasarkan Modul

### 1. Modul Tata Usaha (Peningkatan Efisiensi Alur Izin)
* **Persetujuan Massal (*Batch Approval*)**:
  * Menambahkan checkbox pilihan (*multi-select*) pada setiap baris pengajuan izin di tabel admin.
  * Menampilkan **Floating Action Bar** interaktif di bawah layar ketika satu atau lebih pengajuan dipilih.
  * Aksi *"Setujui Semua"* dan *"Tolak Semua"* dijalankan secara atomik melalui Server Action `batchUpdateRequestStatus`.
* **Penyaringan Cepat (*Fast Filtering*)**:
  * Dropdown filter kelas/rombel untuk mengelompokkan permohonan siswa per kelas.
  * Tombol jalan pintas (*shortcut*) tanggal **"Hari Ini"** agar staf TU langsung melihat permohonan yang mendesak pada hari berjalan.
* **Pratinjau Slip Izin dari Sisi Admin**:
  * Tombol aksi baru pada baris tabel untuk membuka pratinjau surat izin siswa tanpa perlu login menggunakan akun siswa terkait.

---

### 2. Modul Verifikasi Publik via QR Code Online
* **Rute Publik Tanpa Autentikasi (`src/app/verifikasi/[id]/page.tsx`)**:
  * Menyediakan halaman verifikasi publik yang aman dan ringan untuk memvalidasi nomor surat izin.
  * Menampilkan status dokumen: **VALID (Aktif)**, **KEDALUWARSA**, atau **DITOLAK / TIDAK VALID**.
* **Integrasi Kamera HP Standar & Google Lens**:
  * Payload QR Code diperbarui dari sekadar ID mentah menjadi URL online absolut (`https://domain/verifikasi/[id]`).
  * Guru piket, satpam, atau orang tua cukup memindai dengan kamera smartphone biasa tanpa memerlukan aplikasi khusus.

---

### 3. Portal Siswa & Surat Izin Digital
* **Cetak & Unduh Dokumen Resmi A5**:
  * Tombol **Cetak (Print Layout)** dengan styling CSS `@media print` khusus ukuran A5.
  * Tombol **Unduh PDF** menggunakan pustaka `jspdf` yang merender surat beresolusi tinggi secara *client-side*.
  * Dilengkapi kop surat resmi institusi, identitas siswa, alasan izin, stempel digital verifikasi TU, dan QR Code verifikasi.
* **Penyesuaian Bahasa Dokumen (*Copywriting Refinement*)**:
  * Istilah disesuaikan menjadi bahasa formal surat izin keluar/masuk sekolah yang divalidasi Tata Usaha (bukan sekadar kartu satpam).
* **Ringkasan Kehadiran Akademik Siswa**:
  * Komponen baru `StudentAttendanceSummary.tsx` di dashboard siswa.
  * Menampilkan ringkasan kartu KPI kehadiran: Total Hadir, Izin, Sakit, Alpa, dan persentase kehadiran per mata pelajaran.

---

### 4. Keamanan Sistem & Perlindungan Routing
* **Stealth 404 Edge Defense (`middleware.ts`)**:
  * Permintaan URL langsung (*direct URL probing*) ke halaman terlindungi (`/admin/*`, `/teacher/*`) oleh pihak yang tidak memiliki hak akses tidak lagi dialihkan (*redirect*) ke login, melainkan di-*rewrite* langsung ke **HTTP 404 Not Found**.
  * Memberikan lapisan pertahanan agar penyerang tidak dapat memetakan (*reconnaissance*) struktur internal web sekolah.
* **Penyempurnaan Halaman 404**:
  * Desain 404 baru yang bersih, simetris, berestetika tinggi, dan memuat tombol aksi kembali yang kontekstual dengan hak akses pengguna.

---

### 5. Presensi & Jurnal Mengajar Guru
* **Validasi Ketat Kesesuaian Jadwal Server-Side**:
  * Server Action `actions/attendance.ts` memverifikasi bahwa pengisian presensi harus sesuai dengan hari dan jam mata pelajaran yang diampu guru tersebut.
* **Indikator Peringatan Jadwal di UI**:
  * Menampilkan notifikasi peringatan visual jika mata pelajaran yang dipilih tidak sesuai dengan jadwal harian guru, mencegah ketidaksinkronan data jurnal kelas.

---

### 6. Rekapitulasi Presensi & Ekspor Excel Profesional
* **Ekspor Excel Berwarna (*Styled XLSX Export*)**:
  * Hasil ekspor data presensi dilengkapi dengan styling header, border rapi (*hairline borders*), dan pewarnaan status otomatis (*conditional styling*):
    * **Hijau**: Hadir
    * **Kuning**: Izin / Sakit
    * **Merah**: Alpa
* **Perhitungan Persentase Kehadiran Otomatis**:
  * Menghitung rasio kehadiran siswa (*Attendance Rate %*) secara otomatis untuk mempermudah evaluasi wali kelas dan guru BP/BK.

---

### 7. Ketahanan Sistem (*Multi-Tier Error Boundaries*)
* **Isolasi Error Modular**:
  * `src/app/global-error.tsx`: Menangani crash fatal pada level layout root aplikasi.
  * `src/app/error.tsx`: Menangani kegagalan halaman publik.
  * `src/app/admin/error.tsx`: Mengisolasi error pada panel Tata Usaha.
  * `src/app/teacher/error.tsx`: Mengisolasi error pada portal Guru.
  * `src/app/dashboard/error.tsx`: Mengisolasi error pada portal Siswa.
* **Antarmuka Pemulihan Graceful**:
  * Dilengkapi tombol *"Coba Lagi"* (`reset()`) dan tombol navigasi kembali ke dashboard tanpa memaksa pengguna me-*refresh* peramban secara manual.

---

### 8. Peningkatan UI/UX & Desain Sistem
* **Navigasi Cerdas Logo LANTAS**:
  * Mengklik logo LANTAS di header/sidebar secara otomatis mengarahkan ke dashboard yang relevan dengan peran pengguna saat itu (`/admin` untuk TU, `/teacher` untuk Guru, `/dashboard` untuk Siswa).
* **Celestial Theme Morphing (Light/Dark Mode)**:
  * Transisi perubahan tema menggunakan animasi morphing SVG Matahari ↔ Bulan.
  * Diintegrasikan dengan **View Transitions API** berformat *circular clip-path ripple* yang halus dan bebas kedipan (*zero flicker*).
* **Penegakan Aturan Kualitas Desain (*Anti-Slop Linting*)**:
  * Penerapan aturan Oxlint untuk memastikan tidak ada CSS redundan, inkonsistensi spasi, maupun pergeseran tata letak (*layout shift*).

---

### 9. Pengujian & Kestabilan Infrastruktur
* **Pengujian Otomatis Vitest (`vitest`)**:
  * Menambahkan file pengujian unit `__tests__/actions/requests.test.ts` untuk memverifikasi logika bisnis persetujuan izin tunggal maupun massal (*batch approval*).
* **Kestabilan Build Vercel**:
  * Optimasi `prisma.config.ts` dengan *graceful fallback* agar proses *deployment* di cloud Vercel berjalan lancar tanpa terganggu oleh keterbatasan *environment variable* saat tahap *build*.

---
