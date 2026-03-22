"use client";

import { useCallback, useSyncExternalStore } from "react";

export type PollIntervalSeconds = 15 | 30 | 60 | 0;

interface PollFrequencyState {
  intervalSeconds: PollIntervalSeconds;
}

const STORAGE_KEY = "lebmon-poll-frequency";
const DEFAULT_STATE: PollFrequencyState = { intervalSeconds: 30 };

function loadPollFrequency(): PollFrequencyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    const interval = parsed.intervalSeconds ?? 30;
    if ([15, 30, 60, 0].includes(interval)) {
      return { intervalSeconds: interval };
    }
    return DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function savePollFrequency(state: PollFrequencyState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let cachedState: PollFrequencyState = DEFAULT_STATE;
let stateInitialized = false;
const listeners = new Set<() => void>();

function getState(): PollFrequencyState {
  if (!stateInitialized) {
    cachedState = loadPollFrequency();
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

export function usePollFrequency() {
  const state = useSyncExternalStore(subscribe, getState, () => DEFAULT_STATE);

  const setInterval = useCallback((interval: PollIntervalSeconds) => {
    cachedState = { intervalSeconds: interval };
    savePollFrequency(cachedState);
    emitChange();
  }, []);

  return {
    intervalSeconds: state.intervalSeconds,
    setInterval,
  };
}
