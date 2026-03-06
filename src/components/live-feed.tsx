"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import type { FeedItem } from "@/app/api/feeds/route";
import { CATEGORY_ORDER, type FeedCategory } from "@/config/feeds";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";
import { useFeedPrefs } from "@/hooks/use-feed-prefs";
import { useFeedStream } from "@/hooks/use-feed-stream";
import { useLayout } from "@/hooks/use-layout";
import { AnnouncementBanner } from "./announcement-banner";
import { FeedHeader } from "./feed-header";
import { FeedFilterBar } from "./feed-filter-bar";
import { FeedContent } from "./feed-content";

const ITEMS_PER_PAGE = 30;

interface SourceGroup {
  color?: string;
  category: FeedCategory;
  items: FeedItem[];
}

export function LiveFeed() {
  const { items: allItems, newIds, sources: sourceCount, fetchedAt, isLoading, isStreaming } = useFeedStream();
  const { prefs, toggleSource, syncSources } = useFeedPrefs();
  const { layout } = useLayout();

  const [activeCategory, setActiveCategory] = useState<FeedCategory | "all">("all");
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Group items by source
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

  // Sync discovered sources into prefs
  useEffect(() => {
    if (!isStreaming && grouped.size > 0) {
      syncSources([...grouped.keys()]);
    }
  }, [isStreaming, grouped, syncSources]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!allItems.length) return [];
    return allItems.filter((item) => {
      if (prefs.hidden.has(item.source)) return false;
      if (activeCategory !== "all" && item.sourceCategory !== activeCategory) return false;
      if (activeSource && item.source !== activeSource) return false;
      return true;
    });
  }, [allItems, prefs.hidden, activeCategory, activeSource]);

  const visibleItems = filteredItems.slice(0, visibleCount);

  // Filter handlers
  const handleCategoryChange = useCallback((cat: FeedCategory | "all") => {
    setActiveCategory(cat);
    setActiveSource(null);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const handleSourceChange = useCallback((source: string | null) => {
    setActiveSource(source);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => {
      if (prev >= filteredItems.length) return prev;
      return Math.min(prev + ITEMS_PER_PAGE, filteredItems.length);
    });
  }, [filteredItems.length]);

  // Derived data for child components
  const allSourceInfo = useMemo(() => {
    return [...grouped.entries()].map(([name, { color, items, category }]) => ({
      name,
      color,
      count: items.length,
      category,
    }));
  }, [grouped]);

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

  return (
    <TooltipProvider>
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <FeedHeader
        visibleSourceCount={sourceChips.length}
        totalSourceCount={sourceCount}
        totalItems={allItems.length}
        fetchedAt={fetchedAt}
        isStreaming={isStreaming}
        sources={allSourceInfo}
        prefs={prefs}
        onToggleSource={toggleSource}
      />

      <AnnouncementBanner />

      <FeedFilterBar
        activeCategory={activeCategory}
        activeSource={activeSource}
        categoryCounts={categoryCounts}
        sourceChips={sourceChips}
        filteredCount={filteredItems.length}
        onCategoryChange={handleCategoryChange}
        onSourceChange={handleSourceChange}
      />

      <FeedContent
        items={visibleItems}
        newIds={newIds}
        filteredCount={filteredItems.length}
        visibleCount={visibleCount}
        layout={layout}
        isLoading={isLoading}
        hasData={grouped.size > 0}
        onLoadMore={handleLoadMore}
      />

      <footer className="hidden sm:flex shrink-0 px-4 py-1 border-t border-border/30 bg-secondary/10 items-center justify-between text-[9px] text-muted-foreground/40 uppercase tracking-widest">
        <span>Auto-refresh 30s</span>
        <Link href="/changelog" className="hover:text-muted-foreground transition-colors" title="View changelog" aria-label="View LEB Monitor changelog and updates">Changelog</Link>
        <span>LEB Monitor v1.0</span>
      </footer>
    </div>
    </TooltipProvider>
  );
}
