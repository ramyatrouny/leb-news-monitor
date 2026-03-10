"use client";

import { usePollFrequency, type PollIntervalSeconds } from "@/hooks/use-poll-frequency";
import { Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const POLL_OPTIONS: {
  label: string;
  value: PollIntervalSeconds;
  description: string;
}[] = [
  { label: "15s", value: 15, description: "Very fast" },
  { label: "30s", value: 30, description: "Fast (default)" },
  { label: "60s", value: 60, description: "Slow" },
  { label: "Manual", value: 0, description: "Manual refresh" },
];

export function PollFrequencyControl() {
  const { intervalSeconds, setInterval } = usePollFrequency();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [open]);

  const currentLabel =
    POLL_OPTIONS.find((o) => o.value === intervalSeconds)?.label || "30s";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border border-border/40 text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors whitespace-nowrap"
        title="Poll frequency - refresh interval"
      >
        <Zap size={14} />
        <span className="hidden sm:inline">{currentLabel}</span>
        <span className="sm:hidden">Poll</span>
      </button>

      {open && (
        <div className="fixed bg-card/95 backdrop-blur-sm border border-border/40 rounded-md shadow-lg z-[9999] min-w-40" style={{ top: `${position.top}px`, right: `${position.right}px` }}>
          {POLL_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setInterval(option.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-2.5 text-xs transition-colors border-b border-border/20 last:border-0 ${
                intervalSeconds === option.value
                  ? "bg-primary/20 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                {option.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
