"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { FeedItem } from "@/app/api/feeds/route";
import { usePollFrequency } from "./use-poll-frequency";

interface FeedState {
  items: FeedItem[];
  /** IDs of items added in the most recent batch (for entrance animation) */
  newIds: Set<string>;
  sources: number;
  errors: string[];
  fetchedAt: string;
  isLoading: boolean;
  isStreaming: boolean;
}

/**
 * Streams feeds from /api/feeds via NDJSON.
 * Items appear as each source resolves — no waiting for all sources.
 * On refresh, merges new items into existing list without disrupting the UI.
 * Re-fetches on interval specified by usePollFrequency (15s, 30s, 60s, or manual).
 */
export function useFeedStream() {
  const [state, setState] = useState<FeedState>({
    items: [],
    newIds: new Set(),
    sources: 0,
    errors: [],
    fetchedAt: "",
    isLoading: true,
    isStreaming: false,
  });

  const { intervalSeconds } = usePollFrequency();
  const abortRef = useRef<AbortController | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const newIdsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchStream = useCallback(async (isInitial: boolean) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({
      ...prev,
      isLoading: isInitial && prev.items.length === 0,
      isStreaming: true,
    }));

    const batchErrors: string[] = [];

    try {
      const res = await fetch("/api/feeds", { signal: controller.signal });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line);

            if (msg.type === "batch") {
              const incoming = msg.items as FeedItem[];

              setState((prev) => {
                const { merged, addedIds } = mergeItems(prev.items, incoming);
                if (addedIds.size === 0 && merged === prev.items) return { ...prev, isLoading: false };
                return {
                  ...prev,
                  items: merged,
                  newIds: addedIds,
                  isLoading: false,
                };
              });

              // Clear newIds after animation plays — scheduled outside setState
              if (newIdsTimerRef.current) clearTimeout(newIdsTimerRef.current);
              newIdsTimerRef.current = setTimeout(() => {
                setState((s) => (s.newIds.size > 0 ? { ...s, newIds: new Set() } : s));
              }, 600);
            } else if (msg.type === "error") {
              batchErrors.push(`${msg.source}: ${msg.message}`);
            } else if (msg.type === "done") {
              setState((prev) => ({
                ...prev,
                sources: msg.sources,
                errors: batchErrors,
                fetchedAt: msg.fetchedAt,
                isLoading: false,
                isStreaming: false,
              }));
            }
          } catch {
            // Skip malformed lines
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
        errors: [...batchErrors, (err as Error).message],
      }));
    }
  }, []);

  useEffect(() => {
    // Skip scheduling if manual refresh is selected
    if (intervalSeconds === 0) {
      fetchStream(true);
      return;
    }

    // Recursive setTimeout: only schedule next poll after current one completes
    const schedule = () => {
      pollTimerRef.current = setTimeout(async () => {
        await fetchStream(false);
        schedule();
      }, intervalSeconds * 1000);
    };

    fetchStream(true).finally(schedule);

    return () => {
      abortRef.current?.abort();
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      if (newIdsTimerRef.current) clearTimeout(newIdsTimerRef.current);
    };
  }, [fetchStream, intervalSeconds]);

  /**
   * Manual refetch function for manual refresh mode
   * Triggers a new fetch without waiting for the interval
   * Useful when user clicks the refresh button in manual mode
   */
  const refetch = useCallback(async () => {
    await fetchStream(false);
  }, [fetchStream]);

  return {
    ...state,
    refetch,
  };
}

/**
 * Merge new items into existing list.
 * Returns the merged array + the set of newly added item IDs.
 * 
 * Strategy:
 * 1. Deduplicates using item.id (source + link/guid/title combo)
 * 2. For new items: inserts them in chronological order (newest first)
 * 3. Preserves existing article order to avoid jitter
 * 4. Only re-sorts if new articles come with newer timestamps than existing top
 * 
 * This prevents old articles from suddenly appearing at the top due to re-sorting.
 */
function mergeItems(
  existing: FeedItem[],
  incoming: FeedItem[]
): { merged: FeedItem[]; addedIds: Set<string> } {
  const seen = new Set<string>();
  for (const item of existing) {
    seen.add(item.id);
  }

  const addedIds = new Set<string>();
  const newItems: FeedItem[] = [];
  for (const item of incoming) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      newItems.push(item);
      addedIds.add(item.id);
    }
  }

  // If no new items, return existing list as-is (preserves order)
  if (newItems.length === 0) return { merged: existing, addedIds };

  // Sort only the new items by pubDate (newest first)
  const newItemsSorted = [...newItems].sort((a, b) => {
    const dateA = new Date(a.pubDate).getTime();
    const dateB = new Date(b.pubDate).getTime();
    return dateB - dateA;
  });

  // Get the newest timestamp from existing articles (top of the list)
  const existingTopDate = existing.length > 0
    ? new Date(existing[0].pubDate).getTime()
    : 0;

  // Get the newest timestamp from new articles
  const newTopDate = newItemsSorted.length > 0
    ? new Date(newItemsSorted[0].pubDate).getTime()
    : 0;

  // If new articles are newer than existing top, prepend them
  // Otherwise, merge them in chronological order
  if (newTopDate > existingTopDate) {
    // New articles are fresher - add them to the top
    return {
      merged: [...newItemsSorted, ...existing],
      addedIds,
    };
  }

  // New articles are older than top existing - insert in chronological order
  const merged = [...existing];
  const existingTimestamps = new Map<string, number>();
  for (const item of merged) {
    existingTimestamps.set(item.id, new Date(item.pubDate).getTime());
  }

  for (const newItem of newItemsSorted) {
    const newItemTime = new Date(newItem.pubDate).getTime();
    let insertIndex = merged.length;

    // Find the right position (newest first)
    for (let i = 0; i < merged.length; i++) {
      if (newItemTime > (existingTimestamps.get(merged[i].id) ?? 0)) {
        insertIndex = i;
        break;
      }
    }

    merged.splice(insertIndex, 0, newItem);
    existingTimestamps.set(newItem.id, newItemTime);
  }

  return { merged, addedIds };
}
