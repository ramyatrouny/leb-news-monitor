"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { TrendingKeyword } from "@/hooks/use-trending";

/* ── Icons ────────────────────────────────────────────────────── */
function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* ── Props ────────────────────────────────────────────────────── */
interface TrendingBarProps {
  keywords: TrendingKeyword[];
  onKeywordClick: (word: string) => void;
}

/* ── Component ────────────────────────────────────────────────── */
export function TrendingBar({ keywords, onKeywordClick }: TrendingBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
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
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  if (keywords.length === 0) return null;

  // Max count for scaling chip intensity
  const maxCount = keywords[0]?.count ?? 1;

  return (
    <div className="relative flex items-center gap-1.5">
      {/* Label */}
      <div className="shrink-0 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 select-none">
        <TrendingIcon className="text-primary/60" />
        <span className="hidden sm:inline">Trending</span>
      </div>

      {/* Left scroll arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-background/80 border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-pointer shadow-sm"
          aria-label="Scroll left"
        >
          <ChevronLeftIcon />
        </button>
      )}

      {/* Scrollable keyword chips */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {keywords.map(({ word, count }) => {
          // Intensity: scale from 40% to 100% based on relative count
          const intensity = 0.4 + 0.6 * (count / maxCount);
          return (
            <button
              key={word}
              type="button"
              onClick={() => onKeywordClick(word)}
              className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/8 hover:bg-primary/18 border border-primary/15 hover:border-primary/30 text-foreground/70 hover:text-foreground transition-all cursor-pointer"
              style={{ opacity: Math.max(intensity, 0.55) }}
              title={`"${word}" appears in ${count} article${count !== 1 ? "s" : ""} in the last hour`}
            >
              <span>{word}</span>
              <span className="text-[8px] text-muted-foreground/50 tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Right scroll arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-background/80 border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-pointer shadow-sm"
          aria-label="Scroll right"
        >
          <ChevronRightIcon />
        </button>
      )}
    </div>
  );
}
