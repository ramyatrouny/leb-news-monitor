"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { FeedItem } from "@/app/api/feeds/route";

interface HistoryEntry extends FeedItem {
  visitedAt: number;
}

interface ReadingHistoryState {
  visitedIds: Set<string>;
  history: Map<string, HistoryEntry>;
}

const STORAGE_KEY = "lebmon-reading-history";
const DEFAULT_STATE: ReadingHistoryState = { visitedIds: new Set(), history: new Map() };

function loadReadingHistory(): ReadingHistoryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    const history = new Map<string, HistoryEntry>();
    if (parsed.history && Array.isArray(parsed.history)) {
      parsed.history.forEach(([id, entry]: [string, HistoryEntry]) => {
        history.set(id, entry);
      });
    }
    return {
      visitedIds: new Set(parsed.visitedIds ?? []),
      history,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveReadingHistory(state: ReadingHistoryState) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      visitedIds: [...state.visitedIds],
      history: [...state.history.entries()],
    })
  );
}

let cachedState: ReadingHistoryState = DEFAULT_STATE;
let stateInitialized = false;
const listeners = new Set<() => void>();

function getState(): ReadingHistoryState {
  if (!stateInitialized) {
    cachedState = loadReadingHistory();
    stateInitialized = true;
  }
  return cachedState;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function useReadingHistory() {
  const state = useSyncExternalStore(subscribe, getState, () => DEFAULT_STATE);

  const isVisited = useCallback(
    (itemId: string) => state.visitedIds.has(itemId),
    [state.visitedIds]
  );

  const markAsVisited = useCallback((itemId: string, item?: FeedItem) => {
    if (!cachedState.visitedIds.has(itemId)) {
      cachedState.visitedIds.add(itemId);
      if (item) {
        cachedState.history.set(itemId, {
          ...item,
          visitedAt: Date.now(),
        });
      }
      saveReadingHistory(cachedState);
      emitChange();
    }
  }, []);

  const removeFromHistory = useCallback((itemId: string) => {
    cachedState.visitedIds.delete(itemId);
    cachedState.history.delete(itemId);
    saveReadingHistory(cachedState);
    emitChange();
  }, []);

  const getHistory = useCallback(() => {
    return [...cachedState.history.values()].sort((a, b) => b.visitedAt - a.visitedAt);
  }, []);

  const clearHistory = useCallback(() => {
    cachedState = { visitedIds: new Set(), history: new Map() };
    saveReadingHistory(cachedState);
    emitChange();
  }, []);

  return {
    visitedIds: state.visitedIds,
    isVisited,
    markAsVisited,
    removeFromHistory,
    getHistory,
    clearHistory,
  };
}
