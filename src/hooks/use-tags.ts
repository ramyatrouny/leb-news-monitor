"use client";

import { useState, useMemo, useCallback } from "react";
import type { FeedItem } from "@/app/api/feeds/route";
import { tagArticles, applyTagFilter, type TagInfo } from "@/lib/entity-extractor";

export function useTags(items: FeedItem[]) {
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  // Auto-tag all articles (memoized on items reference)
  const { tagMap, tagIndex } = useMemo(() => tagArticles(items), [items]);

  // Sorted tag list (by count descending, then alphabetically)
  const allTags: TagInfo[] = useMemo(() => {
    return [...tagIndex.values()].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag);
    });
  }, [tagIndex]);

  const filterByTags = useCallback(
    (list: FeedItem[]) => applyTagFilter(list, activeTags, tagMap),
    [activeTags, tagMap],
  );

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const clearTags = useCallback(() => {
    setActiveTags(new Set());
  }, []);

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
    tagIndex,
    toggleTag,
    clearTags,
    filterByTags,
    getItemTags,
    hasActiveTags: activeTags.size > 0,
  };
}
