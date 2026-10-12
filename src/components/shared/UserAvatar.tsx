import React from "react";
import { getAvatarInitials, getAvatarColorClass } from "@/lib/avatar";

interface UserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  textClassName?: string;
}

const sizeMap: Record<string, string> = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-12 text-sm",
  xl: "size-16 text-lg",
  "2xl": "size-20 text-2xl",
};

export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className = "",
  textClassName = "",
}: UserAvatarProps) {
  const safeName = name || "User";
  const initials = getAvatarInitials(safeName);
  const colorClass = getAvatarColorClass(safeName);
  const sizeClass = sizeMap[size] || sizeMap.md;

  if (avatarUrl) {
    return (
      <div
        className={`rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-700 flex items-center justify-center ${sizeClass} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={safeName}
          className="size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center font-bold tracking-wider select-none shadow-2xs ${sizeClass} ${colorClass} ${className}`}
    >
      <span className={textClassName}>{initials}</span>
    </div>
  );
}
