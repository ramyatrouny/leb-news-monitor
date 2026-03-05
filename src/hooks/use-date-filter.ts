"use client";

import { useState, useCallback } from "react";
import type { FeedItem } from "@/app/api/feeds/route";

export interface DateRange {
  from: string;
  to: string;
}

const EMPTY_RANGE: DateRange = { from: "", to: "" };

/** Filter items by publication date range. */
export function applyDateFilter(items: FeedItem[], range: DateRange): FeedItem[] {
  if (!range.from && !range.to) return items;

  return items.filter((item) => {
    const d = new Date(item.pubDate);
    if (isNaN(d.getTime())) return true; // keep items with no valid date

    if (range.from) {
      const fromDate = new Date(range.from);
      fromDate.setHours(0, 0, 0, 0);
      if (d < fromDate) return false;
    }

    if (range.to) {
      const toDate = new Date(range.to);
      toDate.setHours(23, 59, 59, 999);
      if (d > toDate) return false;
    }

    return true;
  });
}

export function useDateFilter() {
  const [dateRange, setDateRange] = useState<DateRange>(EMPTY_RANGE);

  const setFrom = useCallback((from: string) => {
    setDateRange((prev) => ({ ...prev, from }));
  }, []);

  const setTo = useCallback((to: string) => {
    setDateRange((prev) => ({ ...prev, to }));
  }, []);

  const setRange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  const clearDate = useCallback(() => {
    setDateRange(EMPTY_RANGE);
  }, []);

  const hasDateFilter = dateRange.from !== "" || dateRange.to !== "";

  return {
    dateRange,
    setFrom,
    setTo,
    setRange,
    clearDate,
    hasDateFilter,
  };
}
