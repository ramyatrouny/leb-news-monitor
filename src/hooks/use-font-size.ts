"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type FontSize = "small" | "medium" | "large" | "xlarge";

const SIZES: FontSize[] = ["small", "medium", "large", "xlarge"];
const STORAGE_KEY = "lebmon-font-size";

function getFontSizeSnapshot(): FontSize {
  const stored = localStorage.getItem(STORAGE_KEY) as FontSize | null;
  if (stored && SIZES.includes(stored)) return stored;
  return "medium";
}

function getServerSnapshot(): FontSize {
  return "medium";
}

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function emitChange() {
  listeners.forEach((l) => l());
}

function applyFontSize(size: FontSize) {
  const root = document.documentElement;
  for (const s of SIZES) root.classList.remove(`font-size-${s}`);
  root.classList.add(`font-size-${size}`);
}

export function useFontSize() {
  const fontSize = useSyncExternalStore(subscribe, getFontSizeSnapshot, getServerSnapshot);

  useEffect(() => {
    applyFontSize(fontSize);
  }, [fontSize]);

  const cycleFontSize = useCallback(() => {
    const current = getFontSizeSnapshot();
    const idx = SIZES.indexOf(current);
    const next = SIZES[(idx + 1) % SIZES.length];
    localStorage.setItem(STORAGE_KEY, next);
    applyFontSize(next);
    emitChange();
  }, []);

  return { fontSize, cycleFontSize };
}
