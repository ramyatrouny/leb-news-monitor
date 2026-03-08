"use client";

import Link from "next/link";
import { LayoutToggle } from "./layout-toggle";
import { FontSizeToggle } from "./font-size-toggle";
import { ThemeToggle } from "./theme-toggle";
import { FeedSettings } from "./feed-settings";
import { Bookmark } from "lucide-react";
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

          <LayoutToggle />
          <FontSizeToggle />
          <ThemeToggle />
          <Link
            href="/bookmarks"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            title="View bookmarks"
            aria-label="View bookmarks"
          >
            <Bookmark size={18} />
          </Link>
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
