/**
 * Format distance from a date to now in a human-readable way
 * e.g., "2 hours ago", "3 days ago"
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} d ago`;

  // For older dates, show the date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
