"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import type { SearchFilters } from "@/hooks/use-search";
import type { FeedCategory } from "@/config/feeds";

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

/* ── Props ────────────────────────────────────────────────────── */
interface SearchBarProps {
  filters: SearchFilters;
  onQueryChange: (query: string) => void;
  onCommitSearch: (term: string) => void;
  onFilterChange: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  recentSearches: string[];
  onRemoveRecent: (term: string) => void;
  onClearRecent: () => void;
  sourceNames: string[];
  datePicker?: ReactNode;
  tagBrowser?: ReactNode;
}

/* ── Component ────────────────────────────────────────────────── */
export function SearchBar({
  filters,
  onQueryChange,
  onCommitSearch,
  onFilterChange,
  onReset,
  hasActiveFilters,
  recentSearches,
  onRemoveRecent,
  onClearRecent,
  sourceNames,
  datePicker,
  tagBrowser,
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowFilters(false);
        setShowRecent(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onQueryChange(e.target.value);
    },
    [onQueryChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const val = filters.query.trim();
        if (val) onCommitSearch(val);
        setShowRecent(false);
      } else if (e.key === "Escape") {
        setShowRecent(false);
        inputRef.current?.blur();
      }
    },
    [filters.query, onCommitSearch],
  );

  const handleFocus = useCallback(() => {
    if (recentSearches.length > 0) setShowRecent(true);
  }, [recentSearches.length]);

  const handleRecentClick = useCallback(
    (term: string) => {
      onQueryChange(term);
      onCommitSearch(term);
      setShowRecent(false);
    },
    [onQueryChange, onCommitSearch],
  );

  const handleClearQuery = useCallback(() => {
    onQueryChange("");
    inputRef.current?.focus();
  }, [onQueryChange]);

  // Count active combined filters (excluding query)
  const filterCount = [
    filters.dateFrom,
    filters.dateTo,
    filters.category,
    filters.source,
    filters.language,
    filters.hasImage ? "1" : "",
  ].filter(Boolean).length;

  return (
    <div ref={wrapRef} className="relative flex items-center gap-1.5">
      {/* Search input */}
      <div className="relative flex-1 min-w-0">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={filters.query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Search articles..."
          className="w-full pl-8 pr-8 py-1.5 text-xs bg-background/60 border border-border/40 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 placeholder:text-muted-foreground/40 transition-colors"
        />
        {filters.query && (
          <button
            onClick={handleClearQuery}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors cursor-pointer"
            title="Clear search"
          >
            <XIcon />
          </button>
        )}

        {/* Recent searches dropdown */}
        {showRecent && recentSearches.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-md border border-border/60 bg-popover shadow-lg overflow-hidden">
            <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-border/30">
              <span className="text-[10px] text-muted-foreground/60">Recent</span>
              <button
                onClick={onClearRecent}
                className="text-[10px] text-muted-foreground/50 hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            </div>
            {recentSearches.map((term) => (
              <div key={term} className="flex items-center px-2.5 py-1 hover:bg-accent/40 group/recent">
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

      {/* Filters toggle */}
      <button
        onClick={() => { setShowFilters((v) => !v); setShowRecent(false); }}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
          showFilters || filterCount > 0
            ? "bg-primary/15 text-primary border border-primary/30"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent"
        }`}
        title="Filters"
      >
        <FilterIcon />
        <span className="hidden sm:inline">Filters</span>
        {filterCount > 0 && (
          <span className="ml-0.5 px-1 py-px rounded-full text-[9px] font-medium bg-primary/20">
            {filterCount}
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
          onClick={onReset}
          className="px-2 py-1.5 rounded-md text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
          title="Reset all filters"
        >
          Reset
        </button>
      )}

      {/* Filter panel dropdown */}
      {showFilters && (
        <div className="absolute top-full mt-1 left-0 z-50 w-[300px] sm:w-[340px] rounded-lg border border-border/60 bg-popover shadow-lg">
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
  );
}
