"use client";

import { useState } from "react";
import Link from "next/link";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useReadingList } from "@/hooks/use-reading-list";
import { estimateReadingTime, formatReadingTime } from "@/lib/reading-time";
import { ShareMenu } from "@/components/share-menu";

type Tab = "reading-list" | "bookmarks";

function timeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  if (!dateStr || isNaN(then)) return "—";
  const diffSec = Math.floor((Date.now() - then) / 1000);
  if (diffSec < 60) return "now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export default function ReadingListPage() {
  const [tab, setTab] = useState<Tab>("reading-list");
  const { readingList, removeFromReadingList, clearReadingList } = useReadingList();
  const { bookmarks, removeBookmark, clearBookmarks } = useBookmarks();

  const items = tab === "reading-list" ? [...readingList.values()] : [...bookmarks.values()];
  const clear = tab === "reading-list" ? clearReadingList : clearBookmarks;
  const remove = tab === "reading-list" ? removeFromReadingList : removeBookmark;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to feed"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">
              {tab === "reading-list" ? "Reading List" : "Bookmarks"}
            </h1>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Tab switcher */}
        <div className="max-w-3xl mx-auto px-4 pb-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTab("reading-list")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === "reading-list"
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={tab === "reading-list" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
            Reading List
            <span className="text-[10px] opacity-60 tabular-nums">{readingList.size}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("bookmarks")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === "bookmarks"
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={tab === "bookmarks" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Bookmarks
            <span className="text-[10px] opacity-60 tabular-nums">{bookmarks.size}</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center">
              {tab === "reading-list" ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/40" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/40" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {tab === "reading-list"
                ? "No articles in your reading list yet."
                : "No bookmarked articles yet."}
            </p>
            <p className="text-xs text-muted-foreground/60">
              {tab === "reading-list"
                ? "Click the bookmark+ icon on any article to save it for later."
                : "Click the heart icon on any article to bookmark it."}
            </p>
            <Link
              href="/"
              className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              ← Back to feed
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const readTime = estimateReadingTime(item.wordCount);
              return (
                <div key={item.id} className="group relative">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer ugc"
                    className="block rounded-lg border border-border/40 bg-card/50 hover:bg-accent/40 hover:border-border/60 transition-colors overflow-hidden"
                  >
                    <div className="px-3.5 py-3 flex gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: item.sourceColor || "oklch(0.50 0 0)" }}
                          />
                          <span
                            className="text-[10px] font-semibold uppercase tracking-wider truncate"
                            style={{ color: item.sourceColor || "oklch(0.65 0.22 25)" }}
                          >
                            {item.source}
                          </span>
                          <span className="text-[10px] text-muted-foreground/40">·</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 text-[11px] font-medium text-muted-foreground/60 tabular-nums">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {formatReadingTime(readTime)}
                          </span>
                          <span className="text-[10px] text-muted-foreground/40">·</span>
                          <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                            {timeAgo(item.pubDate)}
                          </span>
                        </div>
                        <h3 className="text-sm font-medium leading-snug text-foreground/90 line-clamp-2">
                          {item.title}
                        </h3>
                        {item.snippet && (
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                            {item.snippet}
                          </p>
                        )}
                      </div>
                      {item.image && (
                        <div className="shrink-0 w-16 h-16 rounded overflow-hidden bg-muted/30">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt="" loading="lazy" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </a>

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShareMenu title={item.title} url={item.link} />
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive transition-colors cursor-pointer"
                      aria-label="Remove"
                      title="Remove"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
