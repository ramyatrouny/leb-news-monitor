"use client";

import { useBookmarks } from "@/hooks/use-bookmarks";
import { X, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date-utils";

export function BookmarksPanel() {
  const { bookmarks, removeBookmark, clearBookmarks } = useBookmarks();

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bookmark className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <p className="text-sm text-muted-foreground">No bookmarks yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Click the bookmark icon on articles to save them
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm py-2 border-b border-border/40">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Bookmarks ({bookmarks.length})
        </h2>
        {bookmarks.length > 0 && (
          <button
            onClick={clearBookmarks}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Clear all bookmarks"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2">
        {bookmarks.map((item) => (
          <div
            key={item.id}
            className="group rounded-lg border border-border/40 bg-card/50 hover:bg-accent/40 hover:border-border/60 transition-colors overflow-hidden px-3 py-3"
          >
            <div className="flex gap-3">
              <div className="flex-1 min-w-0">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer ugc"
                  className="block group"
                  title={`Read: ${item.title} - from ${item.source}`}
                >
                  <h3 className="font-medium text-sm leading-[1.4] text-foreground/90 hover:text-foreground transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </a>

                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                    <span
                      className="font-semibold uppercase tracking-wider"
                      style={{ color: item.sourceColor || "oklch(0.65 0.22 25)" }}
                    >
                      {item.source}
                    </span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(item.bookmarkedAt))}
                    </span>
                  </div>
                  <button
                    onClick={() => removeBookmark(item.id)}
                    className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                    title="Remove bookmark"
                    aria-label="Remove bookmark"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
