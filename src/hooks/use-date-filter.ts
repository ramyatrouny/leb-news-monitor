"use client";

import { useState, useCallback } from "react";
import type { FeedItem } from "@/app/api/feeds/route";

export interface DateRange {
  from: string;  
  to: string;  
}

const EMPTY_RANGE: DateRange = { from: "", to: "" };

export interface DatePreset {
  label: string;
  getRange: () => DateRange;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export const DATE_PRESETS: DatePreset[] = [
  {
    label: "Today",
    getRange: () => {
      const now = new Date();
      return { from: isoDate(now), to: isoDate(now) };
    },
  },
  {
    label: "Yesterday",
    getRange: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return { from: isoDate(d), to: isoDate(d) };
    },
  },
  {
    label: "Last 3 days",
    getRange: () => {
      const now = new Date();
      const d = new Date();
      d.setDate(d.getDate() - 3);
      return { from: isoDate(d), to: isoDate(now) };
    },
  },
  {
    label: "Last 7 days",
    getRange: () => {
      const now = new Date();
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return { from: isoDate(d), to: isoDate(now) };
    },
  },
  {
    label: "Last 30 days",
    getRange: () => {
      const now = new Date();
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return { from: isoDate(d), to: isoDate(now) };
    },
  },
  {
    label: "This month",
    getRange: () => {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: isoDate(first), to: isoDate(now) };
    },
  },
];


export function applyDateFilter(
  items: FeedItem[],
  range: DateRange,
): FeedItem[] {
  if (!range.from && !range.to) return items;

  const fromMs = range.from ? new Date(range.from).getTime() : -Infinity;
  const toMs = range.to ? new Date(range.to).getTime() + 86400000 - 1 : Infinity;

  return items.filter((item) => {
    const pubMs = new Date(item.pubDate).getTime();
    if (isNaN(pubMs)) return false;
    return pubMs >= fromMs && pubMs <= toMs;
  });
}

export function useDateFilter() {
  const [dateRange, setDateRange] = useState<DateRange>(EMPTY_RANGE);

  const setFrom = useCallback((from: string) => {
    setDateRange((prev) => {
      // If new "from" is after current "to", clear "to"
      if (from && prev.to && from > prev.to) {
        return { from, to: "" };
      }
      return { ...prev, from };
    });
  }, []);

  const setTo = useCallback((to: string) => {
    setDateRange((prev) => {
      // If new "to" is before current "from", swap
      if (to && prev.from && to < prev.from) {
        return { from: to, to: prev.from };
      }
      return { ...prev, to };
    });
  }, []);

  const setRange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  const clearDate = useCallback(() => {
    setDateRange(EMPTY_RANGE);
  }, []);

  return {
    dateRange,
    setFrom,
    setTo,
    setRange,
    clearDate,
    hasDateFilter: !!dateRange.from || !!dateRange.to,
  };
}
