"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ORDER,
  type FeedCategory,
} from "@/config/feeds";
import type { SearchFilters } from "@/hooks/use-search";

/* ── Icons ────────────────────────────────────────────────────── */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/* ── Types ────────────────────────────────────────────────────── */
interface SourceChip {
  name: string;
  color?: string;
  count: number;
  category: FeedCategory;
}

interface FeedFilterBarProps {
  activeCategory: FeedCategory | "all";
  activeSource: string | null;
  categoryCounts: Record<string, number>;
  sourceChips: SourceChip[];
  filteredCount: number;
  onCategoryChange: (cat: FeedCategory | "all") => void;
  onSourceChange: (source: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  /** Search history & commit */
  onCommitSearch: (term: string) => void;
  recentSearches: string[];
  onRemoveRecent: (term: string) => void;
  onClearRecent: () => void;
  /** Advanced filters */
  filters: SearchFilters;
  onFilterChange: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  sourceNames: string[];
  /** Combined reset for all search/date/tag filters */
  onResetAll: () => void;
  hasActiveFilters: boolean;
  /** Slot elements */
  datePicker?: ReactNode;
  tagBrowser?: ReactNode;
}

export function FeedFilterBar({
  activeCategory,
  activeSource,
  categoryCounts,
  sourceChips,
  filteredCount,
  onCategoryChange,
  onSourceChange,
  searchQuery,
  onSearchChange,
  onCommitSearch,
  recentSearches,
  onRemoveRecent,
  onClearRecent,
  filters,
  onFilterChange,
  sourceNames,
  onResetAll,
  hasActiveFilters,
  datePicker,
  tagBrowser,
}: FeedFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setShowFilters(false);
        setShowRecent(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const val = searchQuery.trim();
        if (val) onCommitSearch(val);
        setShowRecent(false);
      } else if (e.key === "Escape") {
        setShowRecent(false);
        inputRef.current?.blur();
      }
    },
    [searchQuery, onCommitSearch],
  );

  const handleFocus = useCallback(() => {
    if (recentSearches.length > 0) setShowRecent(true);
  }, [recentSearches.length]);

  const handleRecentClick = useCallback(
    (term: string) => {
      onSearchChange(term);
      onCommitSearch(term);
      setShowRecent(false);
    },
    [onSearchChange, onCommitSearch],
  );

  const handleClearQuery = useCallback(() => {
    onSearchChange("");
    inputRef.current?.focus();
  }, [onSearchChange]);

  // Count active advanced filters (excluding query)
  const advancedFilterCount = [
    filters.dateFrom,
    filters.dateTo,
    filters.category,
    filters.source,
    filters.language,
    filters.hasImage ? "1" : "",
  ].filter(Boolean).length;

  const filteredSourceChips = sourceChips.filter((s) => {
    const categoryMatch = activeCategory === "all" || s.category === activeCategory;
    const searchMatch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="shrink-0 border-b border-border/40 bg-secondary/10 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {/* Search row — input + action buttons */}
      <div ref={searchWrapRef} className="px-3 sm:px-4 py-2.5 sm:py-2.5">
        <div className="flex items-center gap-1.5">
          {/* Search input with recent dropdown */}
          <div className="relative flex-1 min-w-0">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by feed or article title..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-background border border-border/60 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all hover:border-border/80"
            />
            {searchQuery && (
              <button
                onClick={handleClearQuery}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors cursor-pointer"
                title="Clear search"
              >
                <XIcon />
              </button>
            )}

            {/* Recent searches dropdown */}
            {showRecent && recentSearches.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-md border border-border/60 bg-popover shadow-lg overflow-hidden">
                <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-border/30">
                  <span className="text-[10px] text-muted-foreground/60">Recent searches</span>
                  <button
                    onClick={onClearRecent}
                    className="text-[10px] text-muted-foreground/50 hover:text-foreground cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
                {recentSearches.map((term) => (
                  <div key={term} className="flex items-center px-2.5 py-1.5 hover:bg-accent/40 group/recent">
                    <button
                      onClick={() => handleRecentClick(term)}
                      className="flex-1 text-left text-xs text-foreground/80 truncate cursor-pointer"
                    >
                      {term}
                    </button>
                    <button
                      onClick={() => onRemoveRecent(term)}
                      className="ml-1 opacity-0 group-hover/recent:opacity-100 text-muted-foreground/40 hover:text-foreground transition-opacity cursor-pointer"
                    >
                      <XIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Advanced filters toggle */}
          <button
            onClick={() => { setShowFilters((v) => !v); setShowRecent(false); }}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer ${
              showFilters || advancedFilterCount > 0
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent"
            }`}
            title="Advanced filters"
          >
            <FilterIcon />
            <span className="hidden sm:inline">Filters</span>
            {advancedFilterCount > 0 && (
              <span className="ml-0.5 px-1 py-px rounded-full text-[9px] font-medium bg-primary/20">
                {advancedFilterCount}
              </span>
            )}
          </button>

          {/* Date picker slot */}
          {datePicker}

          {/* Tag browser slot */}
          {tagBrowser}

          {/* Reset all */}
          {hasActiveFilters && (
            <button
              onClick={onResetAll}
              className="shrink-0 px-2 py-2 rounded-md text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              Reset
            </button>
          )}
        </div>

        {/* Advanced filter panel dropdown */}
        {showFilters && (
          <div className="absolute left-3 right-3 sm:left-auto sm:right-auto z-50 mt-1 w-auto sm:w-[340px] rounded-lg border border-border/60 bg-popover shadow-lg">
            <div className="p-3 space-y-3">
              {/* Category */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-1 block">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => onFilterChange("category", e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-background border border-border/40 rounded-md cursor-pointer"
                >
                  <option value="">All categories</option>
                  {(["war", "breaking", "general"] as FeedCategory[]).map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Source */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-1 block">
                  Source
                </label>
                <select
                  value={filters.source}
                  onChange={(e) => onFilterChange("source", e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-background border border-border/40 rounded-md cursor-pointer"
                >
                  <option value="">All sources</option>
                  {sourceNames.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-1 block">
                  Language
                </label>
                <select
                  value={filters.language}
                  onChange={(e) => onFilterChange("language", e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-background border border-border/40 rounded-md cursor-pointer"
                >
                  <option value="">All languages</option>
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>

              {/* Has image */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                  Has image
                </span>
                <button
                  onClick={() => onFilterChange("hasImage", !filters.hasImage)}
                  className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${
                    filters.hasImage ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                      filters.hasImage ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category tabs */}
      <div className="px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Filter by category">
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "all"}
          onClick={() => onCategoryChange("all")}
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
            onClick={() => onCategoryChange(cat)}
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

        <div className="ml-auto hidden sm:block text-[10px] text-muted-foreground/50 tabular-nums shrink-0">
          {filteredCount} results
        </div>
      </div>

      {/* Source chips */}
      <div className="px-3 sm:px-4 pb-1.5 sm:pb-2 flex items-center gap-1.5 sm:gap-1.5 overflow-x-auto">
        {activeSource && (
          <button
            type="button"
            onClick={() => onSourceChange(null)}
            className="shrink-0 px-2.5 py-1 sm:px-2 sm:py-0.5 rounded-full text-[11px] sm:text-[10px] font-medium bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}

        {filteredSourceChips
          .map((source) => (
            <button
              type="button"
              aria-pressed={activeSource === source.name}
              key={source.name}
              onClick={() => onSourceChange(activeSource === source.name ? null : source.name)}
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
  );
}
