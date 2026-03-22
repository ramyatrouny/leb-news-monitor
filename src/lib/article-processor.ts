/**
 * Article content processor utility
 * 
 * Handles:
 * - Fetching article HTML from URL
 * - Extracting main content (title, body, metadata)
 * - Cleaning and sanitizing HTML
 * - Error handling and fallbacks
 * 
 * This uses a simple heuristic approach to extract main article content
 * without requiring external dependencies like Readability.js
 */

interface ProcessedArticle {
  title: string;
  content: string;
  author?: string;
  publishedDate?: string;
  imageUrl?: string;
  source: string;
}

/**
 * Extract main article content from fetched HTML
 * Uses content-length heuristics and DOM structure analysis to find main article only
 * Removes sidebars, widgets, ads, and template fragments
 * 
 * @param html - Raw HTML from article URL
 * @returns Cleaned and extracted article content
 */
function extractArticleContent(html: string): string {
  try {
    // Remove script and style tags first
    let cleaned = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");

    // Remove template fragments and widget references (common in template-based sites)
    cleaned = cleaned
      .replace(/\{\{[^}]+\}\}/g, "") // Remove {{variable}} template literals
      .replace(/\{\%[^%]+\%\}/g, "") // Remove {% tag %} template literals
      .replace(/<!--[\s\S]*?-->/g, "") // Remove HTML comments
      .replace(/<[^>]*widget[^>]*>[\s\S]*?<\/[^>]*>/gi, "") // Remove widget containers
      .replace(/class=["'][^"']*widget[^"']*["']/gi, "") // Remove widget classes
      .replace(/id=["'][^"']*widget[^"']*["']/gi, ""); // Remove widget IDs

    // Create temporary DOM container
    const temp = document.createElement("div");
    temp.innerHTML = cleaned;

    // Aggressively remove non-content elements
    const removeSelectors = [
      "nav",
      "header",
      "footer",
      "aside",
      ".sidebar",
      ".side-bar",
      ".widget",
      ".advertisement",
      ".ads",
      ".tracking",
      ".social-share",
      ".related-articles",
      ".comments",
      ".newsletter",
      "[role='complementary']",
      "[role='navigation']",
      "[role='contentinfo']",
      ".breadcrumb",
      ".meta-info",
      ".ad",
      ".banner",
      ".promo",
      "script",
      "style",
      "iframe:not([src*='youtube.com']):not([src*='vimeo.com'])", // Keep video embeds
    ];

    removeSelectors.forEach((selector) => {
      try {
        temp.querySelectorAll(selector).forEach((el) => el.remove());
      } catch {
        // Ignore invalid selectors
      }
    });

    // Find main content containers in order of likelihood
    const mainContentSelectors = [
      "[role='main']",
      "main",
      "article",
      ".article-content",
      ".post-content",
      ".entry-content",
      ".content-body",
      ".article-body",
      "[data-content]",
      ".story-content",
    ];

    let mainContent: HTMLElement | null = null;
    for (const selector of mainContentSelectors) {
      const element = temp.querySelector(selector);
      if (element && (element.textContent || "").length > 300) {
        mainContent = element as HTMLElement;
        break;
      }
    }

    // If no main content container found, use the largest text container or fallback to entire cleaned temp
    if (!mainContent) {
      // Try to find the largest container with substantial text
      const allContainers = Array.from(temp.querySelectorAll("div, section, article")).filter(
        (el) => (el.textContent || "").length > 300
      );
      
      if (allContainers.length > 0) {
        // Sort by text content length and use the largest
        allContainers.sort(
          (a, b) => (b.textContent || "").length - (a.textContent || "").length
        );
        mainContent = allContainers[0] as HTMLElement;
      } else {
        mainContent = temp;
      }
    }

    // Extract and clean HTML structure while preserving formatting
    let contentHtml = mainContent.innerHTML || "";

    // Remove URLs and template fragments
    contentHtml = contentHtml
      .replace(/https?:\/\/[^\s<"'>]+/g, "") // Remove URLs
      .replace(/www\.[^\s<"'>]+/g, "") // Remove www links
      .replace(/\{\{[^}]+\}\}/g, "") // Remove {{variable}} template literals
      .replace(/\{\%[^%]+\%\}/g, "") // Remove {% tag %} template tags
      .replace(/<!--[\s\S]*?-->/g, ""); // Remove HTML comments

    // Create another temp div to process the HTML
    const htmlTemp = document.createElement("div");
    htmlTemp.innerHTML = contentHtml;

    // Remove script, style, and other non-content tags
    const unwantedSelectors = ["script", "style", "iframe", "noscript", ".advertisement", ".ads"];
    unwantedSelectors.forEach((selector) => {
      try {
        htmlTemp.querySelectorAll(selector).forEach((el) => el.remove());
      } catch {
        // Ignore invalid selectors
      }
    });

    // Get the cleaned HTML
    let cleanedHtml = htmlTemp.innerHTML;

    // Remove empty or whitespace-only paragraphs
    cleanedHtml = cleanedHtml.replace(/<p>\s*<\/p>/g, "").replace(/<div>\s*<\/div>/g, "");

    // Clean up excessive whitespace within tags
    cleanedHtml = cleanedHtml.replace(/>\s+</g, "><").replace(/\s+/g, " ");

    // If HTML extraction is too minimal, fall back to plain text extraction
    const textContent = mainContent.textContent || "";
    const cleanText = textContent
      .replace(/https?:\/\/[^\s]+/g, "") // Remove URLs
      .replace(/www\.[^\s]+/g, "") // Remove www links
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n\n");

    // Use HTML if substantial, otherwise use formatted text
    const useHtml = cleanedHtml && cleanedHtml.length > 500 && cleanedHtml.includes("<p");
    const finalContent = useHtml ? cleanedHtml : `<p>${cleanText.split("\n\n").join("</p><p>")}</p>`;

    if (!finalContent || finalContent.length < 100) {
      return "Article content could not be extracted. Please visit the original source.";
    }

    return finalContent;
  } catch (error) {
    console.error("Error extracting article content:", error);
    return "Unable to extract article content at this time.";
  }
}

/**
 * Extract metadata from article HTML
 * Searches for common meta tags and structured data
 * 
 * @param html - Raw HTML from article URL
 * @returns Extracted metadata (author, date, image)
 */
function extractMetadata(html: string): Partial<ProcessedArticle> {
  try {
    const metadata: Partial<ProcessedArticle> = {};

    const temp = document.createElement("div");
    temp.innerHTML = html;

    // Author
    const authorMeta = temp.querySelector(
      "meta[name='author'], meta[property='article:author'], [rel='author']"
    );
    if (authorMeta) {
      metadata.author = authorMeta.getAttribute("content") || authorMeta.textContent || undefined;
    }

    // Published date
    const dateMeta = temp.querySelector(
      "meta[property='article:published_time'], meta[name='publish_date'], time"
    );
    if (dateMeta) {
      metadata.publishedDate =
        dateMeta.getAttribute("content") ||
        dateMeta.getAttribute("datetime") ||
        dateMeta.textContent ||
        undefined;
    }

    // Image
    const imageMeta = temp.querySelector(
      "meta[property='og:image'], meta[name='twitter:image'], img[alt*='article'], img[alt*='featured']"
    );
    if (imageMeta) {
      metadata.imageUrl = imageMeta.getAttribute("content") || imageMeta.getAttribute("src") || undefined;
    }

    return metadata;
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return {};
  }
}

/**
 * Fetch and process an article from a URL
 * Handles CORS issues by attempting direct fetch first, then fallback
 * 
 * @param url - Article URL to fetch
 * @param title - Article title (for content extraction heuristics)
 * @param source - Source name for context
 * @returns ProcessedArticle with extracted content and metadata
 * 
 * @throws Error if fetch fails and no CORS proxy available
 */
export async function fetchArticleContent(
  url: string,
  title: string,
  source: string
): Promise<ProcessedArticle> {
  try {
    // Attempt direct fetch with no-CORS mode (limited but works for many sites)
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      // Note: no-cors mode won't work for HTML parsing; try regular mode first
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extract content and metadata
    const content = extractArticleContent(html);
    const metadata = extractMetadata(html);

    return {
      title,
      content,
      source,
      ...metadata,
    };
  } catch {
    // Fallback: inform user to visit original source
    return {
      title,
      content: `Unable to load article preview. The news source may not allow automated content extraction for privacy or technical reasons.\n\nPlease visit the original article to read the full content.`,
      source,
    };
  }
}

/**
 * Format article content for display
 * Adds proper line breaks and structure
 * 
 * @param content - Raw article content
 * @returns Formatted HTML-safe content
 */
export function formatArticleContent(content: string): string {
  return content
    .split("\n")
    .map((paragraph) => {
      if (!paragraph.trim()) return "";
      // Escape HTML characters
      return paragraph
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    })
    .join("\n\n");
}
