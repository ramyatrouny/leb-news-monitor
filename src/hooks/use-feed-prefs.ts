"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "lebmon-feed-prefs";

export interface FeedPrefs {
  /** Source names in desired display order */
  order: string[];
  /** Source names that are hidden */
  hidden: Set<string>;
}

const DEFAULT_PREFS: FeedPrefs = { order: [], hidden: new Set() };

function loadPrefs(): FeedPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { order: [], hidden: new Set() };
    const parsed = JSON.parse(raw);
    return {
      order: parsed.order ?? [],
      hidden: new Set(parsed.hidden ?? []),
    };
  } catch {
    return { order: [], hidden: new Set() };
  }
}

function savePrefs(prefs: FeedPrefs) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      order: prefs.order,
      hidden: [...prefs.hidden],
    })
  );
}

// Cache the snapshot so useSyncExternalStore gets a stable reference.
// Only refresh when emitChange() is called after a mutation.
let cachedSnapshot: FeedPrefs = DEFAULT_PREFS;
let snapshotInitialized = false;

function getSnapshot(): FeedPrefs {
  if (!snapshotInitialized) {
    cachedSnapshot = loadPrefs();
    snapshotInitialized = true;
  }
  return cachedSnapshot;
}

function getServerSnapshot(): FeedPrefs {
  return DEFAULT_PREFS;
}

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function emitChange() {
  cachedSnapshot = loadPrefs();
  listeners.forEach((l) => l());
}

export function useFeedPrefs() {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleSource = useCallback((source: string) => {
    const current = loadPrefs();
    const next = { order: [...current.order], hidden: new Set(current.hidden) };
    if (next.hidden.has(source)) {
      next.hidden.delete(source);
    } else {
      next.hidden.add(source);
    }
    savePrefs(next);
    emitChange();
  }, []);

  const moveSource = useCallback((source: string, direction: "up" | "down") => {
    const current = loadPrefs();
    const order = [...current.order];
    const idx = order.indexOf(source);
    if (idx === -1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= order.length) return;

    [order[idx], order[swapIdx]] = [order[swapIdx], order[idx]];
    const next = { order, hidden: new Set(current.hidden) };
    savePrefs(next);
    emitChange();
  }, []);

  const syncSources = useCallback((sources: string[]) => {
    const current = loadPrefs();
    const existing = new Set(current.order);
    const newSources = sources.filter((s) => !existing.has(s));
    if (newSources.length === 0 && current.order.length === sources.length) return;

    const order = [...current.order.filter((s) => sources.includes(s)), ...newSources];
    const next = { order, hidden: new Set([...current.hidden].filter((s) => sources.includes(s))) };
    savePrefs(next);
    emitChange();
  }, []);

  return { prefs, toggleSource, moveSource, syncSources };
}
