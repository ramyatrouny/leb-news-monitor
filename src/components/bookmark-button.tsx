"use client";

import { memo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size?: "sm" | "md";
}

export const BookmarkButton = memo(function BookmarkButton({
  isBookmarked,
  onClick,
  size = "md",
}: BookmarkButtonProps) {
  const sizeClasses = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const paddingClasses = size === "sm" ? "p-2 sm:p-1.5" : "p-2 sm:p-1.5";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick(e);
          }}
          className={`${paddingClasses} rounded hover:bg-muted transition-colors active:bg-muted/60`}
          aria-label="Bookmark article"
          title="Bookmark"
        >
          {isBookmarked ? (
            // Filled bookmark
            <svg
              className={`${sizeClasses} text-amber-500`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          ) : (
            // Outline bookmark
            <svg
              className={`${sizeClasses} text-muted-foreground`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {isBookmarked ? "Remove from bookmarks" : "Bookmark article"}
      </TooltipContent>
    </Tooltip>
  );
});
