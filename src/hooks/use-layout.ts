"use client";

import { useCallback, useSyncExternalStore } from "react";

export type FeedLayout = "grid" | "list";

const STORAGE_KEY = "lebmon-layout";

let cachedSnapshot: FeedLayout | null = null;

function getLayoutSnapshot(): FeedLayout {
  if (cachedSnapshot) return cachedSnapshot;
  const stored = localStorage.getItem(STORAGE_KEY);
  cachedSnapshot = stored === "list" ? "list" : "grid";
  return cachedSnapshot;
}

function getServerSnapshot(): FeedLayout {
  return "grid";
}

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function emitChange() {
  cachedSnapshot = localStorage.getItem(STORAGE_KEY) === "list" ? "list" : "grid";
  listeners.forEach((l) => l());
}

export function useLayout() {
  const layout = useSyncExternalStore(subscribe, getLayoutSnapshot, getServerSnapshot);

  const toggleLayout = useCallback(() => {
    const next: FeedLayout = getLayoutSnapshot() === "grid" ? "list" : "grid";
    localStorage.setItem(STORAGE_KEY, next);
    emitChange();
  }, []);

  return { layout, toggleLayout };
}
