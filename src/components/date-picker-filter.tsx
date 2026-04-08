"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import {
  parseInputDate,
  formatDateForDisplay,
  normalizeDateRange,
} from "@/lib/date-picker-utils";

interface DatePickerFilterProps {
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  isActive: boolean;
}

export function DatePickerFilter({ onDateChange, isActive }: DatePickerFilterProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [open]);

  /**
   * Handle apply action
   * Parses the selected dates and normalizes them to ensure proper date range
   * (handles swapped dates, time boundaries, etc.)
   */
  const handleApply = () => {
    // Parse the input date strings to Date objects
    const start = startDate ? parseInputDate(startDate) : null;
    const end = endDate ? parseInputDate(endDate) : null;

    // Normalize the date range to handle edge cases
    // (swapped dates, time boundaries, today handling)
    const normalized = normalizeDateRange(start, end);

    // Pass the normalized range or null dates if nothing is selected
    if (normalized) {
      onDateChange(normalized.start, normalized.end);
    } else {
      onDateChange(null, null);
    }

    setOpen(false);
  };

  /**
   * Handle reset action
   * Clears all date selections and removes date filtering
   */
  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    onDateChange(null, null);
    setOpen(false);
  };

  // Display text for the button
  // Shows the selected date range in a readable format
  const displayText =
    startDate || endDate
      ? `${startDate ? formatDateForDisplay(parseInputDate(startDate)) : "Start"} → ${
          endDate ? formatDateForDisplay(parseInputDate(endDate)) : "End"
        }`
      : "Date range";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap ${
          isActive
            ? "border-primary/40 bg-primary/10 text-foreground"
            : "border-border/40 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
        }`}
        title="Filter by date range"
      >
        <Calendar size={14} />
        <span className="hidden sm:inline">{displayText}</span>
        <span className="sm:hidden">Dates</span>
      </button>

      {open && (
        <div className="fixed bg-card/95 backdrop-blur-sm border border-border/40 rounded-md shadow-lg z-[9999] p-3 min-w-80" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-border/40 text-xs bg-background text-foreground focus:outline-none focus:border-primary/40"
              />
              <p className="text-[10px] text-muted-foreground/50 mt-1">
                Earliest date to include
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-border/40 text-xs bg-background text-foreground focus:outline-none focus:border-primary/40"
              />
              <p className="text-[10px] text-muted-foreground/50 mt-1">
                Latest date to include
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleApply}
                className="flex-1 px-2 py-1.5 rounded text-xs font-medium bg-primary/20 text-foreground hover:bg-primary/30 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-2 py-1.5 rounded text-xs font-medium border border-border/40 text-muted-foreground hover:bg-accent/40 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
