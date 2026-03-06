"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { FeedItem } from "@/app/api/feeds/route";

const STORAGE_KEY = "lebmon-reading-list";

let cachedSnapshot: Map<string, FeedItem> = new Map();
let snapshotInitialized = false;

function load(): Map<string, FeedItem> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const arr: FeedItem[] = JSON.parse(raw);
    return new Map(arr.map((item) => [item.id, item]));
  } catch {
    return new Map();
  }
}

function save(map: Map<string, FeedItem>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...map.values()]));
}

function getSnapshot(): Map<string, FeedItem> {
  if (!snapshotInitialized) {
    cachedSnapshot = load();
    snapshotInitialized = true;
  }
  return cachedSnapshot;
}

function getServerSnapshot(): Map<string, FeedItem> {
  return new Map();
}

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function emitChange() {
  cachedSnapshot = load();
  listeners.forEach((l) => l());
}

export function useReadingList() {
  const readingList = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleReadingList = useCallback((item: FeedItem) => {
    const current = load();
    if (current.has(item.id)) {
      current.delete(item.id);
    } else {
      current.set(item.id, item);
    }
    save(current);
    emitChange();
  }, []);

  const isInReadingList = useCallback(
    (id: string) => readingList.has(id),
    [readingList],
  );

  const removeFromReadingList = useCallback((id: string) => {
    const current = load();
    current.delete(id);
    save(current);
    emitChange();
  }, []);

  const clearReadingList = useCallback(() => {
    save(new Map());
    emitChange();
  }, []);

  return {
    readingList,
    readingListCount: readingList.size,
    toggleReadingList,
    isInReadingList,
    removeFromReadingList,
    clearReadingList,
  };
}
