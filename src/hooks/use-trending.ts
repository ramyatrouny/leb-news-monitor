"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import type { FeedItem } from "@/app/api/feeds/route";
import { analyzeTexts } from "@/lib/entity-extractor";

export interface TrendingKeyword {
  word: string;
  count: number;   
  score: number;     
}

function extractTrending(
  items: FeedItem[],
  windowMs = 60 * 60 * 1000,
  limit = 20,
): TrendingKeyword[] {
  const now = Date.now();
  const cutoff = now - windowMs;

  const recent = items.filter((item) => {
    const t = new Date(item.pubDate).getTime();
    return !isNaN(t) && t >= cutoff;
  });

  if (recent.length === 0) return [];

  // Reuse shared text analysis cache
  const { wordDocs } = analyzeTexts(items);

  // Build recency-weighted counts for recent-only articles
  const wordCounts = new Map<string, { count: number; recencySum: number }>();

  for (const item of recent) {
    const age = now - new Date(item.pubDate).getTime();
    const recency = 1 - 0.7 * (age / windowMs);

    // Get this article's tokens from the shared analysis
    const text = `${item.title} ${item.snippet}`;
    const tokens = new Set(
      text
        .replace(/https?:\/\/\S+/g, "")
        .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
        .split(/\s+/)
        .map((w) => w.replace(/^['-]+|['-]+$/g, "").toLowerCase())
        .filter((w) => w.length > 2),
    );

    for (const w of tokens) {
      // Only include words that appear in the global wordDocs (not stop words)
      if (!wordDocs.has(w)) continue;
      const entry = wordCounts.get(w);
      if (entry) {
        entry.count++;
        entry.recencySum += recency;
      } else {
        wordCounts.set(w, { count: 1, recencySum: recency });
      }
    }
  }

  // Only keep words appearing in ≥2 recent articles
  const results: TrendingKeyword[] = [];
  for (const [word, { count, recencySum }] of wordCounts) {
    if (count < 2) continue;
    results.push({
      word,
      count,
      score: count * (recencySum / count),
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

const DEBOUNCE_MS = 500;

export function useTrending(items: FeedItem[]) {
  const [keywords, setKeywords] = useState<TrendingKeyword[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable reference for items to avoid re-runs
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Compute on mount, then debounce subsequent updates
  const isFirstRef = useRef(true);

  useEffect(() => {
    if (isFirstRef.current) {
      isFirstRef.current = false;
      setKeywords(extractTrending(items));
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setKeywords(extractTrending(itemsRef.current));
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [items]);

  return { keywords };
}
