"use client";

import { createContext, useContext } from "react";
import type { FeedItem } from "@/app/api/feeds/route";

/** Lightweight tag info for display in cards */
export interface TagInfo {
  name: string;
  type: string;
  count: number;
}

export interface FeedCardContextValue {
  /** Current search query for text highlighting */
  highlightQuery: string;
  /** Get tags for a specific article by ID */
  getItemTags: (itemId: string) => string[];
  /** Lookup map from tag name → TagInfo */
  tagIndex: Map<string, TagInfo>;
  /** Callback when a tag chip inside a card is clicked */
  onTagClick: (tag: string) => void;
  /** Check if an article is bookmarked */
  isBookmarked: (id: string) => boolean;
  /** Toggle bookmark state for an article */
  toggleBookmark: (item: FeedItem) => void;
  /** Check if an article is in the reading list */
  isInReadingList: (id: string) => boolean;
  /** Toggle reading list state for an article */
  toggleReadingList: (item: FeedItem) => void;
  /** Overridden word counts from full article extraction (url → wordCount) */
  wordCountOverrides: Map<string, number>;
  /** Called when reading mode successfully loads a full article */
  onArticleLoaded: (url: string, wordCount: number) => void;
}

const FeedCardContext = createContext<FeedCardContextValue | null>(null);

export function FeedCardProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: FeedCardContextValue;
}) {
  return (
    <FeedCardContext.Provider value={value}>
      {children}
    </FeedCardContext.Provider>
  );
}

export function useFeedCardContext(): FeedCardContextValue | null {
  return useContext(FeedCardContext);
}
