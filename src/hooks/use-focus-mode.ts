"use client";

import { useCallback, useSyncExternalStore } from "react";

export type FocusTimeRange = "all" | "1h" | "6h" | "24h" | "7d";

interface FocusModeState {
  timeRange: FocusTimeRange;
}

const STORAGE_KEY = "lebmon-focus-mode";
const DEFAULT_STATE: FocusModeState = { timeRange: "all" };

function loadFocusMode(): FocusModeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      timeRange: (parsed.timeRange as FocusTimeRange) || "all",
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveFocusMode(state: FocusModeState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let cachedState: FocusModeState = DEFAULT_STATE;
let stateInitialized = false;
const listeners = new Set<() => void>();

function getState(): FocusModeState {
  if (!stateInitialized) {
    cachedState = loadFocusMode();
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

/**
 * Calculate cutoff date based on focus time range
 */
export function getCutoffDate(timeRange: FocusTimeRange): Date {
  const now = new Date();
  const cutoff = new Date(now);

  switch (timeRange) {
    case "1h":
      cutoff.setHours(cutoff.getHours() - 1);
      break;
    case "6h":
      cutoff.setHours(cutoff.getHours() - 6);
      break;
    case "24h":
      cutoff.setDate(cutoff.getDate() - 1);
      break;
    case "7d":
      cutoff.setDate(cutoff.getDate() - 7);
      break;
    case "all":
      return new Date(0); // Return epoch (show all)
  }

  return cutoff;
}

export function useFocusMode() {
  const state = useSyncExternalStore(subscribe, getState, () => DEFAULT_STATE);

  const setTimeRange = useCallback((timeRange: FocusTimeRange) => {
    cachedState = { timeRange };
    saveFocusMode(cachedState);
    emitChange();
  }, []);

  const getCutoff = useCallback(() => getCutoffDate(state.timeRange), [
    state.timeRange,
  ]);

  return {
    timeRange: state.timeRange,
    setTimeRange,
    getCutoff,
  };
}
