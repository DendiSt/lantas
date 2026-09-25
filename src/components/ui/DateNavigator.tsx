"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DatePicker } from "@/components/ui/DatePicker";
import { getActiveDates } from "@/app/actions/attendance";

interface DateNavigatorProps {
  /** Current selected date string YYYY-MM-DD */
  currentDate: string;
  /** Initial enabled dates for the current month (fetched server-side) */
  initialEnabledDates: string[];
  /** Class ID filter (for admin attendance pages) */
  classId?: string;
  /** Teacher ID filter (for teacher recap pages) */
  teacherId?: string;
  /** Additional search params to preserve (e.g., view=wali) */
  extraParams?: Record<string, string>;
  /** Base path for navigation (e.g., /admin/attendances/classId) */
  basePath?: string;
}

export function DateNavigator({
  currentDate,
  initialEnabledDates,
  classId,
  teacherId,
  extraParams = {},
  basePath,
}: DateNavigatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [enabledDates, setEnabledDates] = useState<string[]>(initialEnabledDates);

  // Add today to enabled dates
  const today = new Date().toLocaleDateString("en-CA");
  const allEnabledDates = [...new Set([...enabledDates, today])];

  const handleDateChange = useCallback(
    (dateStr: string) => {
      const params = new URLSearchParams();
      params.set("date", dateStr);
      // Preserve extra params
      for (const [key, value] of Object.entries(extraParams)) {
        params.set(key, value);
      }
      const path = basePath || window.location.pathname;
      router.push(`${path}?${params.toString()}`);
    },
    [router, basePath, extraParams]
  );

  const handleMonthChange = useCallback(
    async (month: number, year: number) => {
      const dates = await getActiveDates(month, year, classId, teacherId);
      setEnabledDates(dates);
    },
    [classId, teacherId]
  );

  return (
    <DatePickerWithMonthFetch
      value={currentDate}
      onChange={handleDateChange}
      enabledDates={allEnabledDates}
      onMonthChange={handleMonthChange}
    />
  );
}

/**
 * Inner component that wraps DatePicker and fetches active dates on month navigation
 */
function DatePickerWithMonthFetch({
  value,
  onChange,
  enabledDates,
  onMonthChange,
}: {
  value: string;
  onChange: (dateStr: string) => void;
  enabledDates: string[];
  onMonthChange: (month: number, year: number) => void;
}) {
  return (
    <DatePicker
      value={value}
      onChange={onChange}
      enabledDates={enabledDates}
      disableWeekends
      onMonthChange={onMonthChange}
    />
  );
}
