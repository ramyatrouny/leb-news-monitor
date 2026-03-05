"use client";

import { useState, useEffect, useCallback } from "react";

export type FontSize = "small" | "medium" | "large" | "xlarge";

const SIZES: FontSize[] = ["small", "medium", "large", "xlarge"];
const STORAGE_KEY = "lebmon-font-size";

export function useFontSize() {
  const [fontSize, setFontSizeState] = useState<FontSize>("medium");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as FontSize | null;
    if (stored && SIZES.includes(stored)) {
      setFontSizeState(stored);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    for (const size of SIZES) {
      root.classList.remove(`font-size-${size}`);
    }
    root.classList.add(`font-size-${fontSize}`);
    localStorage.setItem(STORAGE_KEY, fontSize);
  }, [fontSize]);

  const cycleFontSize = useCallback(() => {
    setFontSizeState((current) => {
      const idx = SIZES.indexOf(current);
      return SIZES[(idx + 1) % SIZES.length];
    });
  }, []);

  return { fontSize, cycleFontSize };
}
