"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Loader2, AlertCircle, ExternalLink, Bookmark } from "lucide-react";
import Image from "next/image";
import { fetchArticleContent } from "@/lib/article-processor";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useReadingHistory } from "@/hooks/use-reading-history";
import type { FeedItem } from "@/app/api/feeds/route";
import { ArticleShareButton } from "./article-share-button";

interface ArticleReaderProps {
  article: FeedItem;
  onClose: () => void;
}

/**
 * Full-Page Article Reader Component
 *
 * Displays article content in a full-screen reading view, optimized for reading.
 * Similar to dedicated reading apps with proper typography and formatting.
 *
 * Features:
 * - Full viewport article display
 * - Automatic content extraction and formatting
 * - Loading state with spinner
 * - Error handling with fallback
 * - Metadata display (source, author, date, read time)
 * - Reading history tracking
 * - Quick access to bookmarking and sharing
 * - Clean typography optimized for reading
 * - Responsive design
 *
 * @param article - The FeedItem to display
 * @param onClose - Callback when user closes the reader
 */
export function ArticleReader({ article, onClose }: ArticleReaderProps) {
  const [content, setContent] = useState<string>("");
  const [metadata, setMetadata] = useState<{ author?: string; date?: string; image?: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { markAsVisited } = useReadingHistory();

  const bookmarked = isBookmarked(article.id);

  /**
   * Fetch and parse article content on mount
   */
  useEffect(() => {
    const loadArticle = async () => {
      setIsLoading(true);
      setError(null);
      setContent("");
      setMetadata({});

      try {
        const result = await fetchArticleContent(article.link, article.title, article.source);
        setContent(result.content);
        setMetadata({
          author: result.author,
          date: result.publishedDate,
          image: result.imageUrl,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load article. Please visit the source."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
    markAsVisited(article.id, article);
  }, [article, markAsVisited]);

  /**
   * Handle keyboard escape to close reader
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  /**
   * Prevent scroll when reader is open
   */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleBookmarkClick = () => {
    toggleBookmark(article);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden flex flex-col">
      {/* Header with article metadata and controls */}
      <header className="flex-shrink-0 border-b border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-4">
          {/* Left: Source and title info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: article.sourceColor || "oklch(0.65 0.22 25)" }}
              />
              <span
                className="text-xs font-semibold uppercase tracking-wider truncate"
                style={{ color: article.sourceColor || "oklch(0.65 0.22 25)" }}
              >
                {article.source}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2">
              {article.title}
            </h1>
          </div>

          {/* Right: Action buttons and close */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Bookmark button */}
            <button
              onClick={handleBookmarkClick}
              className={`inline-flex items-center justify-center w-9 h-9 rounded transition-colors ${
                bookmarked
                  ? "text-amber-500 hover:text-amber-600 bg-amber-500/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
              title={bookmarked ? "Remove bookmark" : "Add bookmark"}
              aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              <Bookmark size={18} className={bookmarked ? "fill-current" : ""} />
            </button>

            {/* Share button */}
            <ArticleShareButton
              article={article}
              variant="icon"
              size="md"
              className="w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-accent/50"
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-9 h-9 rounded transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50"
              title="Close reader (Esc)"
              aria-label="Close article reader"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Metadata row */}
        <div className="px-4 sm:px-6 py-2 border-t border-border/20 bg-background/50 flex items-center gap-4 text-xs text-muted-foreground/70 overflow-x-auto">
          {metadata.author && (
            <div>
              <span className="font-medium">By:</span> {metadata.author}
            </div>
          )}
          {metadata.date && (
            <div>
              <span className="font-medium">Published:</span> {metadata.date}
            </div>
          )}
          {article.snippet && (
            <div className="flex-1">
              <span className="font-medium">Preview:</span> {article.snippet.substring(0, 100)}...
            </div>
          )}
        </div>
      </header>

      {/* Content area */}
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {isLoading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Loading article content...</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Extracting and formatting content</p>
            </div>
          ) : error ? (
            // Error State
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle size={40} className="text-destructive mb-4" />
              <p className="text-sm text-foreground font-semibold mb-2">Unable to Load Article</p>
              <p className="text-xs text-muted-foreground max-w-md mb-6">{error}</p>
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary/20 text-foreground hover:bg-primary/30 transition-colors"
              >
                <ExternalLink size={16} />
                Read on {article.source}
              </a>
            </div>
          ) : (
            // Article Content
            <article className="space-y-6">
              {/* Featured image */}
              {metadata.image && !imageError && (
                <div className="rounded-lg overflow-hidden bg-muted/30 h-96 mb-8 relative">
                  <Image
                    src={metadata.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 100vw"
                    className="object-cover"
                    priority
                    onError={() => setImageError(true)}
                  />
                </div>
              )}

              {/* Article body with proper typography */}
              <div className="prose prose-invert max-w-none">
                <div 
                  className="text-base leading-relaxed text-foreground/90 space-y-4 font-reading prose-p:mb-4 prose-h2:text-xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-5 prose-h3:mb-2 prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4 prose-li:mb-2 prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4 prose-strong:font-semibold prose-em:italic"
                  dangerouslySetInnerHTML={{ 
                    __html: content || "<p>No content available. Please visit the original article to read the full story.</p>" 
                  }}
                />
              </div>

              {/* Footer with source link */}
              <div className="mt-12 pt-8 border-t border-border/20">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer ugc"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
                >
                  <span>Read full article on {article.source}</span>
                  <ExternalLink size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </article>
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * Hook to manage article reader state
 * Provides convenient state management for opening/closing the reader
 *
 * @returns Object with reader state and control functions
 *
 * @example
 * ```tsx
 * const { article, isOpen, openArticle, closeArticle } = useArticleReader();
 *
 * return (
 *   <>
 *     <button onClick={() => openArticle(someArticle)}>Read</button>
 *     {isOpen && article && (
 *       <ArticleReader article={article} onClose={closeArticle} />
 *     )}
 *   </>
 * );
 * ```
 */
export function useArticleReader() {
  const [article, setArticle] = useState<FeedItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openArticle = useCallback((item: FeedItem) => {
    setArticle(item);
    setIsOpen(true);
  }, []);

  const closeArticle = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setArticle(null), 300); // Wait for animation
  }, []);

  return {
    article,
    isOpen,
    openArticle,
    closeArticle,
  };
}
