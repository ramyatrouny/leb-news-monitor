import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import { NextRequest, NextResponse } from "next/server";
import { getCachedArticle, getCachedTier, setCachedArticle } from "@/lib/article-cache";

export interface ArticleResult {
  title: string;
  content: string;       // HTML content
  textContent: string;   // Plain text
  excerpt: string;
  siteName: string;
  wordCount: number;
  byline: string | null;
}

const FETCH_TIMEOUT_MS = 12_000;
const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5 MB cap

/**
 * Fetches a web page and extracts its main article content
 * using Mozilla Readability.
 *
 * Checks the in-memory article cache first:
 *  - "full" tier  → return immediately (already high quality)
 *  - "rss" tier   → return the RSS content but also attempt a
 *                    background upgrade to "full" quality
 *  - miss         → fetch, extract, cache as "full", return
 *
 * GET /api/article?url=<encoded-url>
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json(
      { error: "Missing or invalid 'url' parameter" },
      { status: 400 },
    );
  }

  // ── Cache check ───────────────────────────────────────────
  const cachedTier = getCachedTier(url);
  if (cachedTier === "full") {
    // Best quality, return immediately
    return NextResponse.json(getCachedArticle(url)!, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
        "X-Article-Cache": "hit-full",
      },
    });
  }

  if (cachedTier === "rss") {
    // Return RSS content immediately; try upgrading in the background
    const rssArticle = getCachedArticle(url)!;
    // Fire-and-forget full extraction to upgrade cache for next time
    fetchAndCacheFull(url).catch(() => {});
    return NextResponse.json(rssArticle, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Article-Cache": "hit-rss",
      },
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LebMonitor/1.0; +https://lebmonitor.com)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Source returned HTTP ${res.status}` },
        { status: 502 },
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("html") && !contentType.includes("xml")) {
      return NextResponse.json(
        { error: "Source did not return HTML content" },
        { status: 422 },
      );
    }

    // Stream body with size cap
    const reader = res.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { error: "Could not read response body" },
        { status: 502 },
      );
    }

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        reader.cancel();
        break;
      }
      chunks.push(value);
    }

    const html = new TextDecoder().decode(
      chunks.length === 1
        ? chunks[0]
        : new Uint8Array(
            chunks.reduce((acc, c) => {
              const merged = new Uint8Array(acc.byteLength + c.byteLength);
              merged.set(new Uint8Array(acc));
              merged.set(c, acc.byteLength);
              return merged.buffer;
            }, new ArrayBuffer(0)),
          ),
    );

    // Parse with linkedom (lightweight, server-safe DOM)
    const { document } = parseHTML(html);

    // Remove scripts, styles, and other noise before Readability
    for (const tag of ["script", "style", "noscript", "iframe", "svg"]) {
      document.querySelectorAll(tag).forEach((el: Element) => el.remove());
    }

    const reader2 = new Readability(document as unknown as Document, {
      charThreshold: 50,
    });

    const article = reader2.parse();

    if (!article || !article.textContent?.trim()) {
      return NextResponse.json(
        { error: "Could not extract article content from page" },
        { status: 422 },
      );
    }

    const wordCount = article.textContent
      .replace(/\s+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    const result: ArticleResult = {
      title: article.title || "",
      content: article.content || "",
      textContent: article.textContent || "",
      excerpt: article.excerpt || "",
      siteName: article.siteName || "",
      wordCount,
      byline: article.byline || null,
    };

    // Store as "full" quality in cache
    setCachedArticle(url, result, "full");

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
        "X-Article-Cache": "miss",
      },
    });
  } catch (err) {
    const message = (err as Error)?.message ?? "Unknown error";

    if (message.includes("abort")) {
      return NextResponse.json(
        { error: "Request timed out fetching article" },
        { status: 504 },
      );
    }

    console.error(`[article-api] Error fetching ${url}:`, message);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 },
    );
  }
}

/**
 * Background helper: fetch + extract full article and upgrade cache.
 * Called fire-and-forget when returning an RSS-tier cache hit.
 */
async function fetchAndCacheFull(url: string): Promise<void> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LebMonitor/1.0; +https://lebmonitor.com)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);
    if (!res.ok) return;

    const html = await res.text();
    const { document } = parseHTML(html.slice(0, MAX_BODY_BYTES));

    for (const tag of ["script", "style", "noscript", "iframe", "svg"]) {
      document.querySelectorAll(tag).forEach((el: Element) => el.remove());
    }

    const reader = new Readability(document as unknown as Document, {
      charThreshold: 50,
    });
    const article = reader.parse();
    if (!article?.textContent?.trim()) return;

    const wordCount = article.textContent
      .replace(/\s+/g, " ").trim()
      .split(/\s+/).filter(Boolean).length;

    setCachedArticle(url, {
      title: article.title || "",
      content: article.content || "",
      textContent: article.textContent || "",
      excerpt: article.excerpt || "",
      siteName: article.siteName || "",
      wordCount,
      byline: article.byline || null,
    }, "full");
  } catch {
    // Silently ignore — the RSS content is still served
  }
}
