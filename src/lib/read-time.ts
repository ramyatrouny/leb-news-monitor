/**
 * Calculates estimated reading time in minutes
 * Using average reading speed of 200 words per minute
 */
export function calculateReadTime(text: string): number {
  if (!text) return 0;

  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, "");

  // Count words (split by whitespace)
  const wordCount = cleanText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Average reading speed: 200 words per minute
  const readTimeMinutes = Math.ceil(wordCount / 200);

  return Math.max(1, readTimeMinutes);
}

/**
 * Formats read time display
 * Returns "1 min read", "5 min read", etc.
 */
export function formatReadTime(minutes: number): string {
  return `${minutes} min read`;
}

/**
 * Gets read time from text in a single function
 */
export function getReadTime(text: string): string {
  const minutes = calculateReadTime(text);
  return formatReadTime(minutes);
}
