"use client";

import { useCallback, useState } from "react";
import { Share2, Copy, Check, Mail } from "lucide-react";
import { X as TwitterIcon } from "lucide-react"; // Can use as placeholder
import type { FeedItem } from "@/app/api/feeds/route";

interface ArticleShareButtonProps {
  article: FeedItem;
  variant?: "icon" | "button";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

/**
 * Article Share Button Component
 *
 * Provides multiple sharing options:
 * - Copy link to clipboard with visual feedback
 * - Share to Twitter/X
 * - Share to WhatsApp
 * - Share to Telegram
 * - Email share link
 *
 * Features:
 * - Dropdown menu with all share options
 * - Visual feedback on copy action
 * - Device-aware sharing (uses native share API on mobile if available)
 * - Keyboard accessible
 * - Mobile responsive
 *
 * @param article - FeedItem to share
 * @param variant - Display style: "icon" (just icon) or "button" (icon + text)
 * @param size - Icon size: "xs" (14px - matches other buttons), "sm" (12px), "md" (16px), "lg" (20px)
 * @param className - Additional CSS classes for styling
 *
 * @example
 * ```tsx
 * <ArticleShareButton article={article} variant="icon" size="xs" />
 * ```
 */
export function ArticleShareButton({
  article,
  variant = "icon",
  size = "md",
  className = "",
}: ArticleShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Copy article link to clipboard
   * Shows visual feedback for 2 seconds
   */
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(article.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }, [article.link]);

  /**
   * Share to Twitter/X
   * Creates a pre-filled tweet with article title and link
   */
  const handleShareTwitter = useCallback(() => {
    const text = `${article.title}\n${article.source}`;
    const url = new URL("https://twitter.com/intent/tweet");
    url.searchParams.set("text", text);
    url.searchParams.set("url", article.link);
    url.searchParams.set("via", "lebmon_news");
    window.open(url.toString(), "_blank", "width=600,height=400");
    setIsOpen(false);
  }, [article]);

  /**
   * Share to WhatsApp
   * Creates a pre-filled WhatsApp message with article title and link
   */
  const handleShareWhatsApp = useCallback(() => {
    const text = `📰 *${article.title}*\n\n_from ${article.source}_\n\n${article.link}`;
    const url = new URL("https://wa.me/");
    url.searchParams.set("text", text);
    window.open(url.toString(), "_blank");
    setIsOpen(false);
  }, [article]);

  /**
   * Share to Telegram
   * Creates a pre-filled Telegram message with article title and link
   */
  const handleShareTelegram = useCallback(() => {
    const text = `📰 *${article.title}*\n\n_from ${article.source}_`;
    const url = new URL("https://t.me/share/url");
    url.searchParams.set("url", article.link);
    url.searchParams.set("text", text);
    window.open(url.toString(), "_blank");
    setIsOpen(false);
  }, [article]);

  /**
   * Share via email
   * Creates a mailto link with article details
   */
  const handleShareEmail = useCallback(() => {
    const subject = `Shared: ${article.title}`;
    const body = `Check out this article about ${article.source}:\n\n${article.title}\n\n${article.link}`;
    const url = new URL("mailto:");
    url.searchParams.set("subject", subject);
    url.searchParams.set("body", body);
    window.location.href = url.toString();
    setIsOpen(false);
  }, [article]);

  /**
   * Handle native share API on supported devices (mobile)
   * Falls back to dropdown menu on desktop
   */
  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: `${article.title} - from ${article.source}`,
          url: article.link,
        });
      } catch (err) {
        // User cancelled share, ignore
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      // Fallback to dropdown
      setIsOpen(!isOpen);
    }
  }, [article, isOpen]);

  const sizeMap = {
    xs: 14,
    sm: 12,
    md: 16,
    lg: 20,
  };

  const iconSize = sizeMap[size];

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className={`inline-flex items-center justify-center gap-2 px-2 py-1.5 rounded transition-colors ${className || "text-muted-foreground hover:text-foreground hover:bg-accent/40"}`}
        title="Share article"
        aria-label="Share article"
        aria-expanded={isOpen}
      >
        <Share2 size={iconSize} />
        {variant === "button" && <span className="text-xs font-medium">Share</span>}
      </button>

      {/* Share menu (desktop/fallback) */}
      {isOpen && !navigator.share && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Share options dropdown */}
          <div className="absolute right-0 top-full mt-2 bg-card/95 backdrop-blur-sm border border-border/40 rounded-md shadow-lg z-40 min-w-48 overflow-hidden">
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full text-left px-4 py-2.5 text-xs transition-colors border-b border-border/20 last:border-0 text-muted-foreground hover:text-foreground hover:bg-accent/40 flex items-center gap-2"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy link"}</span>
            </button>

            {/* Twitter/X */}
            <button
              onClick={handleShareTwitter}
              className="w-full text-left px-4 py-2.5 text-xs transition-colors border-b border-border/20 last:border-0 text-muted-foreground hover:text-foreground hover:bg-accent/40 flex items-center gap-2"
            >
              <TwitterIcon size={14} />
              <span>Share on X (Twitter)</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="w-full text-left px-4 py-2.5 text-xs transition-colors border-b border-border/20 last:border-0 text-muted-foreground hover:text-foreground hover:bg-accent/40 flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.99 1.523c-1.533.926-2.836 2.312-3.762 3.961-.926 1.65-1.425 3.557-1.427 5.495-.002 1.901.487 3.693 1.433 5.27 1.144 1.926 2.897 3.42 5.055 4.215 1.589.573 3.283.87 5.08.87a9.894 9.894 0 005.494-1.678c1.594-.96 2.95-2.37 3.886-4.066.936-1.696 1.437-3.637 1.43-5.69-.003-2.035-.55-4.04-1.59-5.747-1.04-1.708-2.57-3.16-4.45-4.15a9.869 9.869 0 00-5.056-1.39m9.61.206h.005a11.909 11.909 0 016.947 2.09c2.124 1.411 3.93 3.59 5.04 6.175 1.109 2.586 1.31 5.427.572 8.056a11.856 11.856 0 01-2.532 5.477c-1.532 1.955-3.627 3.397-6.126 4.122a11.908 11.908 0 01-6.72-.11c-2.15-.685-4.053-1.917-5.467-3.589a11.913 11.913 0 01-2.55-5.226c-.503-2.32-.31-4.794.566-7.067 1.32-3.354 3.82-6.153 7.063-7.694a11.908 11.908 0 016.252-1.234z" />
              </svg>
              <span>Share on WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              onClick={handleShareTelegram}
              className="w-full text-left px-4 py-2.5 text-xs transition-colors border-b border-border/20 last:border-0 text-muted-foreground hover:text-foreground hover:bg-accent/40 flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a11.955 11.955 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.347-.48.33-.913.485-1.312.474-.431-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              <span>Share on Telegram</span>
            </button>

            {/* Email */}
            <button
              onClick={handleShareEmail}
              className="w-full text-left px-4 py-2.5 text-xs transition-colors border-b border-border/20 last:border-0 text-muted-foreground hover:text-foreground hover:bg-accent/40 flex items-center gap-2"
            >
              <Mail size={14} />
              <span>Share via email</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
