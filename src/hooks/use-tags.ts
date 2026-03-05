"use client";

import { useState, useMemo, useCallback } from "react";
import type { FeedItem } from "@/app/api/feeds/route";
import { tagArticles, applyTagFilter, type TagInfo } from "@/lib/entity-extractor";

export function useTags(items: FeedItem[]) {
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  // Auto-tag all articles
  const { tagMap, tagIndex } = useMemo(() => tagArticles(items), [items]);

  // Sorted tag list (by count descending, then alphabetically)
  const allTags: TagInfo[] = useMemo(() => {
    return [...tagIndex.values()].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag);
    });
  }, [tagIndex]);

  // Apply tag filter to items
  const filterByTags = useCallback(
    (items: FeedItem[]) => applyTagFilter(items, activeTags, tagMap),
    [activeTags, tagMap],
  );

  // Toggle a single tag
  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  // Set exactly one tag (for quick clicks)
  const selectOnly = useCallback((tag: string) => {
    setActiveTags((prev) => {
      // If tag is already the only selected → clear
      if (prev.size === 1 && prev.has(tag)) return new Set();
      return new Set([tag]);
    });
  }, []);

  const clearTags = useCallback(() => {
    setActiveTags(new Set());
  }, []);

  // Tags for a specific item
  const getItemTags = useCallback(
    (itemId: string): string[] => {
      const tags = tagMap.get(itemId);
      return tags ? [...tags] : [];
    },
    [tagMap],
  );

  return {
    activeTags,
    allTags,
    tagMap,
    toggleTag,
    selectOnly,
    clearTags,
    filterByTags,
    getItemTags,
    hasActiveTags: activeTags.size > 0,
  };
}
