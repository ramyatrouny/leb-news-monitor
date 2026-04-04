"use client";

import { LayoutToggle } from "./layout-toggle";
import { FontSizeToggle } from "./font-size-toggle";
import { ThemeToggle } from "./theme-toggle";
import { FeedSettings } from "./feed-settings";
import type { FeedPrefs } from "@/hooks/use-feed-prefs";
import type { FeedCategory } from "@/config/feeds";

interface SourceInfo {
  name: string;
  color?: string;
  count: number;
  category: FeedCategory;
}

interface FeedHeaderProps {
  visibleSourceCount: number;
  totalSourceCount: number;
  totalItems: number;
  fetchedAt: string;
  isStreaming: boolean;
  sources: SourceInfo[];
  prefs: FeedPrefs;
  onToggleSource: (source: string) => void;
  bookmarkCount: number;
  readingListCount: number;
}

export function FeedHeader({
  visibleSourceCount,
  totalSourceCount,
  totalItems,
  fetchedAt,
  isStreaming,
  sources,
  prefs,
  onToggleSource,
  bookmarkCount,
  readingListCount,
}: FeedHeaderProps) {
  return (
    <header className="shrink-0 border-b border-border/50 bg-secondary/20 backdrop-blur-sm pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <div className="px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="live-dot w-2 h-2 rounded-full bg-primary" />
            <h1 className="text-sm font-bold tracking-tight uppercase">
              LEB<span className="text-primary">MONITOR</span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="h-3 w-px bg-border/50" />
            <span className="text-[10px] text-muted-foreground tracking-wide">
              Conflict Monitor
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isStreaming && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 border border-amber-500/50 border-t-amber-500 rounded-full animate-spin" />
              <span className="hidden sm:inline text-[10px] text-amber-500/80 uppercase tracking-wider">
                Streaming
              </span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground tabular-nums">
            <span>
              <strong className="text-foreground/70">{visibleSourceCount}</strong>
              <span className="text-muted-foreground/50">/{totalSourceCount}</span>{" "}
              sources
            </span>
            <span>
              <strong className="text-foreground/70">{totalItems}</strong>{" "}
              articles
            </span>
            {fetchedAt && (
              <span>
                {new Date(fetchedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            )}
          </div>

          <span className="sm:hidden text-xs text-muted-foreground tabular-nums">
            {totalItems}
          </span>

          {/* Bookmarks & Reading List nav */}
          {(bookmarkCount > 0 || readingListCount > 0) && (
            <a
              href="/reading-list"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/40 hover:border-border/60 hover:bg-accent/40 transition-colors text-muted-foreground hover:text-foreground"
              title="View saved articles"
            >
              {bookmarkCount > 0 && (
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" className="text-red-500">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span className="text-[11px] font-semibold tabular-nums">{bookmarkCount}</span>
                </span>
              )}
              {bookmarkCount > 0 && readingListCount > 0 && (
                <div className="w-px h-3 bg-border/50" />
              )}
              {readingListCount > 0 && (
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" className="text-blue-500">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                  </svg>
                  <span className="text-[11px] font-semibold tabular-nums">{readingListCount}</span>
                </span>
              )}
            </a>
          )}

          <LayoutToggle />
          <FontSizeToggle />
          <ThemeToggle />
          <FeedSettings
            sources={sources}
            prefs={prefs}
            onToggle={onToggleSource}
          />
        </div>
      </div>
    </header>
  );
}
