"use client";

import { useMemo } from "react";
import type { FeedItem } from "@/app/api/feeds/route";

/* ── Stop words (EN + AR) ────────────────────────────────────── */
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
  "all", "some", "any", "been", "being", "very", "most", "only", "own",
  "same", "such", "other", "each", "every", "both", "few", "much",
  "many", "too", "then", "now", "here", "there", "still", "even",
  "first", "last", "long", "great", "way", "one", "two", "three",
  "four", "five", "six", "old", "like", "back", "well", "get", "got",
  "set", "make", "made", "take", "come", "came", "go", "went", "going",
  "part", "while", "per", "via", "read", "update", "news", "report",
  "reports", "according", "say", "told", "tell", "year", "years",
  "day", "days", "time", "week", "month", "ago", "today", "yesterday",
  "latest", "breaking",
  // Arabic filler
  "في", "من", "على", "إلى", "عن", "مع", "هذا", "هذه", "التي", "الذي",
  "أن", "إن", "كان", "قد", "لا", "ما", "هو", "هي", "ذلك", "بين",
  "كل", "بعد", "قبل", "حتى", "ثم", "أو", "بل", "لكن", "عند",
  "عبر", "خلال", "منذ", "تم", "يتم", "كما", "لم", "لن", "سوف",
  "نحو", "ضد", "حول", "دون", "فوق", "تحت", "وفق", "أكثر", "أقل",
]);

/* ── Tokeniser ────────────────────────────────────────────────── */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/* ── Trending keyword type ────────────────────────────────────── */
export interface TrendingKeyword {
  word: string;
  count: number;       // number of articles containing this word
  score: number;       // weighted score (count * recency)
}

/* ── Extract trending keywords from recent articles ───────────── */
export function extractTrending(
  items: FeedItem[],
  windowMs = 60 * 60 * 1000, // 1 hour
  limit = 20,
): TrendingKeyword[] {
  const now = Date.now();
  const cutoff = now - windowMs;

  // Filter to articles within time window
  const recent = items.filter((item) => {
    const t = new Date(item.pubDate).getTime();
    return !isNaN(t) && t >= cutoff;
  });

  if (recent.length === 0) return [];

  // Count keywords across articles (each word counted once per article)
  const wordArticleCount = new Map<string, number>();
  const wordRecencySum = new Map<string, number>();

  for (const item of recent) {
    const text = `${item.title} ${item.snippet}`;
    const words = new Set(tokenize(text));
    const age = now - new Date(item.pubDate).getTime();
    // Recency weight: 1.0 for newest, 0.3 for oldest in window
    const recency = 1 - 0.7 * (age / windowMs);

    for (const w of words) {
      wordArticleCount.set(w, (wordArticleCount.get(w) || 0) + 1);
      wordRecencySum.set(w, (wordRecencySum.get(w) || 0) + recency);
    }
  }

  // Only keep words appearing in ≥2 articles (signal, not noise)
  const results: TrendingKeyword[] = [];
  for (const [word, count] of wordArticleCount) {
    if (count < 2) continue;
    const recencyScore = wordRecencySum.get(word) || 0;
    results.push({
      word,
      count,
      score: count * (recencyScore / count), // count weighted by avg recency
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

/* ── Hook ─────────────────────────────────────────────────────── */
export function useTrending(items: FeedItem[]) {
  const keywords = useMemo(() => extractTrending(items), [items]);

  return { keywords };
}
