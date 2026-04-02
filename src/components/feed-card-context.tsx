"use client";

import { createContext, useContext } from "react";
import type { TagInfo } from "@/lib/entity-extractor";

export interface FeedCardContextValue {
  /** Current search query for text highlighting */
  highlightQuery: string;
  /** Get tags for a specific article by ID */
  getItemTags: (itemId: string) => string[];
  /** Lookup map from tag name → TagInfo */
  tagIndex: Map<string, TagInfo>;
  /** Callback when a tag chip inside a card is clicked */
  onTagClick: (tag: string) => void;
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
