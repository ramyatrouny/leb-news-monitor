import Parser from "rss-parser";
import { RSS_FEEDS, type FeedCategory } from "@/config/feeds";
import { setCachedArticle, getCachedArticle, getCachedTier } from "@/lib/article-cache";
import type { ArticleResult } from "@/app/api/article/route";

export interface FeedItem {
  id: string;
  title: string;
  link: string;
  snippet: string;
  pubDate: string;
  source: string;
  sourceColor?: string;
  sourceCategory: FeedCategory;
  image?: string;
  /** Word count of the full article content from the RSS source */
  wordCount: number;
}

/** Each NDJSON line is one of these message types */
export type StreamMessage =
  | { type: "batch"; items: FeedItem[]; source: string }
  | { type: "error"; source: string; message: string }
  | { type: "done"; sources: number; errors: string[]; fetchedAt: string };

type MediaObj = { $?: { url?: string }; url?: string } | string;

type CustomItem = {
  "media:content"?: MediaObj | MediaObj[];
  "media:thumbnail"?: MediaObj | MediaObj[];
  enclosure?: { url?: string; type?: string };
  content?: string;
};

const parser = new Parser<Record<string, unknown>, CustomItem>({
  timeout: 10_000,
  headers: {
    "User-Agent": "LebMonitor/1.0",
  },
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: false }],
      ["media:thumbnail", "media:thumbnail", { keepArray: false }],
    ],
  },
});

function isAbsoluteHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function extractImage(item: CustomItem): string | undefined {
  const mc = item["media:content"];
  if (mc) {
    const first = Array.isArray(mc) ? mc[0] : mc;
    if (typeof first === "string" && isAbsoluteHttpUrl(first)) return first;
    const url = first && typeof first !== "string" ? (first.$?.url || first.url) : undefined;
    if (url && isAbsoluteHttpUrl(url)) return url;
  }

  const mt = item["media:thumbnail"];
  if (mt) {
    const first = Array.isArray(mt) ? mt[0] : mt;
    if (typeof first === "string" && isAbsoluteHttpUrl(first)) return first;
    const url = first && typeof first !== "string" ? (first.$?.url || first.url) : undefined;
    if (url && isAbsoluteHttpUrl(url)) return url;
  }

  if (item.enclosure?.url && isAbsoluteHttpUrl(item.enclosure.url)) {
    const t = item.enclosure.type || "";
    if (t.startsWith("image/") || /\.(jpe?g|png|webp|gif)/i.test(item.enclosure.url)) {
      return item.enclosure.url;
    }
  }

  if (item.content) {
    const match = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match?.[1] && isAbsoluteHttpUrl(match[1])) return match[1];
  }

  return undefined;
}

/**
 * Fix malformed XML attributes (e.g. `<tag attr1 attr2="val">`)
 * by adding `=""` to bare attributes that the XML parser chokes on.
 */
function sanitizeXml(xml: string): string {
  const cdataSlots: string[] = [];
  const noCdata = xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, (m) => {
    cdataSlots.push(m);
    return `<!--CDATA_SLOT_${cdataSlots.length - 1}-->`;
  });

  const fixed = noCdata.replace(/<([^>]+)>/g, (fullMatch, inner: string) => {
    if (inner.startsWith("?") || inner.startsWith("!") || inner.startsWith("/")) {
      return fullMatch;
    }
    let result = "";
    let i = 0;
    let isFirstWord = true;
    while (i < inner.length) {
      if (/\s/.test(inner[i])) {
        result += inner[i++];
        continue;
      }
      if (inner[i] === '"' || inner[i] === "'") {
        const q = inner[i];
        result += q;
        i++;
        while (i < inner.length && inner[i] !== q) {
          result += inner[i++];
        }
        if (i < inner.length) result += inner[i++];
        continue;
      }
      const tokenStart = i;
      while (i < inner.length && !/[\s"'=]/.test(inner[i]) && inner[i] !== "/" && inner[i] !== ">") {
        i++;
      }
      if (i > tokenStart) {
        const token = inner.slice(tokenStart, i);
        result += token;
        if (isFirstWord) {
          isFirstWord = false;
        } else {
          let j = i;
          while (j < inner.length && /\s/.test(inner[j])) j++;
          if (j >= inner.length || inner[j] !== "=") {
            result += '=""';
          }
        }
        continue;
      }
      result += inner[i++];
    }
    return `<${result}>`;
  });

  return fixed.replace(/<!--CDATA_SLOT_(\d+)-->/g, (_, idx) => cdataSlots[Number(idx)]);
}

async function fetchFeedXml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "LebMonitor/1.0" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.text();
  try {
    return sanitizeXml(raw);
  } catch {
    return raw;
  }
}

interface ParsedItem extends CustomItem {
  title?: string;
  link?: string;
  guid?: string;
  contentSnippet?: string;
  content?: string;
  isoDate?: string;
  pubDate?: string;
}

function countWords(text: string | undefined): number {
  if (!text) return 0;
  const plain = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!plain) return 0;
  return plain.split(/\s+/).filter(Boolean).length;
}

/**
 * Strip HTML tags and return plain text.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function parseFeedItems(feed: (typeof RSS_FEEDS)[number], parsed: { items?: ParsedItem[] }): FeedItem[] {
  return (parsed.items ?? []).map(
    (item): FeedItem => {
      const fullText = item.content ?? item.contentSnippet ?? "";
      const snippetText =
        item.contentSnippet?.slice(0, 200) ??
        item.content?.replace(/<[^>]*>/g, "").slice(0, 200) ??
        "";
      const titleText = item.title ?? "Untitled";
      const link = item.link ?? "#";
      const wc = countWords(fullText) || countWords(titleText);

      // Pre-populate article cache with RSS content so reading mode
      // can render instantly without a separate fetch.
      if (fullText && link !== "#" && wc > 30) {
        const textContent = stripHtml(fullText);
        const rssArticle: ArticleResult = {
          title: titleText,
          content: fullText,
          textContent,
          excerpt: textContent.slice(0, 200),
          siteName: feed.name,
          wordCount: wc,
          byline: null,
        };
        setCachedArticle(link, rssArticle, "rss");
      }

      // Use full-tier cached word count if available (from previous
      // reading-mode extractions), otherwise fall back to RSS word count.
      const cachedTier = link !== "#" ? getCachedTier(link) : null;
      const fullWordCount =
        cachedTier === "full" ? getCachedArticle(link)?.wordCount : undefined;

      return {
        id: `${feed.name}-${item.link ?? item.guid ?? item.title}`,
        title: titleText,
        link,
        snippet: snippetText,
        pubDate: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        source: feed.name,
        sourceColor: feed.color,
        sourceCategory: feed.category,
        image: extractImage(item),
        wordCount: fullWordCount ?? wc,
      };
    }
  );
}

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  const errors: string[] = [];
  const uniqueSources = new Set(RSS_FEEDS.map((f) => f.name)).size;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (msg: StreamMessage) => {
        controller.enqueue(encoder.encode(JSON.stringify(msg) + "\n"));
      };

      // Fire all feeds in parallel, stream each as it resolves
      const promises = RSS_FEEDS.map(async (feed) => {
        try {
          const xml = await fetchFeedXml(feed.url);
          const parsed = await parser.parseString(xml);
          const items = parseFeedItems(feed, parsed);
          if (items.length > 0) {
            send({ type: "batch", items, source: feed.name });
          }
        } catch (err) {
          const msg = `${feed.name}: ${(err as Error)?.message ?? "Unknown error"}`;
          console.error(`[feed-error] ${msg}`);
          errors.push(msg);
          send({ type: "error", source: feed.name, message: (err as Error)?.message ?? "Unknown error" });
        }
      });

      try {
        await Promise.allSettled(promises);

        send({ type: "done", sources: uniqueSources, errors, fetchedAt: new Date().toISOString() });
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store",
    },
  });
}
