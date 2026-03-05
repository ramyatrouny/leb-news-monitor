"use client";

import { useState, useMemo, useCallback } from "react";
import type { FeedItem } from "@/app/api/feeds/route";

/* ── stop words (EN + AR filler words) ─────────────────────────── */
const STOP_WORDS = new Set([
  // English
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "has", "have", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "not", "no", "so", "if",
  "as", "it", "its", "that", "this", "these", "those", "he", "she",
  "they", "we", "you", "i", "my", "his", "her", "our", "your", "their",
  "me", "him", "us", "them", "who", "what", "when", "where", "how",
  "which", "than", "more", "also", "up", "out", "about", "into", "over",
  "after", "before", "between", "during", "just", "new", "said", "says",
  "all", "some", "any",
  // Arabic common filler
  "في", "من", "على", "إلى", "عن", "مع", "هذا", "هذه", "التي", "الذي",
  "أن", "إن", "كان", "قد", "لا", "ما", "هو", "هي", "ذلك", "بين",
  "كل", "بعد", "قبل", "حتى", "ثم", "أو", "بل", "لكن", "عند",
]);

/* ── tokeniser ─────────────────────────────────────────────────── */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")      // strip punctuation
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/* ── build IDF map from all items ──────────────────────────────── */
function buildIdf(items: FeedItem[]): Map<string, number> {
  const docFreq = new Map<string, number>();
  const N = items.length || 1;

  for (const item of items) {
    const words = new Set(tokenize(`${item.title} ${item.snippet}`));
    for (const w of words) {
      docFreq.set(w, (docFreq.get(w) || 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [word, df] of docFreq) {
    idf.set(word, Math.log(N / df));
  }
  return idf;
}

/* ── weighted term vector for one item ─────────────────────────── */
function termVector(item: FeedItem, idf: Map<string, number>): Map<string, number> {
  // title words get 2× weight
  const titleTokens = tokenize(item.title);
  const snippetTokens = tokenize(item.snippet);

  const vec = new Map<string, number>();
  for (const w of titleTokens) {
    const weight = (idf.get(w) ?? 1) * 2;
    vec.set(w, (vec.get(w) || 0) + weight);
  }
  for (const w of snippetTokens) {
    const weight = idf.get(w) ?? 1;
    vec.set(w, (vec.get(w) || 0) + weight);
  }
  return vec;
}

/* ── cosine similarity between two vectors ─────────────────────── */
function cosineSim(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const [key, valA] of a) {
    magA += valA * valA;
    const valB = b.get(key);
    if (valB !== undefined) dot += valA * valB;
  }
  for (const valB of b.values()) {
    magB += valB * valB;
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

/* ── find similar items ────────────────────────────────────────── */
export function findSimilarItems(
  anchor: FeedItem,
  allItems: FeedItem[],
  limit = 15,
): FeedItem[] {
  if (allItems.length <= 1) return [];

  const idf = buildIdf(allItems);
  const anchorVec = termVector(anchor, idf);

  const scored: { item: FeedItem; score: number }[] = [];

  for (const item of allItems) {
    if (item.id === anchor.id) continue;

    let score = cosineSim(anchorVec, termVector(item, idf));

    // Category match bonus (+10%)
    if (item.sourceCategory === anchor.sourceCategory) {
      score *= 1.1;
    }

    if (score > 0.02) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}

/* ── hook ──────────────────────────────────────────────────────── */
export function useSimilar(allItems: FeedItem[]) {
  const [anchorItem, setAnchorItem] = useState<FeedItem | null>(null);

  const similarItems = useMemo(() => {
    if (!anchorItem) return null;
    return findSimilarItems(anchorItem, allItems);
  }, [anchorItem, allItems]);

  const showSimilar = useCallback((item: FeedItem) => {
    setAnchorItem(item);
  }, []);

  const clearSimilar = useCallback(() => {
    setAnchorItem(null);
  }, []);

  return {
    anchorItem,
    similarItems,
    isActive: anchorItem !== null,
    showSimilar,
    clearSimilar,
  };
}
