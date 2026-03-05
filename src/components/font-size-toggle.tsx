"use client";

import { ALargeSmall } from "lucide-react";
import { useFontSize } from "@/hooks/use-font-size";

const LABELS = {
  small: "S",
  medium: "M",
  large: "L",
  xlarge: "XL",
} as const;

export function FontSizeToggle() {
  const { fontSize, cycleFontSize } = useFontSize();

  return (
    <button
      type="button"
      onClick={cycleFontSize}
      aria-label={`Font size: ${fontSize}. Click to cycle.`}
      title={`Font size: ${fontSize}`}
      className="flex items-center gap-1 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
    >
      <ALargeSmall size={14} />
      <span className="text-[9px] font-bold uppercase tracking-wider w-4 text-center">
        {LABELS[fontSize]}
      </span>
    </button>
  );
}
