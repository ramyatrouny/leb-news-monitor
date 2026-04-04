"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import type { ArticleResult } from "@/app/api/article/route";
import { estimateReadingTime, formatReadingTime } from "@/lib/reading-time";

/**
 * Client-side article cache — avoids refetching the same article
 * when the user closes and re-opens reading mode for the same URL.
 * Module-scoped so it persists across mounts within the same session.
 */
const clientCache = new Map<string, ArticleResult>();

interface ReadingModeProps {
  url: string;
  title: string;
  source: string;
  sourceColor?: string;
  onClose: () => void;
  /** Callback to broadcast the accurate word count back to the feed card */
  onArticleLoaded?: (url: string, wordCount: number) => void;
}

type FetchState =
  | { status: "loading" }
  | { status: "success"; article: ArticleResult }
  | { status: "error"; message: string };

export function ReadingMode({
  url,
  title,
  source,
  sourceColor,
  onClose,
  onArticleLoaded,
}: ReadingModeProps) {
  const [state, setState] = useState<FetchState>(() => {
    // Instant render if already in client cache
    const cached = clientCache.get(url);
    if (cached) return { status: "success", article: cached };
    return { status: "loading" };
  });
  const abortRef = useRef<AbortController | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // If loaded from client cache, still broadcast the word count
  useEffect(() => {
    if (state.status === "success" && state.article.wordCount > 0) {
      onArticleLoaded?.(url, state.article.wordCount);
    }
    // Only on mount/url change — not every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Fetch article content (skip if already resolved from client cache)
  useEffect(() => {
    if (state.status === "success") return;

    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        const res = await fetch(
          `/api/article?url=${encodeURIComponent(url)}`,
          { signal: ac.signal },
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setState({
            status: "error",
            message: body.error || `Failed to load article (HTTP ${res.status})`,
          });
          return;
        }

        const article: ArticleResult = await res.json();
        clientCache.set(url, article);
        setState({ status: "success", article });
        // Broadcast accurate word count so the feed card updates its reading time
        if (article.wordCount > 0) {
          onArticleLoaded?.(url, article.wordCount);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setState({
          status: "error",
          message: "Could not fetch article. The source may block external access.",
        });
      }
    })();

    return () => {
      ac.abort();
      abortRef.current = null;
    };
  }, [url, state.status]);

  // Escape key closes modal
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const readingTime =
    state.status === "success"
      ? formatReadingTime(estimateReadingTime(state.article.wordCount))
      : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex items-start justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Reading mode"
    >
      {/* Modal panel */}
      <div className="relative w-full max-w-2xl mx-4 my-6 sm:my-10 max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-5rem)] flex flex-col bg-background rounded-xl shadow-2xl border border-border/40 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header bar */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-b border-border/40 bg-card/80">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: sourceColor || "oklch(0.50 0 0)" }}
            />
            <span
              className="text-xs font-semibold uppercase tracking-wider truncate"
              style={{ color: sourceColor || "oklch(0.65 0.22 25)" }}
            >
              {source}
            </span>
            {readingTime && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 text-[11px] font-medium text-muted-foreground/70 tabular-nums">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {readingTime}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Open in new tab */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer ugc"
              className="p-1.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors"
              title="Open original article"
              aria-label="Open original article in new tab"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
              aria-label="Close reading mode"
              title="Close (Esc)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {state.status === "loading" && (
            <div className="px-6 py-10 space-y-4">
              <div className="h-6 w-3/4 rounded bg-muted/40 animate-pulse" />
              <div className="h-4 w-full rounded bg-muted/30 animate-pulse" />
              <div className="h-4 w-full rounded bg-muted/30 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-muted/30 animate-pulse" />
              <div className="h-4 w-full rounded bg-muted/30 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-muted/30 animate-pulse" />
            </div>
          )}

          {state.status === "error" && (
            <div className="px-6 py-10 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">{state.message}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer ugc"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Open article on {source}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          )}

          {state.status === "success" && (
            <div className="px-6 py-5">
              {/* Article title */}
              <h1 className="text-xl sm:text-2xl font-bold leading-tight text-foreground mb-2">
                {state.article.title || title}
              </h1>

              {/* Byline */}
              {state.article.byline && (
                <p className="text-sm text-muted-foreground/70 mb-4">
                  {state.article.byline}
                </p>
              )}

              {/* Word count & reading time info */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/30">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-xs font-medium text-muted-foreground tabular-nums">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {readingTime}
                </span>
                <span className="text-[11px] text-muted-foreground/50 tabular-nums">
                  {state.article.wordCount.toLocaleString()} words
                </span>
              </div>

              {/* Article body */}
              <div
                ref={contentRef}
                className="reading-mode-content prose prose-sm dark:prose-invert max-w-none
                  prose-headings:text-foreground prose-headings:font-semibold prose-headings:leading-tight
                  prose-p:text-foreground/85 prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-lg prose-img:mx-auto
                  prose-blockquote:border-l-primary/30 prose-blockquote:text-muted-foreground
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-li:text-foreground/85
                  text-[15px] leading-[1.75]"
                dangerouslySetInnerHTML={{ __html: state.article.content }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {state.status === "success" && (
          <div className="shrink-0 flex items-center justify-between px-5 py-2.5 border-t border-border/40 bg-card/80">
            <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
              Extracted via Readability
            </span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer ugc"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              Read on {source}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
