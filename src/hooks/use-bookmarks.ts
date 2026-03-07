"use client";

import { useState, useEffect, useCallback } from "react";
import type { FeedItem } from "@/app/api/feeds/route";

export type BookmarkedItem = FeedItem & { bookmarkedAt: string };

const BOOKMARKS_KEY = "leb-monitor-bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error("Failed to save bookmarks:", error);
      }
    }
  }, [bookmarks, isLoaded]);

  const toggle = useCallback((item: FeedItem) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === item.id);
      if (exists) {
        return prev.filter((b) => b.id !== item.id);
      } else {
        return [
          {
            ...item,
            bookmarkedAt: new Date().toISOString(),
          },
          ...prev,
        ];
      }
    });
  }, []);

  const isBookmarked = useCallback(
    (itemId: string) => bookmarks.some((b) => b.id === itemId),
    [bookmarks]
  );

  const clear = useCallback(() => {
    setBookmarks([]);
  }, []);

  return {
    bookmarks,
    toggle,
    isBookmarked,
    clear,
    count: bookmarks.length,
    isLoaded,
  };
}
