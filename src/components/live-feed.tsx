"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import type { FeedItem } from "@/app/api/feeds/route";
import { CATEGORY_ORDER, type FeedCategory } from "@/config/feeds";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";
import { useFeedPrefs } from "@/hooks/use-feed-prefs";
import { useFeedStream } from "@/hooks/use-feed-stream";
import { useLayout } from "@/hooks/use-layout";
import { useFocusMode } from "@/hooks/use-focus-mode";
import { usePollFrequency } from "@/hooks/use-poll-frequency";
import { useSoundAlerts } from "@/hooks/use-sound-alerts";
import { isDateInRange } from "@/lib/date-picker-utils";
import { AnnouncementBanner } from "./announcement-banner";
import { FeedHeader } from "./feed-header";
import { FeedFilterBar } from "./feed-filter-bar";
import { FeedContent } from "./feed-content";
import { LiveTicker, LiveTickerToggle } from "./live-ticker";

const ITEMS_PER_PAGE = 30;

interface SourceGroup {
  color?: string;
  category: FeedCategory;
  items: FeedItem[];
}

export function LiveFeed() {
  const { items: allItems, newIds, sources: sourceCount, fetchedAt, isLoading, isStreaming, refetch } = useFeedStream();
  const { prefs, toggleSource, syncSources } = useFeedPrefs();
  const { layout } = useLayout();
  const { timeRange, getCutoff } = useFocusMode();
  const { intervalSeconds } = usePollFrequency();
  const { enabled: soundAlertsEnabled, playSound } = useSoundAlerts();

  const [activeCategory, setActiveCategory] = useState<FeedCategory | "all">("all");
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tickerVisible, setTickerVisible] = useState(true);
  const prevCountRef = useRef(0);

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
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        const matchesSource = item.source.toLowerCase().includes(lowerQuery);
        const matchesTitle = item.title?.toLowerCase().includes(lowerQuery) ?? false;
        if (!matchesSource && !matchesTitle) return false;
      }

      // Apply focus mode time filter
      const itemDate = new Date(item.pubDate);
      const cutoffDate = getCutoff();
      if (itemDate < cutoffDate) return false;

      // Apply date range filter
      // The date range is already normalized by the DatePickerFilter component
      // to ensure proper chronological order and time boundaries
      if (dateRange.start || dateRange.end) {
        const range = {
          start: dateRange.start || new Date(0),
          end: dateRange.end || new Date(),
        };
        if (!isDateInRange(itemDate, range)) return false;
      }

      return true;
    });
  }, [allItems, prefs.hidden, activeCategory, activeSource, searchQuery, getCutoff, dateRange]);

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

  /**
   * Handle manual refresh when polling is set to manual (intervalSeconds === 0)
   * Triggers a new fetch and shows visual feedback via spinner
   */
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

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

  // Sound alert for breaking news
  useEffect(() => {
    if (!soundAlertsEnabled) return;
    
    // Check if new breaking news articles have been added
    const currentCount = allItems.length;
    if (prevCountRef.current > 0 && currentCount > prevCountRef.current) {
      // Get the newly added items (they're at the beginning of allItems array)
      const newCount = currentCount - prevCountRef.current;
      const newArticles = allItems.slice(0, newCount);
      
      // Check if any new articles are breaking news
      const hasBreakingNews = newArticles.some(
        (item) => item.sourceCategory === "breaking" && !prefs.hidden.has(item.source)
      );
      
      if (hasBreakingNews) {
        playSound();
      }
    }
    
    prevCountRef.current = currentCount;
  }, [allItems, soundAlertsEnabled, prefs.hidden, playSound]);

  /**
   * Handle clicking on a ticker article to scroll to it in the feed
   */
  const handleTickerArticleClick = useCallback((article: FeedItem) => {
    // Set filters to show this article
    setActiveCategory("all");
    setActiveSource(null);
    setSearchQuery("");
    setVisibleCount(ITEMS_PER_PAGE);
    
    // Scroll to the article (ID-based)
    setTimeout(() => {
      const element = document.querySelector(`[data-article-id="${article.id}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }, []);

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
        onDateChange={(start, end) => setDateRange({ start, end })}
        onToggleSource={toggleSource}
        onManualRefresh={handleManualRefresh}
        isPollingManual={intervalSeconds === 0}
        isRefreshing={isRefreshing}
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
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onDateChange={(start, end) => setDateRange({ start, end })}
      />

      {/* Live Ticker - Shows latest articles scrolling horizontally */}
      {allItems.length > 0 && tickerVisible && (
        <LiveTicker
          items={allItems}
          onArticleClick={handleTickerArticleClick}
          onHide={() => setTickerVisible(false)}
          maxItems={15}
        />
      )}

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

      {/* Show ticker toggle when hidden */}
      {!tickerVisible && allItems.length > 0 && (
        <LiveTickerToggle onShow={() => setTickerVisible(true)} />
      )}

      <footer className="hidden sm:flex shrink-0 px-4 py-1 border-t border-border/30 bg-secondary/10 items-center justify-between text-[9px] text-muted-foreground/40 uppercase tracking-widest">
        <span>Auto-refresh 30s</span>
        <Link href="/changelog" className="hover:text-muted-foreground transition-colors" title="View changelog" aria-label="View LEB Monitor changelog and updates">Changelog</Link>
        <span>LEB Monitor v1.0</span>
      </footer>
    </div>
    </TooltipProvider>
  );
}
