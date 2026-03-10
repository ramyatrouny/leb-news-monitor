"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { FeedItem } from "@/app/api/feeds/route";

const BOOKMARKS_STORAGE_KEY = "lebmon-bookmarks";

export interface BookmarkedItem extends FeedItem {
  bookmarkedAt: string;
}

const DEFAULT_BOOKMARKS: BookmarkedItem[] = [];

function loadBookmarks(): BookmarkedItem[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks: BookmarkedItem[]) {
  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
}

let cachedBookmarks: BookmarkedItem[] = DEFAULT_BOOKMARKS;
let bookmarksInitialized = false;
const listeners = new Set<() => void>();

function getBookmarks(): BookmarkedItem[] {
  if (!bookmarksInitialized) {
    cachedBookmarks = loadBookmarks();
    bookmarksInitialized = true;
  }
  return cachedBookmarks;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function useBookmarks() {
  const bookmarks = useSyncExternalStore(subscribe, getBookmarks, () =>
    DEFAULT_BOOKMARKS
  );

  const isBookmarked = useCallback(
    (itemId: string) => bookmarks.some((b) => b.id === itemId),
    [bookmarks]
  );

  const addBookmark = useCallback(
    (item: FeedItem) => {
      const newBookmarks = [
        ...getBookmarks(),
        {
          ...item,
          bookmarkedAt: new Date().toISOString(),
        },
      ];
      cachedBookmarks = newBookmarks;
      saveBookmarks(newBookmarks);
      emitChange();
    },
    []
  );

  const removeBookmark = useCallback((itemId: string) => {
    const newBookmarks = getBookmarks().filter((b) => b.id !== itemId);
    cachedBookmarks = newBookmarks;
    saveBookmarks(newBookmarks);
    emitChange();
  }, []);

  const toggleBookmark = useCallback(
    (item: FeedItem) => {
      if (isBookmarked(item.id)) {
        removeBookmark(item.id);
      } else {
        addBookmark(item);
      }
    },
    [isBookmarked, removeBookmark, addBookmark]
  );

  const clearBookmarks = useCallback(() => {
    cachedBookmarks = [];
    saveBookmarks([]);
    emitChange();
  }, []);

  return {
    bookmarks,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    clearBookmarks,
  };
}
