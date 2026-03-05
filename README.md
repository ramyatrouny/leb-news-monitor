<div align="center">

<br />

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/LEB-MONITOR-ef4444?style=for-the-badge&labelColor=0a0a12&color=ef4444">
  <img alt="LEB Monitor" src="https://img.shields.io/badge/LEB-MONITOR-ef4444?style=for-the-badge&labelColor=f5f5f8&color=ef4444">
</picture>

### Real-time conflict intelligence from 44+ sources — streamed to your browser in under 3 seconds

<br />

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![Live](https://img.shields.io/badge/Live-lebmonitor.com-ef4444?style=flat-square&logo=vercel&logoColor=white)](https://lebmonitor.com)

<br />

<a href="https://lebmonitor.com">
  <img src="docs/screenshot.png" alt="LEB Monitor — Live Feed" width="720" />
</a>

<br />
<br />

[**Live Demo**](https://lebmonitor.com) &nbsp;&middot;&nbsp; [Report Bug](../../issues/new?template=bug_report.yml) &nbsp;&middot;&nbsp; [Request Feature](../../issues/new?template=feature_request.yml) &nbsp;&middot;&nbsp; [Suggest Source](../../issues/new?template=feed_source.yml)

</div>

<br />

---

<br />

## Why LEB Monitor?

The Lebanon–Israel conflict generates hundreds of articles daily across dozens of outlets in multiple languages. Keeping up means juggling browser tabs, Telegram channels, and Twitter threads — or missing critical updates entirely.

**LEB Monitor solves this.** It aggregates **44 RSS feeds** from war correspondents, UN agencies, humanitarian orgs, and major news networks — in **Arabic and English** — into a single real-time stream. Articles arrive progressively via NDJSON as each source resolves. No waiting. No refreshing. No API keys.

<br />

## What Makes It Different

<table>
<tr>
<td width="50%">

### Progressive Streaming
Feeds arrive via **NDJSON** as each source resolves — you see articles in under 3 seconds, not after all 44 sources finish. Built on native `ReadableStream`, not WebSockets or polling hacks.

### Dual-Language Intelligence
Automatic **RTL/LTR detection** via Unicode range analysis. Arabic headlines render right-to-left with Tajawal; English content stays left-to-right with Poppins. Zero configuration.

### Zero Infrastructure
No database. No Redis. No API keys. No authentication. Just public RSS feeds parsed server-side and streamed to the browser. Deploy in 30 seconds.

</td>
<td width="50%">

### Resilient by Design
Each feed is fetched independently via `Promise.allSettled`. If Al Jazeera is down, BBC still streams. Failed sources are reported transparently — never silently dropped.

### Smart Deduplication
Client-side merge algorithm deduplicates by composite ID (`source + link/guid/title`). Auto-refresh every 30s merges new articles into the existing list with entrance animations. No jarring reloads.

### Fully Customizable
Toggle sources on/off, reorder feeds, switch between grid/list layouts, cycle through 4 font sizes, flip light/dark themes — all persisted in localStorage via `useSyncExternalStore`.

</td>
</tr>
</table>

<br />

## Quick Start

```bash
git clone https://github.com/ramyatrouny/leb-news-monitor.git
cd leb-news-monitor
npm install
npm run dev
```

Open **[localhost:3000](http://localhost:3000)** — articles start streaming immediately.

> **Requirements:** Node.js 18+ &nbsp;|&nbsp; No environment variables needed &nbsp;|&nbsp; No database setup

<br />

## Architecture

```
                                    ┌─────────────────────────────────────────┐
                                    │              Browser                     │
                                    │                                          │
 ┌─────────────┐                    │  LiveFeed (orchestrator)                 │
 │  44 RSS     │   NDJSON stream    │  ├── FeedHeader     (logo, stats, tools)│
 │  Sources    │ ◄─── fetch() ────► │  ├── FeedFilterBar  (categories, chips) │
 │             │                    │  ├── FeedContent    (cards, scroll)      │
 │  Al Jazeera │   ┌────────────┐   │  │   └── FeedCard   (article, RTL)      │
 │  BBC        │   │ /api/feeds │   │  └── FeedSettings  (toggle, reorder)    │
 │  UN OCHA    │   │            │   │                                          │
 │  MSF        │──►│ Parse XML  │──►│  Hooks:                                 │
 │  LBC        │   │ Sanitize   │   │  ├── useFeedStream  (NDJSON + merge)    │
 │  Bellingcat │   │ Extract    │   │  ├── useFeedPrefs   (source prefs)      │
 │  ...38 more │   │ Stream     │   │  ├── useLayout      (grid / list)       │
 └─────────────┘   └────────────┘   │  ├── useFontSize    (4 presets)         │
                                    │  └── useTheme       (light / dark)      │
                                    └─────────────────────────────────────────┘
```

### Data Flow

| Step | What Happens |
|------|-------------|
| **1. Mount** | `useFeedStream()` fires `GET /api/feeds` |
| **2. Fetch** | API route fetches 44 feeds in parallel via `Promise.allSettled` |
| **3. Stream** | Each resolved feed is sanitized, parsed, and streamed as an NDJSON batch |
| **4. Merge** | Client deduplicates by ID, sorts by `pubDate`, marks new items for animation |
| **5. Render** | Responsive card grid with category/source filtering + infinite scroll |
| **6. Poll** | Every 30s the cycle repeats; new articles merge in with CSS transitions |

<br />

## Features

### Core
| Feature | Implementation |
|---------|---------------|
| Real-time streaming | NDJSON over `ReadableStream` — articles appear as each source resolves |
| 44 RSS sources | War coverage, breaking news, analysis — Arabic + English |
| Auto-refresh | 30s polling with client-side deduplication and merge |
| Infinite scroll | `IntersectionObserver` with 30-item pages |
| Category filtering | War Focused / Breaking News / General tabs with live counts |
| Source filtering | Chip-based source selector with active state toggling |

### User Preferences (all localStorage-persisted)
| Preference | Control |
|------------|---------|
| Theme | Light / Dark with system preference detection |
| Font size | Small / Medium / Large / XL — applied via CSS class scaling |
| Layout | Grid (1-3 columns) / List (single column, centered) |
| Feed sources | Toggle visibility, reorder — syncs automatically when new sources appear |

### Technical
| Capability | Detail |
|-----------|--------|
| RTL/LTR detection | Unicode range `\u0600–\u06FF` analysis per title/snippet |
| Error resilience | `Promise.allSettled` — one feed failure never blocks others |
| Hydration-safe state | All preferences use `useSyncExternalStore` (not `useState` + `useEffect`) |
| SEO | Metadata API, JSON-LD (WebApplication + WebSite), sitemap, robots.txt |
| Security headers | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` |
| PWA manifest | Standalone display, themed icons, installable on mobile |
| Build-time changelog | Git log parsed at build via `prebuild` script, served at `/changelog` |

<br />

## API Reference

### `GET /api/feeds`

Streams newline-delimited JSON. Each line is a self-contained JSON object.

```jsonc
// As each source resolves:
{ "type": "batch", "items": [...], "source": "Al Jazeera EN" }

// When a source fails (others continue):
{ "type": "error", "source": "NNA", "message": "HTTP 503" }

// After all sources are attempted:
{ "type": "done", "sources": 44, "errors": [...], "fetchedAt": "2026-03-05T12:00:00Z" }
```

<details>
<summary><strong>FeedItem Schema</strong></summary>

```typescript
interface FeedItem {
  id: string;              // `${source}-${link || guid || title}`
  title: string;           // Article headline
  link: string;            // Original article URL
  snippet: string;         // First 200 chars, HTML stripped
  pubDate: string;         // ISO 8601
  source: string;          // Feed display name
  sourceColor?: string;    // Brand color (OKLCh)
  sourceCategory: string;  // "war" | "breaking" | "general"
  image?: string;          // Article thumbnail URL
}
```

</details>

<details>
<summary><strong>Response Headers</strong></summary>

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Type` | `text/plain; charset=utf-8` | NDJSON stream |
| `Cache-Control` | `no-cache, no-store` | Always fresh |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Block clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Privacy |

</details>

<br />

## Feed Sources

<details>
<summary><strong>War Focused — 17 sources</strong></summary>

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
<summary><strong>Breaking News — 11 sources</strong></summary>

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
<summary><strong>General / Analysis — 16 sources</strong></summary>

**Arabic:** Al Jazeera AR, Sky News Arabia, BBC Arabic, BBC AR Middle East, France 24 AR, DW Arabic, Annahar, Al Arabiya, Asharq Al-Awsat, Lebanon Debate, Al Quds, Rai Al Youm

**English:** Al-Monitor, The New Arab, Guardian Middle East, Foreign Policy

</details>

<br />

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | [Next.js 16](https://nextjs.org) App Router | Server components, route handlers, Metadata API |
| **UI** | [React 19](https://react.dev) | `useSyncExternalStore` for hydration-safe localStorage |
| **Language** | [TypeScript 5](https://typescriptlang.org) strict | End-to-end type safety |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) | CSS-based config, OKLCh color tokens |
| **Components** | [shadcn/ui](https://ui.shadcn.com) + [Radix](https://radix-ui.com) | Accessible primitives (Sheet, Switch, Tooltip) |
| **Fonts** | Poppins + [Tajawal](https://fonts.google.com/specimen/Tajawal) | Latin + Arabic via `next/font` |
| **RSS** | [rss-parser](https://github.com/rbren/rss-parser) | XML parsing with media extraction |
| **Streaming** | NDJSON via `ReadableStream` | Native, no libraries |
| **Analytics** | Vercel Analytics + Speed Insights + GA4 | Performance + usage tracking |
| **Deployment** | [Vercel](https://vercel.com) | Edge network, zero-config |

<br />

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout: fonts, SEO, JSON-LD, theme script
│   ├── page.tsx                   # Home → renders <LiveFeed />
│   ├── changelog/page.tsx         # Auto-generated from git history
│   ├── globals.css                # Tailwind v4 + OKLCh tokens + font size presets
│   ├── manifest.ts                # PWA manifest
│   ├── robots.ts / sitemap.ts     # SEO
│   ├── icon.tsx / apple-icon.tsx  # Dynamic favicons
│   ├── opengraph-image.tsx        # Dynamic OG image
│   └── api/feeds/route.ts         # NDJSON streaming RSS API
│
├── components/
│   ├── live-feed.tsx              # Orchestrator: data + state → child components
│   ├── feed-header.tsx            # Logo, stats, streaming indicator, toolbar
│   ├── feed-filter-bar.tsx        # Category tabs + source chips
│   ├── feed-content.tsx           # Card grid/list + infinite scroll + empty states
│   ├── feed-card.tsx              # Article card (RTL-aware, memoized)
│   ├── feed-settings.tsx          # Source management side panel
│   ├── announcement-banner.tsx    # Dismissible banner
│   ├── font-size-toggle.tsx       # 4-preset font size cycler
│   ├── layout-toggle.tsx          # Grid / List switcher
│   ├── theme-toggle.tsx           # Light / Dark toggle
│   └── ui/                        # shadcn/ui primitives
│
├── hooks/
│   ├── use-feed-stream.ts         # NDJSON streaming + merge + 30s poll
│   ├── use-feed-prefs.ts          # Source visibility + order (localStorage)
│   ├── use-layout.ts              # Grid / List preference
│   ├── use-font-size.ts           # Font size preference
│   └── use-theme.ts               # Light / Dark preference
│
├── config/
│   └── feeds.ts                   # 44 RSS feed definitions + categories
│
└── scripts/
    └── generate-changelog.ts      # Build-time git log → JSON
```

<br />

## Configuration

### Adding a Feed Source

Edit [`src/config/feeds.ts`](src/config/feeds.ts):

```typescript
{
  name: "Your Source",
  url: "https://example.com/rss",
  color: "#hex",               // Brand accent color
  category: "war",             // "war" | "breaking" | "general"
},
```

The source appears automatically on next page load. No other changes needed.

### Adding a Category

1. Add to `FeedCategory` type in `feeds.ts`
2. Add entries to `CATEGORY_LABELS`, `CATEGORY_COLORS`, `CATEGORY_ORDER`
3. Assign feeds — the UI picks it up automatically

<br />

## Deployment

### Vercel (Recommended)

Connect your GitHub repo — it deploys on every push. No env vars needed.

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
npm run build && NODE_ENV=production npm start
```

Port 3000 by default. Use nginx/Caddy for HTTPS.

<br />

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with Turbopack |
| `npm run build` | Production build (runs changelog generation via `prebuild`) |
| `npm start` | Serve production build |
| `npm run lint` | ESLint checks |

<br />

## FAQ

<details>
<summary><strong>Some feeds show errors — is that normal?</strong></summary>

Yes. RSS feeds are third-party services. Sources go down, rate-limit, or block IPs temporarily. LEB Monitor handles this gracefully — failed feeds are reported in the status bar, but all others continue streaming.
</details>

<details>
<summary><strong>Why NDJSON instead of SSE or WebSockets?</strong></summary>

NDJSON over `fetch()` is the lightest approach — no client libraries, no connection management, full HTTP proxy compatibility. Each line is self-contained JSON, trivially parsed with `ReadableStream`. SSE adds reconnection complexity we don't need; WebSockets are overkill for 30s polling.
</details>

<details>
<summary><strong>Why useSyncExternalStore instead of useState + useEffect?</strong></summary>

`useState` + `useEffect` for localStorage causes hydration mismatches (server renders default, client reads localStorage, then re-renders). `useSyncExternalStore` with `getServerSnapshot` handles this correctly — React knows the server snapshot is a placeholder and reconciles without tearing.
</details>

<details>
<summary><strong>Can I deploy this publicly?</strong></summary>

Yes. No API keys, no database, no auth. It fetches public RSS feeds server-side. Deploy to Vercel, a VPS, or any Node.js host.
</details>

<details>
<summary><strong>A feed I added shows no articles</strong></summary>

Common causes:
1. URL returns HTML, not XML — verify: `curl -s "URL" | head -5`
2. Source blocks server requests (403/401 in terminal)
3. Items lack `<title>` or `<link>` — the parser needs at least a title
4. Non-standard XML encoding — check the terminal for parse errors
</details>

<details>
<summary><strong>How do I reset all preferences?</strong></summary>

```javascript
// Browser console:
Object.keys(localStorage).filter(k => k.startsWith("lebmon-")).forEach(k => localStorage.removeItem(k));
location.reload();
```
</details>

<br />

## Roadmap

### Core
- [ ] Full-text search across all sources
- [ ] Bookmarks / saved articles (localStorage)
- [ ] Browser push notifications for breaking news
- [ ] Article clustering — group related coverage across sources
- [ ] Timeline view — chronological event visualization

### Sources & Data
- [ ] Telegram channel ingestion
- [ ] Twitter/X feed support
- [ ] Source credibility indicators
- [ ] Historical archive with database persistence
- [ ] Feed health dashboard (uptime, latency per source)

### UI / UX
- [x] Light / Dark theme with system detection
- [x] Grid / List layout toggle
- [x] Font size presets (4 levels)
- [x] Tooltip system on all controls
- [x] Build-time changelog at `/changelog`
- [ ] Map view — geotagged articles on interactive map
- [ ] Reading mode — inline article preview
- [ ] Keyboard shortcuts

### Platform
- [ ] Offline support (PWA service worker)
- [ ] Server-side caching layer (Redis)
- [ ] i18n (Arabic, French, English UI)
- [ ] Unified RSS/Atom feed export
- [ ] Mobile app (React Native)

> **192 more ideas** in the [Feature Ideas catalog](docs/FEATURE_IDEAS.md) with priority matrices and implementation phases.

<br />

## Contributing

Contributions welcome — from adding a feed source to building features.

```bash
git clone https://github.com/ramyatrouny/leb-news-monitor.git
cd leb-news-monitor && npm install && npm run dev
# make changes...
npm run lint && npm run build    # both must pass
```

| I want to... | How |
|---|---|
| Report a bug | [Bug report](../../issues/new?template=bug_report.yml) |
| Request a feature | [Feature request](../../issues/new?template=feature_request.yml) |
| Suggest a source | [Feed source request](../../issues/new?template=feed_source.yml) |
| Find something to build | [Feature Ideas catalog](docs/FEATURE_IDEAS.md) |
| Submit code | Read [CONTRIBUTING.md](CONTRIBUTING.md), open a PR |

<br />

## License

[MIT](LICENSE) — use it however you want.

<br />

## Acknowledgments

Built with data from independent journalists, humanitarian organizations, and international news agencies covering the Lebanon–Israel conflict. This tool aggregates publicly available RSS feeds and does not generate, editorialize, or modify content.

<br />

---

<div align="center">

**LEB MONITOR** &nbsp;&middot;&nbsp; Conflict Intelligence, Real-Time

[lebmonitor.com](https://lebmonitor.com) &nbsp;&middot;&nbsp; [Report Bug](../../issues/new?template=bug_report.yml) &nbsp;&middot;&nbsp; [Contributing](CONTRIBUTING.md)

</div>
