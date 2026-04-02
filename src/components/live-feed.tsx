"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import type { FeedItem } from "@/app/api/feeds/route";
import { CATEGORY_ORDER, type FeedCategory } from "@/config/feeds";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";
import { useFeedPrefs } from "@/hooks/use-feed-prefs";
import { useFeedStream } from "@/hooks/use-feed-stream";
import { useLayout } from "@/hooks/use-layout";
import { useSearch, applySearchFilters, type SearchFilters } from "@/hooks/use-search";
import { useDateFilter, applyDateFilter } from "@/hooks/use-date-filter";
import { useTags } from "@/hooks/use-tags";
import { useTrending } from "@/hooks/use-trending";
import { AnnouncementBanner } from "./announcement-banner";
import { FeedHeader } from "./feed-header";
import { FeedFilterBar } from "./feed-filter-bar";
import { FeedContent } from "./feed-content";
import { DatePickerFilter } from "./date-picker-filter";
import { TagBrowser } from "./tag-browser";
import { TrendingBar } from "./trending-bar";

const ITEMS_PER_PAGE = 30;

const EMPTY_FILTERS: SearchFilters = {
  query: "",
  dateFrom: "",
  dateTo: "",
  category: "",
  source: "",
  language: "",
  hasImage: false,
};

interface SourceGroup {
  color?: string;
  category: FeedCategory;
  items: FeedItem[];
}

export function LiveFeed() {
  const { items: allItems, newIds, sources: sourceCount, fetchedAt, isLoading, isStreaming } = useFeedStream();
  const { prefs, toggleSource, syncSources } = useFeedPrefs();
  const { layout } = useLayout();

  // Search
  const { recentSearches, commitSearch, removeRecent, clearRecent } = useSearch();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(EMPTY_FILTERS);

  // Date filter
  const { dateRange, setFrom, setTo, setRange, clearDate, hasDateFilter } = useDateFilter();

  // Category & source filter (existing)
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

  // ── Filter pipeline ────────────────────────────────────────
  // Step 1: Remove hidden sources
  const afterHidden = useMemo(
    () => allItems.filter((item) => !prefs.hidden.has(item.source)),
    [allItems, prefs.hidden],
  );

  // Step 2: Category filter
  const afterCategory = useMemo(
    () =>
      activeCategory === "all"
        ? afterHidden
        : afterHidden.filter((item) => item.sourceCategory === activeCategory),
    [afterHidden, activeCategory],
  );

  // Step 3: Source filter
  const afterSource = useMemo(
    () =>
      activeSource
        ? afterCategory.filter((item) => item.source === activeSource)
        : afterCategory,
    [afterCategory, activeSource],
  );

  // Step 4: Search filters (text, category, source, language, image)
  const afterSearch = useMemo(
    () => applySearchFilters(afterSource, searchFilters),
    [afterSource, searchFilters],
  );

  // Step 5: Date filter
  const afterDate = useMemo(
    () => applyDateFilter(afterSearch, dateRange),
    [afterSearch, dateRange],
  );

  // Tags — computed on all items (not filtered), filter applied next
  const {
    activeTags,
    allTags,
    tagIndex,
    toggleTag,
    clearTags,
    filterByTags,
    getItemTags,
    hasActiveTags,
  } = useTags(allItems);

  // Step 6: Tag filter
  const filteredItems = useMemo(
    () => (hasActiveTags ? filterByTags(afterDate) : afterDate),
    [hasActiveTags, filterByTags, afterDate],
  );

  // Trending — computed on all items, decoupled from search
  const { keywords: trendingKeywords } = useTrending(allItems);

  const visibleItems = filteredItems.slice(0, visibleCount);

  // ── Handlers ───────────────────────────────────────────────
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

  // Search filter handlers
  const handleQueryChange = useCallback((query: string) => {
    setSearchFilters((prev) => ({ ...prev, query }));
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const handleCommitSearch = useCallback(
    (term: string) => {
      commitSearch(term);
    },
    [commitSearch],
  );

  const handleFilterChange = useCallback(
    <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
      setSearchFilters((prev) => ({ ...prev, [key]: value }));
      setVisibleCount(ITEMS_PER_PAGE);
    },
    [],
  );

  const handleResetFilters = useCallback(() => {
    setSearchFilters(EMPTY_FILTERS);
    clearDate();
    clearTags();
    setVisibleCount(ITEMS_PER_PAGE);
  }, [clearDate, clearTags]);

  const hasActiveSearchFilters = useMemo(() => {
    return (
      searchFilters.query !== "" ||
      searchFilters.category !== "" ||
      searchFilters.source !== "" ||
      searchFilters.language !== "" ||
      searchFilters.hasImage ||
      hasDateFilter ||
      hasActiveTags
    );
  }, [searchFilters, hasDateFilter, hasActiveTags]);

  // Trending keyword click → populate search (decoupled callback)
  const handleTrendingClick = useCallback((keyword: string) => {
    setSearchFilters((prev) => ({ ...prev, query: keyword }));
    commitSearch(keyword);
    setVisibleCount(ITEMS_PER_PAGE);
  }, [commitSearch]);

  // Tag click from card → toggle tag
  const handleCardTagClick = useCallback(
    (tag: string) => {
      toggleTag(tag);
    },
    [toggleTag],
  );

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

  const sourceNames = useMemo(
    () => [...grouped.keys()].filter((n) => !prefs.hidden.has(n)).sort(),
    [grouped, prefs.hidden],
  );

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

      {/* Trending bar */}
      {trendingKeywords.length > 0 && (
        <div className="shrink-0 border-b border-border/30 bg-secondary/5 px-3 sm:px-4">
          <TrendingBar
            keywords={trendingKeywords}
            onKeywordClick={handleTrendingClick}
          />
        </div>
      )}

      <FeedFilterBar
        activeCategory={activeCategory}
        activeSource={activeSource}
        categoryCounts={categoryCounts}
        sourceChips={sourceChips}
        filteredCount={filteredItems.length}
        onCategoryChange={handleCategoryChange}
        onSourceChange={handleSourceChange}
        searchQuery={searchFilters.query}
        onSearchChange={handleQueryChange}
        onCommitSearch={handleCommitSearch}
        recentSearches={recentSearches}
        onRemoveRecent={removeRecent}
        onClearRecent={clearRecent}
        filters={searchFilters}
        onFilterChange={handleFilterChange}
        sourceNames={sourceNames}
        onResetAll={handleResetFilters}
        hasActiveFilters={hasActiveSearchFilters}
        datePicker={
          <DatePickerFilter
            dateRange={dateRange}
            onFromChange={setFrom}
            onToChange={setTo}
            onRangeChange={setRange}
            onClear={clearDate}
            hasDateFilter={hasDateFilter}
          />
        }
        tagBrowser={
          <TagBrowser
            allTags={allTags}
            activeTags={activeTags}
            onToggleTag={toggleTag}
            onClear={clearTags}
            hasActiveTags={hasActiveTags}
          />
        }
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
        highlightQuery={searchFilters.query}
        getItemTags={getItemTags}
        tagIndex={tagIndex}
        onTagClick={handleCardTagClick}
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
