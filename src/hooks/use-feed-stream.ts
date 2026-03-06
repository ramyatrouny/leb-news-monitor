"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { FeedItem } from "@/app/api/feeds/route";

const POLL_INTERVAL = 30_000;

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
 * Re-fetches every 30s after the previous fetch completes.
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
    // Recursive setTimeout: only schedule next poll after current one completes
    const schedule = () => {
      pollTimerRef.current = setTimeout(async () => {
        await fetchStream(false);
        schedule();
      }, POLL_INTERVAL);
    };

    fetchStream(true).finally(schedule);

    return () => {
      abortRef.current?.abort();
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      if (newIdsTimerRef.current) clearTimeout(newIdsTimerRef.current);
    };
  }, [fetchStream]);

  return state;
}

/**
 * Merge new items into existing list.
 * Returns the merged array + the set of newly added item IDs.
 * Uses item.id as the dedup key (already unique per source + link/guid/title).
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

  if (newItems.length === 0) return { merged: existing, addedIds };

  const merged = [...existing, ...newItems];
  
  // Cache timestamps to avoid creating Date objects during sort
  const timestamps = new Map<string, number>();
  for (const item of merged) {
    if (!timestamps.has(item.id)) {
      timestamps.set(item.id, new Date(item.pubDate).getTime());
    }
  }
  
  merged.sort(
    (a, b) => (timestamps.get(b.id) ?? 0) - (timestamps.get(a.id) ?? 0)
  );
  return { merged, addedIds };
}
