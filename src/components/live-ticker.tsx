"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ChevronRight, AlertCircle, ChevronUp } from "lucide-react";
import type { FeedItem } from "@/app/api/feeds/route";

interface LiveTickerProps {
  items: FeedItem[];
  position?: "top" | "bottom";
  onArticleClick?: (article: FeedItem) => void;
  onHide?: () => void;
  maxItems?: number;
}

/**
 * Live Ticker Bar Component
 *
 * CNN-style horizontal scrolling news ticker showing latest articles.
 *
 * Features:
 * - Smooth CSS-based scrolling animation (no glitches)
 * - Click to jump to specific article
 * - Pauses scroll on hover for readability
 * - Toggle hide/show with smooth transitions
 * - Shows article source with colored badges
 * - Responsive design
 * - Infinite scroll effect (seamless loop)
 * - Performance optimized with memoization
 *
 * @param items - Array of FeedItems to display
 * @param position - Display at "top" or "bottom" of screen
 * @param onArticleClick - Callback when user clicks an article
 * @param maxItems - Maximum number of articles to show (default: 20)
 *
 * @example
 * ```tsx
 * <LiveTicker
 *   items={articles}
 *   position="bottom"
 *   onArticleClick={(article) => openPreview(article)}
 *   maxItems={15}
 * />
 * ```
 */
export function LiveTicker({
  items,
  position = "bottom",
  onArticleClick,
  onHide,
  maxItems = 20,
}: LiveTickerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Get latest items (sorted by pubDate, newest first)
  const displayItems = useMemo(() => {
    return [...items]
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, maxItems);
  }, [items, maxItems]);

  /**
   * Auto-scroll ticker items using simple interval
   * Much smoother and less glitchy than requestAnimationFrame
   */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isHovered || displayItems.length === 0) return;

    const animateScroll = () => {
      if (container.scrollLeft < container.scrollWidth - container.clientWidth) {
        container.scrollLeft += 1;
      } else {
        container.scrollLeft = 0;
      }
    };

    // Use a slower interval for smooth scrolling without glitches
    const interval = setInterval(animateScroll, 30);
    return () => clearInterval(interval);
  }, [isHovered, displayItems.length]);

  if (displayItems.length === 0) {
    return null;
  }

  const positionClasses = position === "top" ? "top-0" : "bottom-0";
  const borderClasses = position === "top" ? "border-b" : "border-t";

  return (
    <div
      className={`fixed ${positionClasses} left-0 right-0 bg-gradient-to-r from-background via-background to-background/80 border-border/40 ${borderClasses} z-20 shadow-lg transition-all duration-300 ease-in-out`}
    >
      {/* Breaking News Indicator */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-destructive/10 border-b border-destructive/20">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
          <AlertCircle size={12} className="animate-pulse" />
          <span>Live Updates</span>
        </div>

        {/* Toggle visibility button */}
        <button
          onClick={() => onHide?.()}
          className="inline-flex items-center justify-center w-5 h-5 rounded transition-colors text-destructive hover:text-destructive/80 hover:bg-destructive/10"
          title="Hide ticker"
          aria-label="Hide live ticker"
        >
          <ChevronUp size={14} />
        </button>
      </div>

      {/* Ticker Content */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scroll-smooth"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="flex gap-2 px-3 py-2 w-max">
          {/* Duplicate items for infinite scroll effect */}
          {[...displayItems, ...displayItems].map((item, index) => (
            <button
              key={`${item.id}-${index}`}
              onClick={() => onArticleClick?.(item)}
              className="group flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/50 border border-border/30 hover:border-border/60 hover:bg-card transition-colors cursor-pointer whitespace-nowrap"
              title={item.title}
            >
              {/* Source Badge */}
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.sourceColor || "oklch(0.65 0.22 25)" }}
              />

              {/* Title */}
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-xs">
                {item.title}
              </span>

              {/* Hover Indicator */}
              <ChevronRight
                size={12}
                className="flex-shrink-0 text-muted-foreground/50 group-hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute right-0 top-[30px] bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}

/**
 * Toggle button to restore hidden ticker
 * Place this near the top of your feed to allow users to show the ticker again
 *
 * @param onShow - Callback when ticker should be shown
 *
 * @example
 * ```tsx
 * <LiveTickerToggle onShow={() => setTickerVisible(true)} />
 * ```
 */
export function LiveTickerToggle({ onShow }: { onShow: () => void }) {
  return (
    <button
      onClick={onShow}
      className="fixed bottom-4 left-4 z-20 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 transition-colors text-xs font-bold uppercase tracking-wider text-destructive"
      title="Show live ticker"
      aria-label="Show live ticker"
    >
      <AlertCircle size={12} className="animate-pulse" />
      <span>Live Updates</span>
    </button>
  );
}

/**
 * Compact ticker variant with minimal styling
 * Useful for sidebars or constrained spaces
 *
 * @param items - Array of FeedItems to display
 * @param onArticleClick - Callback when user clicks an article
 */
export function CompactLiveTicker({
  items,
  onArticleClick,
}: Omit<LiveTickerProps, "position">) {
  const displayItems = useMemo(
    () =>
      [...items]
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .slice(0, 5),
    [items]
  );

  return (
    <div className="space-y-1 p-3 bg-card/30 rounded-lg border border-border/20">
      <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        Live Updates
      </div>
      {displayItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onArticleClick?.(item)}
          className="block w-full text-left px-2 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors truncate"
          title={item.title}
        >
          {item.title}
        </button>
      ))}
    </div>
  );
}
