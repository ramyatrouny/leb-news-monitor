"use client";

import { useId, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
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
}: {
  sources: SourceInfo[];
  prefs: FeedPrefs;
  onToggle: (source: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const byCategory = CATEGORY_ORDER.map((cat) => {
    const catSources = sources
      .filter((s) => s.category === cat && (!searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())))
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

  const hiddenCount = prefs.hidden.size;
  const totalCount = sources.length;

  const sheetId = useId();

  return (
    <Sheet>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <button
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded text-xs sm:text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground active:text-foreground hover:bg-accent/50 active:bg-accent/50 transition-colors cursor-pointer"
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
          {hiddenCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-3.5 sm:h-3.5 rounded-full bg-primary text-primary-foreground text-[9px] sm:text-[8px] font-bold flex items-center justify-center">
              {hiddenCount}
            </span>
          )}
            </button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Manage feeds</TooltipContent>
      </Tooltip>

      <SheetContent className="w-full sm:w-[320px] bg-background border-border/50 p-0" id={sheetId}>
        <SheetHeader className="px-4 py-3 border-b border-border/40">
          <SheetTitle className="text-sm font-semibold uppercase tracking-wide">
            Manage Sources
          </SheetTitle>
          <SheetDescription className="text-xs sm:text-[10px] text-muted-foreground mt-0.5">
            {hiddenCount > 0
              ? `${totalCount - hiddenCount} of ${totalCount} sources active`
              : `All ${totalCount} sources active`}
          </SheetDescription>
        </SheetHeader>

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-border/40 bg-secondary/5">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md bg-background border border-border/60 text-xs sm:text-[10px] text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all hover:border-border/80"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 overscroll-contain pb-[env(safe-area-inset-bottom)]">
          {byCategory.map(({ category, sources: catSources }) => {
            const catHidden = catSources.filter((s) =>
              prefs.hidden.has(s.name)
            ).length;

            return (
              <div key={category}>
                {/* Category header */}
                <div
                  className="px-4 py-2.5 sm:py-2 border-b border-border/30 flex items-center gap-2 sticky top-0 z-10 backdrop-blur-sm"
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
                  <span className="text-[10px] sm:text-[9px] text-muted-foreground/50 ml-auto tabular-nums">
                    {catHidden > 0
                      ? `${catSources.length - catHidden}/${catSources.length}`
                      : catSources.length}
                  </span>
                </div>

                {/* Sources in category */}
                {catSources.map((source) => {
                  const isHidden = prefs.hidden.has(source.name);

                  return (
                    <div
                      role="button"
                      tabIndex={0}
                      key={source.name}
                      onClick={() => onToggle(source.name)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(source.name); } }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 sm:py-2.5 border-b border-border/20 transition-all cursor-pointer active:bg-accent/30 ${
                        isHidden ? "opacity-40" : ""
                      }`}
                    >
                      <div
                        className="w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full shrink-0 transition-opacity"
                        style={{
                          backgroundColor: source.color || "oklch(0.50 0 0)",
                        }}
                      />

                      <div className="flex-1 min-w-0 text-left">
                        <span className="text-sm sm:text-xs font-medium truncate block">
                          {source.name}
                        </span>
                        <span className="text-xs sm:text-[10px] text-muted-foreground tabular-nums">
                          {source.count} article{source.count !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <Switch
                        checked={!isHidden}
                        onCheckedChange={() => onToggle(source.name)}
                        onClick={(e) => e.stopPropagation()}
                        className="scale-100 sm:scale-90"
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
