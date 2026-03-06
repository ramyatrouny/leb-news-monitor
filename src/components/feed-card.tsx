"use client";

import { memo, useState, useCallback, useSyncExternalStore } from "react";
import type { FeedItem } from "@/app/api/feeds/route";
import { useFeedCardContext } from "./feed-card-context";
import { ShareMenu } from "./share-menu";
import { ImageLightbox } from "./image-lightbox";
import { ReadingMode } from "./reading-mode";
import { estimateReadingTime, formatReadingTime } from "@/lib/reading-time";

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
  const [readingModeOpen, setReadingModeOpen] = useState(false);
  const showImage = item.image && !imgError;
  const ctx = useFeedCardContext();

  const bookmarked = ctx?.isBookmarked(item.id) ?? false;
  const inReadingList = ctx?.isInReadingList(item.id) ?? false;
  // Use full article word count if available (from reading mode extraction),
  // otherwise fall back to the RSS-based word count.
  const effectiveWordCount = ctx?.wordCountOverrides.get(item.link) ?? item.wordCount;
  const readingTime = estimateReadingTime(effectiveWordCount);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    ctx?.toggleBookmark(item);
  };

  const handleReadLater = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    ctx?.toggleReadingList(item);
  };

  const handleOpenReadingMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setReadingModeOpen(true);
  };

  const handleCloseReadingMode = useCallback(() => {
    setReadingModeOpen(false);
  }, []);

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
          {/* Source + time + reading time row */}
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
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 text-xs sm:text-[11px] font-medium text-muted-foreground/70 tabular-nums">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {formatReadingTime(readingTime)}
              </span>
              <span className="text-[11px] sm:text-[10px] text-muted-foreground/60 tabular-nums">
                {timeAgo(item.pubDate)}
              </span>
            </div>
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
              <div className="group/img relative shrink-0 w-14 h-14 sm:w-12 sm:h-12 rounded overflow-hidden bg-muted/30 mt-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  onError={() => setImgError(true)}
                />
                <ImageLightbox src={item.image!} alt={item.title} />
              </div>
            )}
          </div>

          {/* Action buttons row — always visible */}
          <div className="flex items-center gap-1 mt-2 -ml-1">
            {/* Bookmark */}
            <button
              type="button"
              onClick={handleBookmark}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                bookmarked
                  ? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
                  : "text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10"
              }`}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark article"}
              title={bookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Read later */}
            <button
              type="button"
              onClick={handleReadLater}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                inReadingList
                  ? "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
                  : "text-muted-foreground/60 hover:text-blue-500 hover:bg-blue-500/10"
              }`}
              aria-label={inReadingList ? "Remove from reading list" : "Add to reading list"}
              title={inReadingList ? "In reading list" : "Read later"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={inReadingList ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                {!inReadingList && <line x1="12" y1="7" x2="12" y2="13" />}
                {!inReadingList && <line x1="9" y1="10" x2="15" y2="10" />}
              </svg>
            </button>

            {/* Share */}
            <ShareMenu title={item.title} url={item.link} />

            {/* Read mode */}
            <button
              type="button"
              onClick={handleOpenReadingMode}
              className="p-1.5 rounded-md text-muted-foreground/60 hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors cursor-pointer"
              aria-label="Read article in reading mode"
              title="Reading mode"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </button>
          </div>
        </div>
      </article>

      {/* Reading mode modal — rendered outside the <a> wrapper */}
      {readingModeOpen && (
        <ReadingMode
          url={item.link}
          title={item.title}
          source={item.source}
          sourceColor={item.sourceColor}
          onClose={handleCloseReadingMode}
          onArticleLoaded={ctx?.onArticleLoaded}
        />
      )}
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
