import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LANTAS - Layanan Terpadu Administrasi Sekolah",
  description: "Sistem Perizinan Mandiri Siswa & Verifikasi Tata Usaha (TU) Sekolah",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "LANTAS",
    statusBarStyle: "default",
  },
};

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
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
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 transition-colors antialiased selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.deferredPrompt = null;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.deferredPrompt = e;
                window.dispatchEvent(new Event('deferredpromptready'));
              });
            `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {session?.role === "ADMIN" && <AdminNotificationListener />}
          {session?.role === "STUDENT" && <StudentNotificationListener />}
          <Toaster position="top-center" richColors theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}
