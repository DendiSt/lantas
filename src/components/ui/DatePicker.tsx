"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  /** Array of YYYY-MM-DD strings that are selectable */
  enabledDates?: string[];
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Disable weekends (Saturday & Sunday) */
  disableWeekends?: boolean;
  /** Additional className for the trigger button */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Callback when user navigates to a different month */
  onMonthChange?: (month: number, year: number) => void;
}

export function DatePicker({
  value,
  onChange,
  enabledDates,
  minDate,
  maxDate,
  disableWeekends = false,
  className = "",
  placeholder = "Pilih tanggal",
  onMonthChange,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(value + "T00:00:00") : undefined;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Build the disabled matcher
  const disabledMatcher = (day: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Always allow today
    if (isSameDay(day, today)) return false;

    // Disable weekends
    if (disableWeekends && (day.getDay() === 0 || day.getDay() === 6)) return true;

    // Min date check
    if (minDate && day < minDate) return true;

    // Max date check
    if (maxDate && day > maxDate) return true;

    // If enabledDates is provided, only allow those dates + today
    if (enabledDates) {
      const dateStr = format(day, "yyyy-MM-dd");
      return !enabledDates.includes(dateStr);
    }

    return false;
  };

  const handleSelect = (day: Date | undefined) => {
    if (!day) return;

    // If the selected day is disabled and enabledDates exists, find nearest enabled date
    if (enabledDates && disabledMatcher(day) && !isSameDay(day, new Date())) {
      const target = day.getTime();
      let nearestDate: string | null = null;
      let nearestDist = Infinity;

      for (const d of enabledDates) {
        const dist = Math.abs(new Date(d + "T00:00:00").getTime() - target);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestDate = d;
        }
      }

      if (nearestDate) {
        onChange(nearestDate);
      }
      setIsOpen(false);
      return;
    }

    onChange(format(day, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  const displayText = selected
    ? format(selected, "dd/MM/yyyy", { locale: localeId })
    : placeholder;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          h-9 px-3 flex items-center gap-2 rounded-xl border text-sm font-medium transition-all cursor-pointer
          ${isOpen
            ? "border-slate-900 dark:border-white ring-1 ring-slate-900/10 dark:ring-white/10"
            : "border-slate-200 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-500"
          }
          bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100
        `}
      >
        <Calendar className="size-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
        <span className={selected ? "" : "text-slate-400 dark:text-zinc-500"}>
          {displayText}
        </span>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-xl p-3 ring-1 ring-slate-900/5 dark:ring-white/5">
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              disabled={disabledMatcher}
              locale={localeId}
              defaultMonth={selected || new Date()}
              showOutsideDays
              onMonthChange={(month) => {
                if (onMonthChange) {
                  onMonthChange(month.getMonth(), month.getFullYear());
                }
              }}
              classNames={{
                root: "lantas-calendar",
                months: "flex flex-col",
                month: "space-y-3",
                month_caption: "flex items-center justify-center relative h-8",
                caption_label: "text-sm font-bold text-slate-900 dark:text-white",
                nav: "flex items-center justify-between absolute inset-x-0",
                button_previous: "size-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors",
                button_next: "size-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors",
                weekdays: "grid grid-cols-7 mb-1",
                weekday: "text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 text-center w-9 py-1",
                weeks: "space-y-0.5",
                week: "grid grid-cols-7",
                day: "text-center",
                day_button: "size-9 rounded-lg text-xs font-medium transition-all text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer",
                selected: "!bg-slate-900 !text-white dark:!bg-white dark:!text-slate-900 !font-bold hover:!bg-slate-800 dark:hover:!bg-zinc-200",
                today: "!font-extrabold !text-indigo-600 dark:!text-indigo-400 ring-1 ring-indigo-300 dark:ring-indigo-700 rounded-lg",
                outside: "!text-slate-300 dark:!text-zinc-600",
                disabled: "!text-slate-300 dark:!text-zinc-700 !cursor-not-allowed hover:!bg-transparent dark:hover:!bg-transparent !opacity-40",
              }}
              components={{
                Chevron: ({ orientation }) =>
                  orientation === "left" ? (
                    <ChevronLeft className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  ),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
