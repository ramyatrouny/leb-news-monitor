"use client";

import { useState, useMemo, useCallback } from "react";
import type { DateRange, DatePreset } from "@/hooks/use-date-filter";
import { DATE_PRESETS } from "@/hooks/use-date-filter";

/* ── Icons ────────────────────────────────────────────────────── */
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* ── Helpers ───────────────────────────────────────────────────── */
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function startDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/* ── Props ────────────────────────────────────────────────────── */
interface DatePickerFilterProps {
  dateRange: DateRange;
  onFromChange: (from: string) => void;
  onToChange: (to: string) => void;
  onRangeChange: (range: DateRange) => void;
  onClear: () => void;
  hasDateFilter: boolean;
}

/* ── Component ────────────────────────────────────────────────── */
export function DatePickerFilter({
  dateRange,
  onFromChange,
  onToChange,
  onRangeChange,
  onClear,
  hasDateFilter,
}: DatePickerFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const today = useMemo(() => new Date(), []);
  const todayIso = isoDate(today);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [picking, setPicking] = useState<"from" | "to">("from");

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startDay = startDayOfMonth(viewYear, viewMonth);

  const handlePrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) { setViewYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    const now = new Date();
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    if (nextYear > now.getFullYear() || (nextYear === now.getFullYear() && nextMonth > now.getMonth())) return;
    setViewMonth(nextMonth);
    if (nextMonth === 0) setViewYear(nextYear);
  }, [viewMonth, viewYear]);

  const handleDayClick = useCallback(
    (dayIso: string) => {
      if (picking === "from") {
        onFromChange(dayIso);
        setPicking("to");
      } else {
        onToChange(dayIso);
        setPicking("from");
      }
    },
    [picking, onFromChange, onToChange],
  );

  const handlePreset = useCallback(
    (preset: DatePreset) => {
      // Presets compute fresh dates at call time (never stale)
      const range = preset.getRange();
      onRangeChange(range);
    },
    [onRangeChange],
  );

  const handleClear = useCallback(() => {
    onClear();
    setPicking("from");
  }, [onClear]);

  // Build calendar grid
  const calendarCells = useMemo(() => {
    const cells: { day: number; iso: string; isToday: boolean; isFuture: boolean; isFrom: boolean; isTo: boolean; inRange: boolean }[] = [];
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const iso = isoDate(date);
      const fromMs = dateRange.from ? new Date(dateRange.from).getTime() : null;
      const toMs = dateRange.to ? new Date(dateRange.to).getTime() : null;
      const dayMs = date.getTime();

      cells.push({
        day: d,
        iso,
        isToday: iso === todayIso,
        isFuture: dayMs > Date.now(),
        isFrom: iso === dateRange.from,
        isTo: iso === dateRange.to,
        inRange: fromMs !== null && toMs !== null && dayMs >= fromMs && dayMs <= toMs,
      });
    }
    return cells;
  }, [viewYear, viewMonth, totalDays, dateRange, todayIso]);

  const canGoNext = (() => {
    const now = new Date();
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    return nextYear < now.getFullYear() || (nextYear === now.getFullYear() && nextMonth <= now.getMonth());
  })();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
          hasDateFilter
            ? "bg-primary/15 text-primary border border-primary/30"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent"
        }`}
      >
        <CalendarIcon />
        <span className="hidden sm:inline">{hasDateFilter ? "Date set" : "Pick a date"}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 z-50 rounded-lg border border-border/60 bg-popover shadow-lg overflow-hidden">
          <div className="flex">
            {/* Presets sidebar */}
            <div className="w-[120px] border-r border-border/30 py-2 px-1.5 space-y-0.5">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePreset(preset)}
                  className="w-full text-left px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
              {hasDateFilter && (
                <button
                  onClick={handleClear}
                  className="w-full text-left px-2 py-1 text-[10px] text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer mt-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Calendar */}
            <div className="p-3 w-[260px]">
              {/* From/To indicators */}
              <div className="flex items-center gap-2 mb-2 text-[10px]">
                <button
                  onClick={() => setPicking("from")}
                  className={`flex-1 px-2 py-1 rounded text-center border transition-colors cursor-pointer ${
                    picking === "from"
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/30 text-muted-foreground"
                  }`}
                >
                  From: {dateRange.from || "—"}
                </button>
                <button
                  onClick={() => setPicking("to")}
                  className={`flex-1 px-2 py-1 rounded text-center border transition-colors cursor-pointer ${
                    picking === "to"
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/30 text-muted-foreground"
                  }`}
                >
                  To: {dateRange.to || "—"}
                </button>
              </div>

              {/* Month nav */}
              <div className="flex items-center justify-between mb-2">
                <button onClick={handlePrevMonth} className="p-0.5 rounded hover:bg-accent/50 cursor-pointer">
                  <ChevronLeft />
                </button>
                <span className="text-xs font-medium">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button
                  onClick={handleNextMonth}
                  disabled={!canGoNext}
                  className="p-0.5 rounded hover:bg-accent/50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-px mb-1">
                {DAY_HEADERS.map((d) => (
                  <div key={d} className="text-center text-[9px] text-muted-foreground/50 font-medium py-0.5">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-px">
                {/* Empty cells for start offset */}
                {Array.from({ length: startDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {calendarCells.map(({ day, iso, isToday, isFuture, isFrom, isTo, inRange }) => (
                  <button
                    key={day}
                    disabled={isFuture}
                    onClick={() => handleDayClick(iso)}
                    className={`
                      h-7 text-[11px] rounded transition-colors cursor-pointer
                      disabled:opacity-30 disabled:cursor-not-allowed
                      ${isFrom || isTo
                        ? "bg-primary text-primary-foreground font-semibold"
                        : inRange
                          ? "bg-primary/15 text-foreground"
                          : isToday
                            ? "ring-1 ring-primary/30 text-foreground"
                            : "text-foreground/70 hover:bg-accent/50"
                      }
                    `}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
