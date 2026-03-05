"use client";

import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import type { FeedItem } from "@/app/api/feeds/route";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ORDER,
  type FeedCategory,
} from "@/config/feeds";
import { FeedCard, FeedCardSkeleton } from "./feed-card";
import { FeedSettings } from "./feed-settings";
import { ThemeToggle } from "./theme-toggle";
import { AnnouncementBanner } from "./announcement-banner";
import { useFeedPrefs } from "@/hooks/use-feed-prefs";
import { useFeedStream } from "@/hooks/use-feed-stream";

const ITEMS_PER_PAGE = 30;

interface SourceGroup {
  color?: string;
  category: FeedCategory;
  items: FeedItem[];
}

export function LiveFeed() {
  const { items: allItems, newIds, sources: sourceCount, fetchedAt, isLoading, isStreaming } = useFeedStream();

  const { prefs, toggleSource, syncSources } = useFeedPrefs();

  // Filter state
  const [activeCategory, setActiveCategory] = useState<FeedCategory | "all">("all");
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Refs for infinite scroll
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group items by source for settings/stats
  const grouped = useMemo(() => {
    if (!allItems.length) return new Map<string, SourceGroup>();
    const map = new Map<string, SourceGroup>();
    for (const item of allItems) {
      const existing = map.get(item.source);
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(item.source, {
          color: item.sourceColor,
          category: item.sourceCategory || "general",
          items: [item],
        });
      }
    }
    return map;
  }, [allItems]);

  // Sync discovered sources into prefs (only after streaming completes)
  useEffect(() => {
    if (!isStreaming && grouped.size > 0) {
      syncSources([...grouped.keys()]);
    }
  }, [isStreaming, grouped, syncSources]);

  // Filtered + sorted items (single flat list)
  const filteredItems = useMemo(() => {
    if (!allItems.length) return [];

    return allItems.filter((item) => {
      if (prefs.hidden.has(item.source)) return false;
      if (activeCategory !== "all" && item.sourceCategory !== activeCategory) return false;
      if (activeSource && item.source !== activeSource) return false;
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        const matchesSource = item.source.toLowerCase().includes(lowerQuery);
        const matchesTitle = item.title?.toLowerCase().includes(lowerQuery) ?? false;
        if (!matchesSource && !matchesTitle) return false;
      }
      return true;
    });
  }, [allItems, prefs.hidden, activeCategory, activeSource, searchQuery]);

  // Reset visible count when filters change
  const handleCategoryChange = useCallback((cat: FeedCategory | "all") => {
    setActiveCategory(cat);
    setActiveSource(null);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const handleSourceChange = useCallback((source: string | null) => {
    setActiveSource(source);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  // Infinite scroll observer
  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting) {
        setVisibleCount((prev) => {
          const total = filteredItems.length;
          if (prev >= total) return prev;
          return Math.min(prev + ITEMS_PER_PAGE, total);
        });
      }
    },
    [filteredItems.length]
  );

  // Attach observer via callback ref
  const prevObserverRef = useRef<IntersectionObserver | null>(null);
  const attachObserver = useCallback(
    (el: HTMLDivElement | null) => {
      prevObserverRef.current?.disconnect();
      if (!el) return;
      const observer = new IntersectionObserver(observerCallback, {
        root: scrollRef.current,
        threshold: 0.1,
      });
      observer.observe(el);
      prevObserverRef.current = observer;
    },
    [observerCallback]
  );

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  // Source info for settings panel
  const allSourceInfo = useMemo(() => {
    return [...grouped.entries()].map(([name, { color, items, category }]) => ({
      name,
      color,
      count: items.length,
      category,
    }));
  }, [grouped]);

  // Source chips — visible sources with counts
  const sourceChips = useMemo(() => {
    const chips: { name: string; color?: string; count: number; category: FeedCategory }[] = [];
    for (const cat of CATEGORY_ORDER) {
      for (const [name, group] of grouped) {
        if (group.category === cat && !prefs.hidden.has(name)) {
          chips.push({ name, color: group.color, count: group.items.length, category: cat });
        }
      }
    }
    return chips;
  }, [grouped, prefs.hidden]);

  // Category counts for tab badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    for (const cat of CATEGORY_ORDER) counts[cat] = 0;

    for (const item of allItems) {
      if (prefs.hidden.has(item.source)) continue;
      counts.all++;
      const cat = item.sourceCategory || "general";
      if (cat in counts) counts[cat]++;
    }
    return counts;
  }, [allItems, prefs.hidden]);

  const visibleSourceCount = sourceChips.length;
  const totalItems = allItems.length;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* ── Top Bar ── */}
      <header className="shrink-0 border-b border-border/50 bg-secondary/20 backdrop-blur-sm pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <div className="px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div className="live-dot w-2 h-2 rounded-full bg-primary" />
              <h1 className="text-sm font-bold tracking-tight uppercase">
                LEB<span className="text-primary">MON</span>
              </h1>
            </div>
            {/* Subtitle: hidden on mobile to save space */}
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

            {/* Stats: hidden on mobile, visible on sm+ */}
            <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground tabular-nums">
              <span>
                <strong className="text-foreground/70">{visibleSourceCount}</strong>
                <span className="text-muted-foreground/50">/{sourceCount}</span>{" "}
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

            {/* Compact article count on mobile only */}
            <span className="sm:hidden text-xs text-muted-foreground tabular-nums">
              {totalItems}
            </span>

            <ThemeToggle />
            <FeedSettings
              sources={allSourceInfo}
              prefs={prefs}
              onToggle={toggleSource}
            />
          </div>
        </div>
      </header>

      <AnnouncementBanner />

      {/* ── Filter Bar ── */}
      <div className="shrink-0 border-b border-border/40 bg-secondary/10 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {/* Search bar */}
        <div className="px-3 sm:px-4 py-2 sm:py-2">
          <input
            type="text"
            placeholder="Search by feed or article title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 rounded-md bg-background border border-border/40 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
          />
        </div>

        {/* Category tabs */}
        <div className="px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Filter by category">
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === "all"}
            onClick={() => handleCategoryChange("all")}
            className={`shrink-0 px-3 py-1.5 sm:py-1 rounded-full text-xs sm:text-[11px] font-medium tracking-wide transition-colors cursor-pointer ${
              activeCategory === "all"
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            All
            <span className="ml-1.5 text-[10px] sm:text-[9px] opacity-60 tabular-nums">
              {categoryCounts.all}
            </span>
          </button>

          {CATEGORY_ORDER.map((cat) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`shrink-0 px-3 py-1.5 sm:py-1 rounded-full text-xs sm:text-[11px] font-medium tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70 hover:bg-foreground/5"
              }`}
              style={
                activeCategory === cat
                  ? { backgroundColor: `${CATEGORY_COLORS[cat]}20`, color: CATEGORY_COLORS[cat] }
                  : undefined
              }
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
              />
              {CATEGORY_LABELS[cat]}
              <span className="text-[10px] sm:text-[9px] opacity-60 tabular-nums">
                {categoryCounts[cat]}
              </span>
            </button>
          ))}

          {/* Result count: desktop only */}
          <div className="ml-auto hidden sm:block text-[10px] text-muted-foreground/50 tabular-nums shrink-0">
            {filteredItems.length} results
          </div>
        </div>

        {/* Source chips */}
        <div className="px-3 sm:px-4 pb-1.5 sm:pb-2 flex items-center gap-1.5 sm:gap-1.5 overflow-x-auto">
          {activeSource && (
            <button
              type="button"
              onClick={() => handleSourceChange(null)}
              className="shrink-0 px-2.5 py-1 sm:px-2 sm:py-0.5 rounded-full text-[11px] sm:text-[10px] font-medium bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}

          {sourceChips
            .filter((s) => {
              const categoryMatch = activeCategory === "all" || s.category === activeCategory;
              const searchMatch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase());
              return categoryMatch && searchMatch;
            })
            .map((source) => (
              <button
                type="button"
                aria-pressed={activeSource === source.name}
                key={source.name}
                onClick={() => handleSourceChange(activeSource === source.name ? null : source.name)}
                className={`shrink-0 px-2.5 py-1 sm:px-2 sm:py-0.5 rounded-full text-[11px] sm:text-[10px] transition-colors flex items-center gap-1 border cursor-pointer ${
                  activeSource === source.name
                    ? "bg-foreground/10 text-foreground border-foreground/20"
                    : "text-muted-foreground/70 hover:text-muted-foreground border-border/40 hover:border-border/60"
                }`}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: source.color || "oklch(0.50 0 0)" }}
                />
                {source.name}
                <span className="text-[10px] sm:text-[9px] opacity-50 tabular-nums">
                  {source.count}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* ── Card Grid ── */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        <div className="p-2.5 sm:p-4">
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <FeedCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!isLoading && visibleItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
              {visibleItems.map((item) => (
                <FeedCard key={item.id} item={item} isNew={newIds.has(item.id)} />
              ))}
            </div>
          )}

          {hasMore && (
            <div ref={attachObserver} className="py-6">
              <div className="flex items-center justify-center gap-2 text-xs sm:text-[10px] text-muted-foreground">
                <div className="w-3 h-3 border border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                Loading more...
              </div>
            </div>
          )}

          {!hasMore && visibleItems.length > 0 && (
            <div className="py-6 text-center pb-[env(safe-area-inset-bottom)]">
              <span className="text-xs sm:text-[10px] text-muted-foreground/40">
                End of feed — {filteredItems.length} articles
              </span>
            </div>
          )}

          {!isLoading && filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-20">
              {grouped.size > 0 ? (
                <>
                  <p className="text-sm sm:text-xs text-muted-foreground">
                    No articles match current filters.
                  </p>
                  <p className="text-xs sm:text-[10px] text-muted-foreground/60">
                    Try a different category or clear the source filter.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-muted-foreground/50 rounded-full animate-spin" />
                  <p className="text-sm sm:text-xs text-muted-foreground">
                    Waiting for feeds...
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Bottom status bar — hidden on mobile to maximize content space ── */}
      <footer className="hidden sm:flex shrink-0 px-4 py-1 border-t border-border/30 bg-secondary/10 items-center justify-between text-[9px] text-muted-foreground/40 uppercase tracking-widest">
        <span>Auto-refresh 30s</span>
        <span>LEB Monitor v1.0</span>
      </footer>
    </div>
  );
}
