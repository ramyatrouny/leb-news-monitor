const WORDS_PER_MINUTE = 200;

/**
 * Estimate reading time in minutes from a word count.
 * Handles undefined/NaN/negative gracefully. Returns at least 1 minute.
 */
export function estimateReadingTime(wordCount: number | undefined | null): number {
  if (!wordCount || !Number.isFinite(wordCount) || wordCount <= 0) return 1;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

/**
 * Format reading time for display.
 * @returns e.g. "1 min read", "3 min read"
 */
export function formatReadingTime(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "1 min read";
  return `${minutes} min read`;
}
