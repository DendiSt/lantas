"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbParent {
  label: string;
  href: string;
}

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  parent?: BreadcrumbParent;
  breadcrumbs?: BreadcrumbParent[];
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  action,
  parent,
  breadcrumbs,
  className,
}: AdminPageHeaderProps) {
  // Susun daftar parent breadcrumbs (jika ada)
  const parents: BreadcrumbParent[] = breadcrumbs || (parent ? [parent] : []);
  const isLevel2Plus = parents.length > 0;

  return (
    <header
      className={cn(
        "bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs shrink-0 w-full",
        className
      )}
    >
      {/* Sisi Kiri: Judul / Inline Title-to-Breadcrumb & Subjudul */}
      <div className="min-w-0">
        <h1 className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isLevel2Plus ? (
            <>
              {parents.map((p, idx) => (
                <React.Fragment key={idx}>
                  <Link
                    href={p.href}
                    className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </Link>
                  <ChevronRight className="size-5 sm:size-6 text-slate-400 dark:text-zinc-500 shrink-0" />
                </React.Fragment>
              ))}
              <span className="text-slate-900 dark:text-white truncate">
                {title}
              </span>
            </>
          ) : (
            <span className="text-slate-900 dark:text-white">{title}</span>
          )}
        </h1>

        {description && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            {description}
          </p>
        )}
      </div>

      {/* Sisi Kanan: Tombol Aksi Utama */}
      {action && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {action}
        </div>
      )}
    </header>
  );
}
