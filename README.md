<div align="center">

# LEBMON

### Real-time conflict intelligence, from 47+ sources to your screen

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![Deploy](https://img.shields.io/badge/Live_Demo-▶_Open-ef4444?style=flat-square)](https://lebmonitor.com)

<br />

![LEB Monitor Screenshot](docs/screenshot.png)

**[Live Demo](https://lebmonitor.com)** · **[Report Bug](../../issues/new?template=bug_report.yml)** · **[Request Feature](../../issues/new?template=feature_request.yml)** · **[Suggest Source](../../issues/new?template=feed_source.yml)**

</div>

<br />

## Overview

LEB Monitor is a real-time multi-source news aggregator purpose-built for the Lebanon–Israel conflict. It streams articles from **47+ RSS feeds** spanning war coverage, breaking news, and regional analysis — in both **Arabic** and **English** — directly to a responsive, dark-mode interface.

No API keys. No database. No authentication. Just public RSS feeds, parsed server-side and streamed progressively to your browser.

<br />

## Highlights

🔴 **Real-time Streaming** — Feeds arrive via NDJSON as each source resolves; no waiting for all 47 to finish

📡 **47+ RSS Sources** — LBC, Al Jazeera, BBC, UN, MSF, Amnesty, Bellingcat, Crisis Group, and many more

🌍 **Arabic + English** — Automatic RTL/LTR text direction detection with dual font support (Poppins + Noto Sans Arabic)

🔄 **Auto-refresh** — Polls every 30 seconds with smart client-side deduplication

⚙️ **Source Management** — Toggle, reorder, and hide individual feeds via a settings panel; preferences persist in localStorage

🎨 **Dark Mode by Default** — Perceptually uniform OKLCh color system with custom scrollbars and entrance animations

📱 **Fully Responsive** — 1 / 2 / 3 column card grid across mobile, tablet, and desktop

🛡️ **Error Resilient** — Individual feed failures never block others (`Promise.allSettled`); failed sources are reported transparently

<br />

## Quick Start

**Prerequisites:** [Node.js](https://nodejs.org) 18+ and a package manager (npm, yarn, pnpm, or bun)

```bash
# 1. Clone
git clone https://github.com/ramyatrouny/leb-news-monitor.git
cd leb-news-monitor

# 2. Install
npm install

# 3. Run
npm run dev
```

Open **[localhost:3000](http://localhost:3000)** — the feed begins streaming immediately.

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint checks |

<br />

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                          Browser                              │
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │   LiveFeed    │    │   FeedCard    │    │  FeedSettings   │  │
│  │  (container)  │    │  (article)   │    │    (panel)      │  │
│  └──────┬───────┘    └──────────────┘    └────────────────┘  │
│         │                                                     │
│  ┌──────┴───────┐    ┌──────────────┐                        │
│  │ useFeedStream │    │ useFeedPrefs │                        │
│  │   (NDJSON)    │    │(localStorage)│                        │
│  └──────┬───────┘    └──────────────┘                        │
│         │                                                     │
│         │  fetch() + ReadableStream                           │
└─────────┼────────────────────────────────────────────────────┘
          │
┌─────────┴────────────────────────────────────────────────────┐
│                    Next.js API Route                          │
│                                                               │
│  GET /api/feeds                                               │
│  ├─ Fetch 47 RSS feeds in parallel (Promise.allSettled)       │
│  ├─ Sanitize malformed XML + parse via rss-parser             │
│  ├─ Extract images (media:content → thumbnail → enclosure)    │
│  ├─ Stream batches as NDJSON (each source → one batch)        │
│  └─ Report per-source errors + completion summary             │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Mount** — `<LiveFeed>` renders, `useFeedStream()` fires `GET /api/feeds`
2. **Stream** — API fetches 47 feeds in parallel; each resolved feed is streamed as an NDJSON batch
3. **Merge** — Client deduplicates by item ID, sorts by `pubDate` descending, marks new IDs for animation
4. **Render** — Responsive card grid with category/source filtering and infinite scroll (IntersectionObserver)
5. **Poll** — Every 30 seconds, the cycle repeats; new items merge in with entrance animations

<br />

## API Reference

### `GET /api/feeds`

Streams newline-delimited JSON (NDJSON). Each line is a self-contained JSON object.

#### Stream Messages

```jsonc
// Batch — emitted as each feed source resolves
{ "type": "batch", "items": [...], "source": "Al Jazeera EN" }

// Error — emitted when a single feed fails (others continue)
{ "type": "error", "source": "NNA", "message": "HTTP 503" }

// Done — emitted once when all feeds have been attempted
{ "type": "done", "sources": 47, "errors": [...], "fetchedAt": "2026-03-02T12:00:00Z" }
```

#### FeedItem Schema

```typescript
interface FeedItem {
  id: string              // Unique key: `${source}-${link || guid || title}`
  title: string           // Article headline
  link: string            // Original article URL
  snippet: string         // First 200 chars of content (HTML stripped)
  pubDate: string         // ISO 8601 timestamp
  source: string          // Feed source display name
  sourceColor?: string    // Hex brand color
  sourceCategory: string  // "war" | "breaking" | "general"
  image?: string          // Article image URL (optional)
}
```

#### Response Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Type` | `text/plain; charset=utf-8` | NDJSON stream |
| `Cache-Control` | `no-cache, no-store` | Always fresh data |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Clickjacking protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Privacy |

<br />

## Feed Sources

<details>
<summary><strong>🔴 War Focused — 17 sources</strong></summary>

<br />

| Source | Coverage |
|--------|----------|
| LBC War | Lebanese conflict updates |
| ReliefWeb LB | Humanitarian situation reports |
| OCHA Lebanon | UN humanitarian coordination |
| UN Middle East | United Nations regional desk |
| UN Peace | Peace & security dispatches |
| Middle East Monitor | Regional conflict reporting |
| Middle East Eye | Investigative journalism |
| Al Manar | Lebanese perspective |
| +972 Magazine | Israeli–Palestinian coverage |
| Mondoweiss | Palestinian rights reporting |
| Electronic Intifada | Palestinian news & analysis |
| Crisis Group | Conflict resolution analysis |
| Bellingcat | Open-source investigations |
| MSF | Doctors Without Borders field reports |
| Amnesty International | Human rights documentation |
| Defense News | Military & defense industry |
| War on the Rocks | National security analysis |

</details>

<details>
<summary><strong>🟡 Breaking News — 11 sources</strong></summary>

<br />

| Source | Coverage |
|--------|----------|
| LBC Breaking / Latest | Lebanese breaking news |
| NNA | National News Agency of Lebanon |
| The961 | Lebanese news & culture |
| Times of Israel | Israeli news coverage |
| Jerusalem Post (Headlines + Defense) | Israeli perspective |
| Al Jazeera EN | Pan-Arab English news |
| BBC Middle East | British international coverage |
| Al Hurra | US-funded Arabic news |
| Anadolu Agency | Turkish state news agency |

</details>

<details>
<summary><strong>⚪ General / Analysis — 19 sources</strong></summary>

<br />

**Arabic:** Al Jazeera AR, Sky News Arabia, BBC Arabic, BBC AR Middle East, France 24 AR, DW Arabic, Annahar, Al Arabiya, Asharq Al-Awsat, Lebanon Debate, Al Quds, Rai Al Youm

**English:** Al-Monitor, The New Arab, Guardian Middle East, Foreign Policy

</details>

<br />

## Configuration

### Adding a Feed

Edit [`src/config/feeds.ts`](src/config/feeds.ts):

```typescript
export const RSS_FEEDS: FeedSource[] = [
  // ... existing feeds
  {
    name: "Your Source",
    url: "https://example.com/rss",
    color: "#hex-color",        // Accent color for the source badge
    category: "war",            // "war" | "breaking" | "general"
  },
];
```

The feed appears automatically on the next page load. No other changes needed.

### Feed Categories

| Category | Color | Purpose |
|----------|-------|---------|
| `war` | Red `#ef4444` | Conflict, military, humanitarian |
| `breaking` | Amber `#f59e0b` | Fast-moving, time-sensitive news |
| `general` | Gray `#6b7280` | Broader analysis and regional coverage |

### User Preferences

Preferences persist in `localStorage` under `lebmon-feed-prefs`:

```json
{
  "order": ["Al Jazeera EN", "BBC ME", "..."],
  "hidden": ["Source to hide"]
}
```

Reset via browser console:

```javascript
localStorage.removeItem("lebmon-feed-prefs");
location.reload();
```

<br />

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | [Next.js](https://nextjs.org) (App Router) | 16 |
| **UI** | [React](https://react.dev) | 19 |
| **Language** | [TypeScript](https://typescriptlang.org) (strict mode) | 5 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) (CSS-based config) | 4 |
| **Components** | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com) | latest |
| **Icons** | [Lucide React](https://lucide.dev) | 0.576 |
| **RSS Parsing** | [rss-parser](https://github.com/rbren/rss-parser) | 3.13 |
| **Streaming** | NDJSON via `ReadableStream` | native |
| **Fonts** | Poppins + Noto Sans Arabic | Google Fonts |
| **Analytics** | Google Analytics via `@next/third-parties` | — |

<br />

## Deployment

### Vercel (Recommended)

Connect your GitHub repository — it deploys automatically on every push to `main`. No environment variables required.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ramyatrouny/leb-news-monitor)

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

> Enable `output: "standalone"` in `next.config.ts` for Docker builds.

### Self-Hosted

```bash
npm run build
NODE_ENV=production npm start
```

Binds to port 3000 by default. Use a reverse proxy (nginx, Caddy) for HTTPS in production.

<br />

## Security

LEB Monitor ships with security headers enabled by default via [`next.config.ts`](next.config.ts):

| Header | Value | Protection |
|--------|-------|------------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `DENY` | Blocks clickjacking via iframes |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer information leakage |

The application fetches **only public RSS feeds** server-side. No user data is collected, no cookies are set, and no authentication is required. The `/api/` routes are blocked from search engine indexing via [`robots.ts`](src/app/robots.ts).

<br />

<details>
<summary><strong>Project Structure</strong></summary>

<br />

```
leb-monitor/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, fonts, SEO metadata
│   │   ├── page.tsx                # Home page (renders LiveFeed)
│   │   ├── globals.css             # Tailwind v4 + OKLCh theme tokens
│   │   ├── manifest.ts            # PWA manifest (standalone app)
│   │   ├── robots.ts              # SEO robots.txt rules
│   │   ├── sitemap.ts             # Dynamic sitemap generation
│   │   ├── icon.tsx               # Dynamic favicon (32×32)
│   │   ├── apple-icon.tsx         # Apple touch icon (180×180)
│   │   └── api/feeds/
│   │       └── route.ts           # NDJSON streaming RSS API
│   │
│   ├── components/
│   │   ├── live-feed.tsx          # Main feed container + filters
│   │   ├── feed-card.tsx          # Article card (RTL-aware, memoized)
│   │   ├── feed-settings.tsx      # Feed management side panel
│   │   └── ui/                    # shadcn/ui primitives
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── sheet.tsx
│   │       ├── scroll-area.tsx
│   │       ├── switch.tsx
│   │       ├── badge.tsx
│   │       ├── skeleton.tsx
│   │       └── separator.tsx
│   │
│   ├── config/
│   │   └── feeds.ts               # 47+ RSS feed definitions
│   │
│   ├── hooks/
│   │   ├── use-feed-stream.ts     # NDJSON streaming + merge + 30s polling
│   │   └── use-feed-prefs.ts      # localStorage preference management
│   │
│   └── lib/
│       └── utils.ts               # cn() classname utility
│
├── public/                        # Static assets
├── .github/
│   └── pull_request_template.md   # PR template
├── package.json
├── tsconfig.json                  # TypeScript strict mode
├── next.config.ts                 # Security headers
├── components.json                # shadcn/ui config
├── postcss.config.mjs             # Tailwind v4 PostCSS
├── eslint.config.mjs              # ESLint + Next.js rules
├── CONTRIBUTING.md                # Contributor guide
└── LICENSE                        # MIT
```

</details>

<br />

## Contributing

Contributions are welcome — from adding a single feed source to building new features.

| I want to... | How |
|---|---|
| **Report a bug** | [Open a bug report](../../issues/new?template=bug_report.yml) |
| **Request a feature** | [Open a feature request](../../issues/new?template=feature_request.yml) |
| **Suggest a feed source** | [Open a feed source request](../../issues/new?template=feed_source.yml) |
| **Find a feature to build** | Browse the [Feature Ideas catalog](docs/FEATURE_IDEAS.md) — 192 ideas across 16 categories |
| **Submit code** | Read the [Contributing Guide](CONTRIBUTING.md) and open a PR |

```bash
git clone https://github.com/ramyatrouny/leb-news-monitor.git
cd leb-monitor
npm install
npm run dev         # http://localhost:3000
# make changes...
npm run lint        # must pass
npm run build       # must succeed
git checkout -b feat/my-change
git commit -m "feat: describe your change"
git push origin feat/my-change
# open a PR on GitHub
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide — PR templates, code style, commit conventions, and architecture walkthrough.

<br />

## FAQ

<details>
<summary><strong>Some feeds show as "down" — is that normal?</strong></summary>

<br />

Yes. RSS feeds are third-party services. Some sources go down temporarily, block certain IPs, or rate-limit requests. The app handles this gracefully — failed feeds show a count in the status bar, but all other sources continue working.
</details>

<details>
<summary><strong>I see 0 articles on first load</strong></summary>

<br />

The API fetches 47 feeds in parallel, which takes a few seconds. You should see a spinner and a "Streaming" indicator in the top bar. If nothing loads after 15 seconds:
- Check the browser console (`F12` → Console) for errors
- Make sure the dev server is running (`npm run dev`)
- Some corporate/school networks block RSS feeds — try from a different network
</details>

<details>
<summary><strong>Articles appear in the wrong language direction</strong></summary>

<br />

The app detects Arabic script via Unicode range (`\u0600–\u06FF`) and applies `dir="rtl"` automatically. If text direction looks wrong, it may be a feed returning content in an unexpected encoding — [open an issue](../../issues/new?template=bug_report.yml) with the source name.
</details>

<details>
<summary><strong>Can I deploy this publicly?</strong></summary>

<br />

Yes. The app has no API keys, no database, and no authentication. It fetches public RSS feeds server-side and streams them to the browser. Deploy to Vercel, a VPS, or any Node.js host. See [Deployment](#deployment).
</details>

<details>
<summary><strong>Why NDJSON instead of SSE or WebSockets?</strong></summary>

<br />

NDJSON over a simple `fetch()` is the lightest approach — no special client libraries, no connection management, and full compatibility with standard HTTP caching and proxies. Each line is a self-contained JSON object, making it trivial to parse progressively with `ReadableStream`.
</details>

<details>
<summary><strong>A feed I added doesn't show any articles</strong></summary>

<br />

Common causes:
1. The URL returns HTML, not XML — verify with `curl -s "URL" | head -20`
2. The feed uses a non-standard format the parser can't handle
3. The source blocks server-side requests (check for 403/401 errors in the terminal)
4. The feed returns items with no `<title>` or `<link>` — the parser needs at least a title
</details>

<details>
<summary><strong>How do I add a new feed category?</strong></summary>

<br />

1. Add the category to the `FeedCategory` type in [`src/config/feeds.ts`](src/config/feeds.ts)
2. Add a label in `CATEGORY_LABELS` and a color in `CATEGORY_COLORS`
3. Add it to the `CATEGORY_ORDER` array
4. Assign feeds to it — the UI picks it up automatically
</details>

<br />

## Roadmap

Planned features and improvements — contributions welcome on any of these:

### Core Features
- [ ] **Full-text search** — Filter articles by keyword across all sources in real time
- [ ] **Bookmarks / saved articles** — Save important articles locally for later reading
- [ ] **Notification system** — Browser push notifications for breaking news from selected sources
- [ ] **Timeline view** — Chronological timeline visualization of events as they unfold
- [ ] **Article clustering** — Group related articles from different sources covering the same event

### Sources & Data
- [ ] **Telegram channel integration** — Ingest updates from key Telegram channels alongside RSS
- [ ] **Twitter/X feed support** — Pull posts from conflict reporters and official accounts
- [ ] **Source credibility indicators** — Display trust/bias ratings from media bias databases
- [ ] **Historical archive** — Persist articles to a database for historical search and analysis
- [ ] **Feed health dashboard** — Admin view showing uptime, latency, and error rates per source

### UI / UX
- [ ] **Light mode toggle** — User-switchable light/dark theme (currently dark-only)
- [ ] **Map view** — Plot geotagged articles on an interactive map of the region
- [ ] **Multi-column layout customization** — Let users choose grid density (compact / comfortable / spacious)
- [ ] **Reading mode** — Inline article preview without leaving the app
- [ ] **Keyboard shortcuts** — Navigate feeds, switch categories, and open articles via keyboard

### Platform & Performance
- [ ] **Offline support (PWA)** — Cache recent articles for offline reading via service worker
- [ ] **Server-side caching** — Redis or in-memory cache layer to reduce RSS fetch frequency
- [ ] **i18n framework** — Full UI translation support (Arabic, French, English)
- [ ] **RSS feed export** — Generate a unified RSS/Atom feed from LEBMON's aggregated output
- [ ] **Mobile app (React Native)** — Native mobile experience with push notifications

### Analytics & Intelligence
- [ ] **Sentiment analysis** — NLP-based sentiment tagging per article (escalation / de-escalation)
- [ ] **Trend detection** — Surface topics gaining momentum across multiple sources
- [ ] **Daily digest email** — Automated summary of top stories delivered to subscribers
- [ ] **Source comparison** — Side-by-side view showing how different outlets cover the same story

> Looking for more ideas? Check the full **[Feature Ideas catalog](docs/FEATURE_IDEAS.md)** with 192 features across 16 categories, priority matrices, and implementation phases.
>
> Have an idea not listed here? [Open a feature request](../../issues/new?template=feature_request.yml).

<br />

## License

This project is open source under the [MIT License](LICENSE).

<br />

## Acknowledgments

Built with data from independent journalists, humanitarian organizations, and news agencies covering the Lebanon–Israel conflict. This tool aggregates publicly available RSS feeds and does not generate or editorialize content.

<br />

---

<div align="center">

**LEBMON** — Conflict Monitor v1.0

[Live Demo](https://lebmonitor.com) · [Report Bug](../../issues/new?template=bug_report.yml) · [Contributing](CONTRIBUTING.md)

</div>
