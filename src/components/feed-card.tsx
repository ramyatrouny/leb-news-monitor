"use client";

import { memo, useState, useSyncExternalStore, useEffect } from "react";
import type { FeedItem } from "@/app/api/feeds/route";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useReadingHistory } from "@/hooks/use-reading-history";
import { calculateReadTime } from "@/lib/read-time";
import { Bookmark, CheckCircle2, BookOpen } from "lucide-react";
import { ArticleReader, useArticleReader } from "@/components/article-reader";
import { ArticleShareButton } from "@/components/article-share-button";

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
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isVisited, markAsVisited } = useReadingHistory();
  const bookmarked = isBookmarked(item.id);
  const visited = isVisited(item.id);
  
  // Article reader state
  const { article: readerArticle, isOpen, openArticle, closeArticle } = useArticleReader();
  
  // Calculate read time from snippet
  const readTime = calculateReadTime(item.snippet);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(item);
  };

  const handleReadInApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markAsVisited(item.id, item);
    openArticle(item);
  };

  const handleCardClick = () => {
    markAsVisited(item.id, item);
    window.open(item.link, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <article
        data-article-id={item.id}
        onClick={handleCardClick}
        className={`block group${isNew ? " card-enter" : ""} relative h-full rounded-lg border border-border/40 bg-card/50 active:bg-accent/50 hover:bg-accent/40 hover:border-border/60 transition-colors duration-150 overflow-hidden cursor-pointer`}
        title={`Read: ${item.title} - from ${item.source}`}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
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

              {/* Read time + Action buttons */}
              <div className="flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-1">
                  {visited && <CheckCircle2 size={12} className="text-green-600/70" />}
                  <span className={`text-[10px] sm:text-[9px] ${
                    visited ? "text-muted-foreground/40" : "text-muted-foreground/60"
                  }`}>
                    {readTime} min read
                  </span>
                </div>

                {/* Action buttons group */}
                <div className="flex items-center gap-0.5">
                  {/* Read in app button */}
                  <button
                    onClick={handleReadInApp}
                    className="inline-flex items-center justify-center w-5 h-5 rounded transition-colors text-muted-foreground/40 hover:text-foreground/70 hover:bg-accent/50"
                    title="Read in app"
                    aria-label="Read article in app"
                  >
                    <BookOpen size={14} />
                  </button>

                  {/* Share button */}
                  <ArticleShareButton
                    article={item}
                    variant="icon"
                    size="xs"
                    className="text-muted-foreground/40 hover:text-foreground/70"
                  />

                  {/* Bookmark button */}
                  <button
                    onClick={handleBookmarkClick}
                    className={`inline-flex items-center justify-center w-5 h-5 rounded transition-colors ${
                      bookmarked
                        ? "text-amber-500 hover:text-amber-600"
                        : "text-muted-foreground/40 hover:text-muted-foreground/70"
                    }`}
                    title={bookmarked ? "Remove bookmark" : "Add bookmark"}
                    aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
                  >
                    <Bookmark
                      size={14}
                      className={bookmarked ? "fill-current" : ""}
                    />
                  </button>
                </div>
              </div>
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

      {/* Article Reader - Full-page view */}
      {isOpen && readerArticle && (
        <ArticleReader
          article={readerArticle}
          onClose={closeArticle}
        />
      )}
    </>
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
