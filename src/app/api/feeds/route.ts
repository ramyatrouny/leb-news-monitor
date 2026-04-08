import Parser from "rss-parser";
import { RSS_FEEDS, type FeedCategory } from "@/config/feeds";

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

function parseFeedItems(feed: (typeof RSS_FEEDS)[number], parsed: { items?: ParsedItem[] }): FeedItem[] {
  return (parsed.items ?? []).map(
    (item): FeedItem => ({
      id: `${feed.name}-${item.link ?? item.guid ?? item.title}`,
      title: item.title ?? "Untitled",
      link: item.link ?? "#",
      snippet:
        item.contentSnippet?.slice(0, 200) ??
        item.content?.replace(/<[^>]*>/g, "").slice(0, 200) ??
        "",
      /**
       * Use publication date from RSS feed (isoDate or pubDate)
       * Never fall back to current time, as this would make old articles appear fresh
       * If no date is available, use a very old date (epoch + 1 year) to push undated articles to bottom
       */
      pubDate:
        item.isoDate ??
        item.pubDate ??
        // Fallback to early date (1971) to show undated articles at bottom
        new Date(1971, 0, 1).toISOString(),
      source: feed.name,
      sourceColor: feed.color,
      sourceCategory: feed.category,
      image: extractImage(item),
    })
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
