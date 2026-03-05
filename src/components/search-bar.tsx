"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { FeedCategory } from "@/config/feeds";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ORDER,
} from "@/config/feeds";
import type { SearchFilters } from "@/hooks/use-search";
import type { ReactNode } from "react";

// Icons

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// Props

interface SearchBarProps {
  filters: SearchFilters;
  onQueryChange: (q: string) => void;
  onCommitSearch: (q: string) => void;
  onFilterChange: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  recentSearches: string[];
  onRemoveRecent: (term: string) => void;
  onClearRecent: () => void;
  sourceNames: string[];
  /** Slot for the date picker rendered next to the Filters button */
  datePicker?: ReactNode;
  /** Slot for the tag browser rendered next to the date picker */
  tagBrowser?: ReactNode;
}

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
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showRecent, setShowRecent] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Close recent dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowRecent(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onCommitSearch(filters.query);
        setShowRecent(false);
        inputRef.current?.blur();
      }
      if (e.key === "Escape") {
        setShowRecent(false);
        inputRef.current?.blur();
      }
    },
    [filters.query, onCommitSearch]
  );

  const handleRecentClick = useCallback(
    (term: string) => {
      onQueryChange(term);
      onCommitSearch(term);
      setShowRecent(false);
    },
    [onQueryChange, onCommitSearch]
  );

  const activeFilterCount = [
    filters.dateFrom,
    filters.dateTo,
    filters.category !== "all" ? filters.category : "",
    filters.source,
    filters.language !== "all" ? filters.language : "",
    filters.hasImage !== null ? "1" : "",
  ].filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center gap-2" ref={containerRef}>
        {/* Search input */}
        <div className="relative flex-1 max-w-xl">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search articles..."
            value={filters.query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setShowRecent(true)}
            onKeyDown={handleKeyDown}
            className="w-full h-8 pl-8 pr-8 rounded-md border border-border/50 bg-background/80 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => {
                onQueryChange("");
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer"
            >
              <XIcon />
            </button>
          )}

          {/* Recent searches dropdown */}
          {showRecent && recentSearches.length > 0 && !filters.query && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border border-border/50 bg-popover shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30">
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                  <ClockIcon />
                  Recent Searches
                </span>
                <button
                  type="button"
                  onClick={onClearRecent}
                  className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </div>
              <div className="p-1.5 flex flex-wrap gap-1">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleRecentClick(term)}
                    className="group flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                  >
                    <span>{term}</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRecent(term);
                      }}
                      className="opacity-0 group-hover:opacity-100 ml-0.5 hover:text-destructive transition-all cursor-pointer"
                    >
                      <XIcon className="w-2.5 h-2.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`shrink-0 h-8 px-2.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            showFilters || activeFilterCount > 0
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          <FilterIcon />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-semibold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Date picker (slot) */}
        {datePicker}

        {/* Tag browser (slot) */}
        {tagBrowser}

        {/* Reset all */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 h-8 px-2.5 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Combined filter panel */}
      {showFilters && (
        <div className="px-3 sm:px-4 pb-2.5 pt-0.5 flex flex-wrap items-end gap-x-4 gap-y-2 border-t border-border/20">
          {/* Date range */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium">
              From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange("dateFrom", e.target.value)}
              className="h-7 px-2 rounded border border-border/50 bg-background/80 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium">
              To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFilterChange("dateTo", e.target.value)}
              className="h-7 px-2 rounded border border-border/50 bg-background/80 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                onFilterChange("category", e.target.value as FeedCategory | "all")
              }
              className="h-7 px-2 pr-6 rounded border border-border/50 bg-background/80 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 4px center",
              }}
            >
              <option value="all">All</option>
              {CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium">
              Source
            </label>
            <select
              value={filters.source}
              onChange={(e) => onFilterChange("source", e.target.value)}
              className="h-7 px-2 pr-6 rounded border border-border/50 bg-background/80 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer appearance-none max-w-[140px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 4px center",
              }}
            >
              <option value="">All Sources</option>
              {sourceNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium">
              Language
            </label>
            <select
              value={filters.language}
              onChange={(e) =>
                onFilterChange("language", e.target.value as "all" | "en" | "ar")
              }
              className="h-7 px-2 pr-6 rounded border border-border/50 bg-background/80 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 4px center",
              }}
            >
              <option value="all">All</option>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </div>

          {/* Has image */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium">
              Has Image
            </label>
            <select
              value={filters.hasImage === null ? "any" : filters.hasImage ? "yes" : "no"}
              onChange={(e) => {
                const v = e.target.value;
                onFilterChange("hasImage", v === "any" ? null : v === "yes");
              }}
              className="h-7 px-2 pr-6 rounded border border-border/50 bg-background/80 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 4px center",
              }}
            >
              <option value="any">Any</option>
              <option value="yes">With image</option>
              <option value="no">Without image</option>
            </select>
          </div>

          {/* Active filter summary chips */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-1.5 ml-auto self-end">
              {filters.dateFrom && (
                <FilterChip label={`From: ${filters.dateFrom}`} onRemove={() => onFilterChange("dateFrom", "")} />
              )}
              {filters.dateTo && (
                <FilterChip label={`To: ${filters.dateTo}`} onRemove={() => onFilterChange("dateTo", "")} />
              )}
              {filters.category !== "all" && (
                <FilterChip
                  label={CATEGORY_LABELS[filters.category]}
                  color={CATEGORY_COLORS[filters.category]}
                  onRemove={() => onFilterChange("category", "all")}
                />
              )}
              {filters.source && (
                <FilterChip label={filters.source} onRemove={() => onFilterChange("source", "")} />
              )}
              {filters.language !== "all" && (
                <FilterChip
                  label={filters.language === "en" ? "English" : "Arabic"}
                  onRemove={() => onFilterChange("language", "all")}
                />
              )}
              {filters.hasImage !== null && (
                <FilterChip
                  label={filters.hasImage ? "Has image" : "No image"}
                  onRemove={() => onFilterChange("hasImage", null)}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Small filter chip used in the active filters summary in the SearchBar and in the source filter bar in the Feed component.

function FilterChip({
  label,
  color,
  onRemove,
}: {
  label: string;
  color?: string;
  onRemove: () => void;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary/80 text-muted-foreground border border-border/30"
      style={color ? { borderColor: `${color}40`, backgroundColor: `${color}15`, color } : undefined}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-destructive transition-colors cursor-pointer ml-0.5"
      >
        <XIcon className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}
