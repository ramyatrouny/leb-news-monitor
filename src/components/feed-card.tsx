"use client";

import { memo, useState, useSyncExternalStore } from "react";
import type { FeedItem } from "@/app/api/feeds/route";

/** Shared minute-tick store — all FeedCards subscribe to a single interval */
let tick = 0;
const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function subscribeTimeTick(cb: () => void) {
  listeners.add(cb);
  if (listeners.size === 1) {
    intervalId = setInterval(() => {
      tick++;
      listeners.forEach((l) => l());
    }, 60_000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getTimeTick() {
  return tick;
}

const RTL_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

function isRtl(text: string): boolean {
  return RTL_REGEX.test(text);
}

function timeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  if (!dateStr || isNaN(then)) return "—";
  const diffSec = Math.floor((Date.now() - then) / 1000);

  if (diffSec < 60) return "now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  return `${Math.floor(diffSec / 86400)}d`;
}

export const FeedCard = memo(function FeedCard({
  item,
  isNew,
}: {
  item: FeedItem;
  isNew?: boolean;
}) {
  useSyncExternalStore(subscribeTimeTick, getTimeTick, getTimeTick);
  const rtl = isRtl(item.title);
  const [imgError, setImgError] = useState(false);
  const showImage = item.image && !imgError;

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer ugc"
      className={`block group${isNew ? " card-enter" : ""}`}
      title={`Read: ${item.title} - from ${item.source}`}
      aria-label={`Read full article: ${item.title} on ${item.source}`}
    >
      <article className="relative h-full rounded-lg border border-border/40 bg-card/50 active:bg-accent/50 hover:bg-accent/40 hover:border-border/60 transition-colors duration-150 overflow-hidden">
        {/* Accent bar (left edge) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ backgroundColor: item.sourceColor || "oklch(0.65 0.22 25)" }}
        />

        <div className="px-3.5 py-3 sm:px-3 sm:py-2.5">
          {/* Source + time row */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.sourceColor || "oklch(0.50 0 0)" }}
              />
              <span
                className="feed-source font-semibold uppercase tracking-wider truncate"
                style={{ color: item.sourceColor || "oklch(0.65 0.22 25)" }}
              >
                {item.source}
              </span>
            </div>
            <span className="text-[11px] sm:text-[10px] text-muted-foreground/60 tabular-nums shrink-0">
              {timeAgo(item.pubDate)}
            </span>
          </div>

          {/* Content: text + optional thumbnail */}
          <div className="flex gap-3 sm:gap-2.5">
            <div className="flex-1 min-w-0">
              <h3
                className="feed-title font-medium leading-[1.4] text-foreground/90 group-hover:text-foreground transition-colors line-clamp-2"
                dir={rtl ? "rtl" : "ltr"}
                lang={rtl ? "ar" : undefined}
              >
                {item.title}
              </h3>

              {item.snippet && (
                <p
                  className="feed-snippet mt-1 leading-normal text-muted-foreground line-clamp-2"
                  dir={rtl ? "rtl" : "ltr"}
                  lang={rtl ? "ar" : undefined}
                >
                  {item.snippet}
                </p>
              )}
            </div>

            {showImage && (
              <div className="shrink-0 w-14 h-14 sm:w-12 sm:h-12 rounded overflow-hidden bg-muted/30 mt-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  onError={() => setImgError(true)}
                />
              </div>
            )}
          </div>
        </div>
      </article>
    </a>
  );
});

export function FeedCardSkeleton() {
  return (
    <div className="rounded-lg border border-border/40 bg-card/50 px-3 py-2.5">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-2 h-2 rounded-full bg-muted/50 animate-pulse" />
        <div className="h-2.5 w-16 rounded-sm bg-muted/40 animate-pulse" />
        <div className="flex-1" />
        <div className="h-2.5 w-6 rounded-sm bg-muted/30 animate-pulse" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3.5 w-full rounded-sm bg-muted/40 animate-pulse" />
        <div className="h-3.5 w-3/4 rounded-sm bg-muted/40 animate-pulse" />
        <div className="h-2.5 w-1/2 rounded-sm bg-muted/30 animate-pulse" />
      </div>
    </div>
  );
}
