"use client";

import { useFocusMode, type FocusTimeRange } from "@/hooks/use-focus-mode";
import { Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const FOCUS_OPTIONS: {
  label: string;
  value: FocusTimeRange;
  icon?: string;
}[] = [
  { label: "All", value: "all" },
  { label: "Last 1h", value: "1h" },
  { label: "Last 6h", value: "6h" },
  { label: "Last 24h", value: "24h" },
  { label: "Last 7d", value: "7d" },
];

export function FocusModeFilter() {
  const { timeRange, setTimeRange } = useFocusMode();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
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

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border border-border/40 text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors whitespace-nowrap"
        title="Focus mode - filter by time range"
      >
        <Clock size={14} />
        <span>{FOCUS_OPTIONS.find((o) => o.value === timeRange)?.label}</span>
      </button>

      {open && (
        <div className="fixed bg-card/95 backdrop-blur-sm border border-border/40 rounded-md shadow-lg z-[9999] min-w-32" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
          {FOCUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setTimeRange(option.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-xs transition-colors ${
                timeRange === option.value
                  ? "bg-primary/20 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
