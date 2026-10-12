/**
 * Helper utility untuk avatar WhatsApp-style:
 * - Warna background random/deterministik berdasarkan hash nama
 * - Inisial: 2 huruf (depan & belakang) jika nama >= 2 kata, 1 huruf jika 1 kata
 */

export const AVATAR_COLOR_PALETTES = [
  "bg-emerald-500 text-white",
  "bg-blue-500 text-white",
  "bg-indigo-500 text-white",
  "bg-violet-500 text-white",
  "bg-purple-500 text-white",
  "bg-fuchsia-500 text-white",
  "bg-pink-500 text-white",
  "bg-rose-500 text-white",
  "bg-orange-500 text-white",
  "bg-amber-500 text-white",
  "bg-teal-500 text-white",
  "bg-cyan-600 text-white",
  "bg-sky-500 text-white",
  "bg-red-500 text-white",
] as const;

/**
 * Mengambil inisial nama:
 * - 2 huruf (huruf pertama kata depan & kata belakang) jika >= 2 kata
 * - 1 huruf jika hanya 1 kata
 */
export function getAvatarInitials(name?: string | null): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  const firstChar = words[0].charAt(0);
  const lastChar = words[words.length - 1].charAt(0);
  return `${firstChar}${lastChar}`.toUpperCase();
}

/**
 * Menghasilkan class warna WhatsApp-style secara deterministik dari nama
 * (Nama yang sama akan selalu mendapat warna yang sama, tapi antar nama berbeda warna-warni)
 */
export function getAvatarColorClass(name?: string | null): string {
  if (!name) return "bg-slate-500 text-white";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLOR_PALETTES.length;
  return AVATAR_COLOR_PALETTES[index];
}
