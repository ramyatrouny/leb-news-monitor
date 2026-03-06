"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { FeedItem } from "@/app/api/feeds/route";

export interface SearchFilters {
  query: string;
  dateFrom: string;   
  dateTo: string;     
  category: string;
  source: string;  
  language: string;   
  hasImage: boolean;
}

const EMPTY_FILTERS: SearchFilters = {
  query: "",
  dateFrom: "",
  dateTo: "",
  category: "",
  source: "",
  language: "",
  hasImage: false,
};


const RECENT_KEY = "lebmon-recent-searches";
const MAX_RECENT = 8;

const recentListeners = new Set<() => void>();
let recentSnapshot: string[] | null = null;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getRecentSnapshot(): string[] {
  if (recentSnapshot === null) recentSnapshot = loadRecent();
  return recentSnapshot;
}

function getRecentServerSnapshot(): string[] {
  return [];
}

function subscribeRecent(cb: () => void) {
  recentListeners.add(cb);
  return () => {
    recentListeners.delete(cb);
  };
}

function emitRecentChange() {
  recentSnapshot = loadRecent();
  recentListeners.forEach((l) => l());
}

function addRecent(term: string) {
  const trimmed = term.trim();
  if (!trimmed) return;
  const current = loadRecent().filter((s) => s !== trimmed);
  current.unshift(trimmed);
  localStorage.setItem(RECENT_KEY, JSON.stringify(current.slice(0, MAX_RECENT)));
  emitRecentChange();
}

function removeRecentItem(term: string) {
  const current = loadRecent().filter((s) => s !== term);
  localStorage.setItem(RECENT_KEY, JSON.stringify(current));
  emitRecentChange();
}

function clearAllRecent() {
  localStorage.removeItem(RECENT_KEY);
  emitRecentChange();
}


const RTL_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

function detectLang(text: string): "ar" | "en" {
  // Count Arabic vs Latin chars in first 200 chars
  const sample = text.slice(0, 200);
  let ar = 0;
  let la = 0;
  for (const ch of sample) {
    if (RTL_RE.test(ch)) ar++;
    else if (/[a-zA-Z]/.test(ch)) la++;
  }
  return ar > la ? "ar" : "en";
}

export function applySearchFilters(
  items: FeedItem[],
  filters: SearchFilters,
): FeedItem[] {
  const { query, dateFrom, dateTo, category, source, language, hasImage } = filters;
  const lowerQ = query.trim().toLowerCase();

  return items.filter((item) => {
    // Text search
    if (lowerQ) {
      const inTitle = item.title.toLowerCase().includes(lowerQ);
      const inSnippet = item.snippet?.toLowerCase().includes(lowerQ);
      const inSource = item.source.toLowerCase().includes(lowerQ);
      if (!inTitle && !inSnippet && !inSource) return false;
    }

    // Date range
    if (dateFrom || dateTo) {
      const pubMs = new Date(item.pubDate).getTime();
      if (isNaN(pubMs)) return false;
      if (dateFrom && pubMs < new Date(dateFrom).getTime()) return false;
      if (dateTo && pubMs > new Date(dateTo).getTime() + 86400000 - 1) return false;
    }

    // Category
    if (category && item.sourceCategory !== category) return false;

    // Source
    if (source && item.source !== source) return false;

    // Language
    if (language) {
      const detected = detectLang(`${item.title} ${item.snippet}`);
      if (detected !== language) return false;
    }

    // Has image
    if (hasImage && !item.image) return false;

    return true;
  });
}

export function useSearch() {
  const recentSearches = useSyncExternalStore(
    subscribeRecent,
    getRecentSnapshot,
    getRecentServerSnapshot,
  );

  // Use module-level state so filters don't need useState
  // (they are local to the component that calls useSearch,
  //  but we use useState below via the returned setters)

  // We'll use a different approach: return filter state management
  // via useState in the calling component. Return just the helpers.

  const commitSearch = useCallback((term: string) => {
    addRecent(term);
  }, []);

  const removeRecent = useCallback((term: string) => {
    removeRecentItem(term);
  }, []);

  const clearRecent = useCallback(() => {
    clearAllRecent();
  }, []);

  return {
    recentSearches,
    commitSearch,
    removeRecent,
    clearRecent,
  };
}
