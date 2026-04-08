"use client";

import Link from "next/link";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { Bookmark, X, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date-utils";
import { calculateReadTime } from "@/lib/read-time";

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, clearBookmarks } = useBookmarks();

  if (bookmarks.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <Bookmark className="w-16 h-16 text-muted-foreground/30 mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          No bookmarks yet
        </h1>
        <p className="text-muted-foreground text-center max-w-md">
          Click the bookmark icon on articles in the feed to save them for later
          reading.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm border border-border/40 text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to feed
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors"
            title="Back to feed"
            aria-label="Back to feed"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Bookmarks</h1>
            <p className="text-sm text-muted-foreground">
              {bookmarks.length} article{bookmarks.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {bookmarks.length > 0 && (
          <button
            onClick={clearBookmarks}
            className="px-3 py-2 rounded-md text-sm border border-border/40 text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors"
            title="Clear all bookmarks"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-3">
        {bookmarks.map((item) => {
          const readTime = calculateReadTime(item.snippet);

          return (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer ugc"
              className="group block rounded-lg border border-border/40 hover:border-border/60 bg-card/50 hover:bg-accent/40 transition-colors overflow-hidden"
            >
              <article className="px-4 py-3">
                <div className="flex gap-4">
                  {item.image && (
                    <div className="shrink-0 w-24 h-24 rounded overflow-hidden bg-muted/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-sm leading-[1.4] text-foreground group-hover:text-foreground/80 transition-colors line-clamp-2">
                      {item.title}
                    </h2>

                    {item.snippet && (
                      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {item.snippet}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                        <span
                          className="font-semibold uppercase tracking-wider"
                          style={{
                            color: item.sourceColor || "oklch(0.65 0.22 25)",
                          }}
                        >
                          {item.source}
                        </span>
                        <span>•</span>
                        <span>{readTime} min read</span>
                        <span>•</span>
                        <span>
                          Saved{" "}
                          {formatDistanceToNow(new Date(item.bookmarkedAt))}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeBookmark(item.id);
                        }}
                        className="text-muted-foreground/40 hover:text-red-500 transition-colors shrink-0"
                        title="Remove bookmark"
                        aria-label="Remove bookmark"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </a>
          );
        })}
      </div>
    </main>
  );
}
