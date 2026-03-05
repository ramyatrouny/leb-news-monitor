"use client";

import { useRef, useCallback } from "react";
import type { FeedItem } from "@/app/api/feeds/route";
import type { FeedLayout } from "@/hooks/use-layout";
import { FeedCard, FeedCardSkeleton } from "./feed-card";

interface FeedContentProps {
  items: FeedItem[];
  newIds: Set<string>;
  filteredCount: number;
  visibleCount: number;
  layout: FeedLayout;
  isLoading: boolean;
  hasData: boolean;
  onLoadMore: () => void;
  highlightQuery?: string;
  onSimilar?: (item: FeedItem) => void;
}

export function FeedContent({
  items,
  newIds,
  filteredCount,
  visibleCount,
  layout,
  isLoading,
  hasData,
  onLoadMore,
  highlightQuery,
  onSimilar,
}: FeedContentProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevObserverRef = useRef<IntersectionObserver | null>(null);

  const hasMore = visibleCount < filteredCount;

  const layoutClass = layout === "grid"
    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3"
    : "flex flex-col gap-2 sm:gap-3 max-w-3xl mx-auto";

  const attachObserver = useCallback(
    (el: HTMLDivElement | null) => {
      prevObserverRef.current?.disconnect();
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) onLoadMore();
        },
        { root: scrollRef.current, threshold: 0.1 }
      );
      observer.observe(el);
      prevObserverRef.current = observer;
    },
    [onLoadMore]
  );

  return (
    <main ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
      <div className="p-2.5 sm:p-4">
        {isLoading && (
          <div key={layout} className={`layout-enter ${layoutClass}`}>
            {Array.from({ length: 12 }).map((_, i) => (
              <FeedCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div key={layout} className={`layout-enter ${layoutClass}`}>
            {items.map((item) => (
              <FeedCard key={item.id} item={item} isNew={newIds.has(item.id)} highlightQuery={highlightQuery} onSimilar={onSimilar} />
            ))}
          </div>
        )}

        {hasMore && (
          <div ref={attachObserver} className="py-6">
            <div className="flex items-center justify-center gap-2 text-xs sm:text-[10px] text-muted-foreground">
              <div className="w-3 h-3 border border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              Loading more...
            </div>
          </div>
        )}

        {!hasMore && items.length > 0 && (
          <div className="py-6 text-center pb-[env(safe-area-inset-bottom)]">
            <span className="text-xs sm:text-[10px] text-muted-foreground/40">
              End of feed — {filteredCount} articles
            </span>
          </div>
        )}

        {!isLoading && filteredCount === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-20">
            {hasData ? (
              <>
                <p className="text-sm sm:text-xs text-muted-foreground">
                  No articles match current filters.
                </p>
                <p className="text-xs sm:text-[10px] text-muted-foreground/60">
                  Try a different category or clear the source filter.
                </p>
              </>
            ) : (
              <>
                <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-muted-foreground/50 rounded-full animate-spin" />
                <p className="text-sm sm:text-xs text-muted-foreground">
                  Waiting for feeds...
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
