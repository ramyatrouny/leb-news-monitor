"use client";

import Link from "next/link";
import { useReadingHistory } from "@/hooks/use-reading-history";
import { History, X, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date-utils";
import { calculateReadTime } from "@/lib/read-time";

export default function ReadingHistoryPage() {
  const { getHistory, removeFromHistory, clearHistory } = useReadingHistory();
  const history = getHistory();

  if (history.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <History className="w-16 h-16 text-muted-foreground/30 mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          No reading history yet
        </h1>
        <p className="text-muted-foreground text-center max-w-md">
          Articles you read will appear here in reverse chronological order.
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
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Reading History
            </h1>
            <p className="text-sm text-muted-foreground">
              {history.length} article{history.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-3 py-1.5 rounded-md text-sm border border-border/40 text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors"
            title="Clear all reading history"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <article
            key={item.id}
            className="group rounded-lg border border-border/40 bg-card/50 hover:bg-accent/40 hover:border-border/60 transition-colors overflow-hidden"
          >
            <div className="px-4 py-3 sm:px-4 sm:py-3 flex gap-4">
              {item.image && (
                <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded overflow-hidden bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer ugc"
                  className="group"
                  title={`Read: ${item.title} - from ${item.source}`}
                >
                  <h3 className="font-medium text-base leading-[1.4] text-foreground/90 group-hover:text-foreground transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </a>

                {item.snippet && (
                  <p className="text-sm text-muted-foreground/80 line-clamp-2 mt-1">
                    {item.snippet}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground/60">
                  <span
                    className="font-semibold uppercase tracking-wider"
                    style={{
                      color: item.sourceColor || "oklch(0.65 0.22 25)",
                    }}
                  >
                    {item.source}
                  </span>
                  <span>•</span>
                  <span>{calculateReadTime(item.snippet)} min read</span>
                  <span>•</span>
                  <span>
                    Read {formatDistanceToNow(new Date(item.visitedAt))}
                  </span>
                </div>
              </div>

              <button
                onClick={() => removeFromHistory(item.id)}
                className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                title="Remove from history"
                aria-label="Remove from history"
              >
                <X size={18} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
