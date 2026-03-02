"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { FeedPrefs } from "@/hooks/use-feed-prefs";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ORDER,
  type FeedCategory,
} from "@/config/feeds";

interface SourceInfo {
  name: string;
  color?: string;
  count: number;
  category: FeedCategory;
}

export function FeedSettings({
  sources,
  prefs,
  onToggle,
  onMove,
}: {
  sources: SourceInfo[];
  prefs: FeedPrefs;
  onToggle: (source: string) => void;
  onMove: (source: string, direction: "up" | "down") => void;
}) {
  // Group by category, order within category by prefs
  const byCategory = CATEGORY_ORDER.map((cat) => {
    const catSources = sources
      .filter((s) => s.category === cat)
      .sort((a, b) => {
        const ai = prefs.order.indexOf(a.name);
        const bi = prefs.order.indexOf(b.name);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
    return { category: cat, sources: catSources };
  }).filter((g) => g.sources.length > 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded text-xs sm:text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground active:text-foreground hover:bg-accent/50 active:bg-accent/50 transition-colors cursor-pointer"
          title="Manage feeds"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="sm:w-3 sm:h-3"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Feeds
        </button>
      </SheetTrigger>

      <SheetContent className="w-full sm:w-[320px] bg-background border-border/50 p-0">
        <SheetHeader className="px-4 py-3 border-b border-border/40">
          <SheetTitle className="text-sm font-semibold uppercase tracking-wide">
            Manage Feeds
          </SheetTitle>
          <SheetDescription className="text-xs sm:text-[10px] text-muted-foreground mt-0.5">
            Toggle visibility and reorder columns
          </SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto max-h-[calc(100vh-80px)] overscroll-contain pb-[env(safe-area-inset-bottom)]">
          {byCategory.map(({ category, sources: catSources }) => (
            <div key={category}>
              {/* Category header */}
              <div
                className="px-4 py-2.5 sm:py-2 border-b border-border/30 flex items-center gap-2"
                style={{ backgroundColor: `${CATEGORY_COLORS[category]}08` }}
              >
                <div
                  className="w-1 h-3 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[category] }}
                />
                <span
                  className="text-[11px] sm:text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: CATEGORY_COLORS[category] }}
                >
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="text-[10px] sm:text-[9px] text-muted-foreground/50 ml-auto">
                  {catSources.length}
                </span>
              </div>

              {/* Sources in category */}
              {catSources.map((source, i) => {
                const isHidden = prefs.hidden.has(source.name);
                const isFirst = i === 0;
                const isLast = i === catSources.length - 1;

                return (
                  <div
                    key={source.name}
                    className={`flex items-center gap-3 px-4 py-3 sm:py-2.5 border-b border-border/20 transition-opacity ${
                      isHidden ? "opacity-40" : ""
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: source.color || "oklch(0.50 0 0)",
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <span className="text-sm sm:text-xs font-medium truncate block">
                        {source.name}
                      </span>
                      <span className="text-xs sm:text-[10px] text-muted-foreground">
                        {source.count} article{source.count !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-5 sm:w-5 text-muted-foreground hover:text-foreground cursor-pointer"
                        disabled={isFirst}
                        onClick={() => onMove(source.name, "up")}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-2.5 sm:h-2.5">
                          <path d="m18 15-6-6-6 6" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-5 sm:w-5 text-muted-foreground hover:text-foreground cursor-pointer"
                        disabled={isLast}
                        onClick={() => onMove(source.name, "down")}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-2.5 sm:h-2.5">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </Button>
                    </div>

                    <Switch
                      checked={!isHidden}
                      onCheckedChange={() => onToggle(source.name)}
                      className="scale-90 sm:scale-75"
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
