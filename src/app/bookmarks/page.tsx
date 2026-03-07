"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { FeedCard, FeedCardSkeleton } from "@/components/feed-card";
import { useLayout } from "@/hooks/use-layout";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function BookmarksPage() {
  const { bookmarks, toggle, clear, isLoaded } = useBookmarks();
  const { layout } = useLayout();
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const sortedBookmarks = useMemo(() => {
    const sorted = [...bookmarks];
    if (sortBy === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime()
      );
    } else {
      sorted.sort(
        (a, b) =>
          new Date(a.bookmarkedAt).getTime() - new Date(b.bookmarkedAt).getTime()
      );
    }
    return sorted;
  }, [bookmarks, sortBy]);

  const layoutClass =
    layout === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3"
      : "flex flex-col gap-2 sm:gap-3 max-w-3xl mx-auto";

  if (!isLoaded) {
    return (
      <TooltipProvider>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className={layoutClass}>
              {Array.from({ length: 6 }).map((_, i) => (
                <FeedCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b border-border/30 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Saved Articles
            </h1>
            {bookmarks.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {bookmarks.length}{" "}
                {bookmarks.length === 1
                  ? "saved article"
                  : "saved articles"}
              </p>
            )}
          </div>
          <Link
            href="/"
            className="px-3 py-2 rounded bg-muted hover:bg-muted/80 transition-colors text-sm"
          >
            ← Home
          </Link>
        </div>

        {/* Controls */}
        {bookmarks.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <button
                onClick={() => setSortBy("newest")}
                className={`px-2 py-1 rounded text-sm transition-colors ${
                  sortBy === "newest"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortBy("oldest")}
                className={`px-2 py-1 rounded text-sm transition-colors ${
                  sortBy === "oldest"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Oldest
              </button>
            </div>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="ml-auto px-3 py-1 rounded text-sm bg-destructive/10 hover:bg-destructive/20 transition-colors text-destructive"
            >
              Clear Saved Articles
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              You haven't saved any articles yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Click the bookmark icon on any article to save it
            </p>
            <Link
              href="/"
              className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Home
            </Link>
          </div>
        ) : (
          <div className="p-2.5 sm:p-4">
            <div className={layoutClass}>
              {sortedBookmarks.map((item) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  onBookmark={toggle}
                  isBookmarked={true}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Clear confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">
              Clear Saved Articles
            </h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to remove all saved articles? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-3 py-2 rounded bg-muted hover:bg-muted/80 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  clear();
                  setShowClearConfirm(false);
                }}
                className="flex-1 px-3 py-2 rounded bg-destructive/10 hover:bg-destructive/20 transition-colors text-destructive"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}
