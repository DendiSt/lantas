import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTimeGreeting(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hour12: false,
    });

    const hour = parseInt(formatter.format(date), 10);

    if (hour >= 4 && hour < 11) return "Selamat Pagi";

    if (hour >= 11 && hour < 15) return "Selamat Siang";

    if (hour >= 15 && hour < 18) return "Selamat Sore";

    return "Selamat Malam";
  } catch {
    const hour = date.getHours();

    if (hour >= 4 && hour < 11) return "Selamat Pagi";

    if (hour >= 11 && hour < 15) return "Selamat Siang";

    if (hour >= 15 && hour < 18) return "Selamat Sore";

    return "Selamat Malam";
  }
}
