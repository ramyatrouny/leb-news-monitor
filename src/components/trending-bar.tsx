"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import type { TrendingKeyword } from "@/hooks/use-trending";
function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* ── Props ────────────────────────────────────────────────────── */
interface TrendingBarProps {
  keywords: TrendingKeyword[];
  onKeywordClick: (keyword: string) => void;
}

/* ── Component ────────────────────────────────────────────────── */
export function TrendingBar({ keywords, onKeywordClick }: TrendingBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 2,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 2,
    });
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, keywords]);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  }, []);

  if (keywords.length === 0) return null;

  // Scale intensity to chip styles (opacity and boldness)
  const maxScore = keywords[0]?.score ?? 1;

  return (
    <div className="flex items-center gap-1.5 py-1.5 px-1 min-w-0">
      {/* Label */}
      <div className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
        <TrendingIcon className="text-primary/50" />
        <span className="hidden sm:inline">Trending</span>
      </div>

      {/* Left arrow */}
      {canScroll.left && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="shrink-0 p-0.5 rounded text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
          aria-label="Scroll trending left"
        >
          <ChevronLeftIcon />
        </button>
      )}

      {/* Scrollable keywords */}
      <div
        ref={scrollRef}
        className="flex items-center gap-1 overflow-x-auto scrollbar-none min-w-0"
      >
        {keywords.map(({ word, score, count }) => {
          const intensity = Math.max(0.5, score / maxScore);
          return (
            <button
              key={word}
              type="button"
              onClick={() => onKeywordClick(word)}
              className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border border-border/40 bg-accent/30 text-foreground/80 hover:bg-accent/60 hover:text-foreground transition-colors cursor-pointer whitespace-nowrap"
              style={{ opacity: 0.5 + intensity * 0.5 }}
              title={`"${word}" — ${count} article${count !== 1 ? "s" : ""}`}
            >
              <span style={{ fontWeight: intensity > 0.7 ? 600 : 400 }}>{word}</span>
              <span className="text-muted-foreground/40">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Right arrow */}
      {canScroll.right && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="shrink-0 p-0.5 rounded text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
          aria-label="Scroll trending right"
        >
          <ChevronRightIcon />
        </button>
      )}
    </div>
  );
}
