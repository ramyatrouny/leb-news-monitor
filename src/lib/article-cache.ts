import type { ArticleResult } from "@/app/api/article/route";

/**
 * Simple in-memory LRU article cache with TTL.
 * Survives across requests within the same server instance.
 *
 * Two tiers:
 *  - "rss"  : pre-populated from RSS feed content (lower quality, but instant)
 *  - "full" : fetched via Readability from the source page (higher quality)
 *
 * A "full" entry always takes priority over an "rss" entry.
 */

interface CacheEntry {
  article: ArticleResult;
  tier: "rss" | "full";
  expiresAt: number;
}

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ENTRIES = 500;

const cache = new Map<string, CacheEntry>();

/** Normalise URL for cache key (strip trailing slash, lowercase host) */
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    // Remove common tracking params
    for (const p of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
      u.searchParams.delete(p);
    }
    return u.toString().replace(/\/+$/, "");
  } catch {
    return url;
  }
}

/** Evict oldest entries when cache exceeds limit */
function evictIfNeeded(): void {
  if (cache.size <= MAX_ENTRIES) return;
  const toRemove = cache.size - MAX_ENTRIES;
  const keys = cache.keys();
  for (let i = 0; i < toRemove; i++) {
    const { value, done } = keys.next();
    if (done) break;
    cache.delete(value);
  }
}

/**
 * Retrieve a cached article. Returns null if not found or expired.
 */
export function getCachedArticle(url: string): ArticleResult | null {
  const key = normalizeUrl(url);
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.article;
}

/**
 * Get the tier of a cached entry (to decide whether to upgrade).
 */
export function getCachedTier(url: string): "rss" | "full" | null {
  const key = normalizeUrl(url);
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.tier;
}

/**
 * Store an article in the cache.
 * A "full" tier entry will overwrite an "rss" tier entry.
 * An "rss" tier entry will NOT overwrite a "full" tier entry.
 */
export function setCachedArticle(
  url: string,
  article: ArticleResult,
  tier: "rss" | "full",
  ttlMs: number = DEFAULT_TTL_MS,
): void {
  const key = normalizeUrl(url);

  // Don't downgrade full → rss
  const existing = cache.get(key);
  if (existing && existing.tier === "full" && tier === "rss") return;

  cache.set(key, {
    article,
    tier,
    expiresAt: Date.now() + ttlMs,
  });

  evictIfNeeded();
}

/** Number of entries currently in cache (for diagnostics) */
export function cacheSize(): number {
  return cache.size;
}
