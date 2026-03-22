"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { fetchArticleContent } from "@/lib/article-processor";
import type { FeedItem } from "@/app/api/feeds/route";

interface ArticlePreviewModalProps {
  article: FeedItem | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Article Preview Modal Component
 *
 * Displays full article content fetched from the article URL.
 * Features:
 * - Automatic content extraction and cleanup
 * - Loading state with spinner
 * - Error handling with fallback message
 * - Smooth animations
 * - Responsive design for mobile and desktop
 * - Keyboard support (Escape to close)
 *
 * @param article - FeedItem to display, or null if no article selected
 * @param isOpen - Whether modal is visible
 * @param onClose - Callback to close the modal
 *
 * @example
 * ```tsx
 * const [selectedArticle, setSelectedArticle] = useState<FeedItem | null>(null);
 * const [isOpen, setIsOpen] = useState(false);
 *
 * return (
 *   <>
 *     <ArticlePreviewModal
 *       article={selectedArticle}
 *       isOpen={isOpen}
 *       onClose={() => setIsOpen(false)}
 *     />
 *   </>
 * );
 * ```
 */
export function ArticlePreviewModal({
  article,
  isOpen,
  onClose,
}: ArticlePreviewModalProps) {
  const [content, setContent] = useState<string>("");
  const [metadata, setMetadata] = useState<{ author?: string; date?: string; image?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch article content when modal opens
   */
  useEffect(() => {
    if (!isOpen || !article) {
      return;
    }

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
            : "Failed to load article. Please try visiting the original source."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [isOpen, article]);

  /**
   * Handle keyboard escape to close modal
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  /**
   * Handle backdrop click to close modal
   */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen || !article) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-200"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative bg-background rounded-lg shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/40 px-6 py-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">{article.title}</h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider" style={{ color: article.sourceColor }}>
                  {article.source}
                </span>
                {metadata.date && (
                  <>
                    <span>•</span>
                    <span>{new Date(metadata.date).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              title="Close"
              aria-label="Close article preview"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoading ? (
              // Loading State
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={32} className="text-primary animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">Loading article content...</p>
              </div>
            ) : error ? (
              // Error State
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle size={32} className="text-destructive mb-3" />
                <p className="text-sm text-foreground font-medium mb-2">Unable to Load Content</p>
                <p className="text-xs text-muted-foreground max-w-xs">{error}</p>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium bg-primary/20 text-foreground hover:bg-primary/30 transition-colors"
                >
                  <ExternalLink size={14} />
                  Read on Source
                </a>
              </div>
            ) : (
              // Content
              <div className="space-y-4">
                {/* Article Metadata */}
                {(metadata.author || metadata.image) && (
                  <div className="pb-4 border-b border-border/20">
                    {metadata.author && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">By:</span> {metadata.author}
                      </p>
                    )}
                  </div>
                )}

                {/* Article Body */}
                <article className="prose prose-invert max-w-none">
                  <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {content || "No content available"}
                  </div>
                </article>

                {/* Footer with link to source */}
                <div className="mt-6 pt-4 border-t border-border/20">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink size={14} />
                    View full article on {article.source}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Hook to manage article preview modal state
 * Provides convenient state management for the modal
 *
 * @returns Object with modal state and control functions
 *
 * @example
 * ```tsx
 * const { article, isOpen, openArticle, closeArticle } = useArticlePreview();
 *
 * return (
 *   <>
 *     <button onClick={() => openArticle(someArticle)}>Open</button>
 *     <ArticlePreviewModal
 *       article={article}
 *       isOpen={isOpen}
 *       onClose={closeArticle}
 *     />
 *   </>
 * );
 * ```
 */
export function useArticlePreview() {
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
