import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LANTAS - Layanan Terpadu Administrasi Sekolah",
  description: "Sistem Perizinan Mandiri Siswa & Verifikasi Tata Usaha (TU) SMK Negeri 2 Subang",
};

import { Toaster } from "sonner";
import { getSession } from "@/lib/auth";
import { AdminNotificationListener } from "@/components/admin/AdminNotificationListener";
import { StudentNotificationListener } from "@/components/siswa/StudentNotificationListener";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {session?.role === "ADMIN" && <AdminNotificationListener />}
        {session?.role === "STUDENT" && <StudentNotificationListener />}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
