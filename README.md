# LEB Monitor

Real-time multi-source news aggregator for the Lebanon–Israel conflict. Streams articles from **47+ RSS feeds** across war coverage, breaking news, and regional analysis — in both Arabic and English.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

<!-- Replace with an actual screenshot of the app running -->
<!-- ![LEB Monitor Screenshot](docs/screenshot.png) -->

> **Live demo:** _Coming soon_ — or run locally in under a minute (see [Getting Started](#getting-started)).

---

## Features

- **Real-time streaming** — Feeds arrive via NDJSON as each source resolves; no waiting for all 47
- **Auto-refresh** — Polls every 30 seconds with smart deduplication
- **3 feed categories** — War Focused, Breaking News, General/Analysis with tab filtering
- **47+ RSS sources** — LBC, Al Jazeera, BBC, UN, MSF, Amnesty, Bellingcat, and more
- **Arabic + English** — Automatic RTL/LTR text direction detection
- **Source management** — Toggle, reorder, and hide individual feeds via settings panel
- **Infinite scroll** — Paginated card grid with IntersectionObserver
- **Dark mode** — Enabled by default with OKLCh color system
- **Responsive** — 1 / 2 / 3 column grid across mobile, tablet, and desktop
- **Entrance animations** — New articles animate in on arrival
- **Error resilience** — Individual feed failures don't block others (Promise.allSettled)
- **Persistent preferences** — Feed visibility and ordering saved to localStorage

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  LiveFeed    │  │  FeedCard    │  │  Settings  │  │
│  │  (container) │  │  (article)   │  │  (panel)   │  │
│  └──────┬──────┘  └──────────────┘  └───────────┘  │
│         │                                           │
│  ┌──────┴──────┐  ┌──────────────┐                  │
│  │useFeedStream│  │ useFeedPrefs │                  │
│  │  (NDJSON)   │  │ (localStorage│                  │
│  └──────┬──────┘  └──────────────┘                  │
│         │ fetch + stream                            │
└─────────┼───────────────────────────────────────────┘
          │
┌─────────┴───────────────────────────────────────────┐
│              Next.js API Route                       │
│                                                      │
│  GET /api/feeds                                      │
│  ├── Fetch 47 RSS feeds in parallel                  │
│  ├── Parse XML → FeedItem[]                          │
│  ├── Stream batches as NDJSON                        │
│  └── Report errors per source                        │
└──────────────────────────────────────────────────────┘
```

### Stream Protocol

The `/api/feeds` endpoint returns newline-delimited JSON:

```jsonc
// As each feed resolves:
{"type":"batch","items":[...],"source":"Al Jazeera EN"}

// If a feed fails:
{"type":"error","source":"NNA","message":"HTTP 503"}

// When all feeds finish:
{"type":"done","sources":47,"errors":[...],"fetchedAt":"2026-03-02T12:00:00Z"}
```

---

## Project Structure

```
leb-monitor/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, fonts, metadata
│   │   ├── page.tsx                # Home page (renders LiveFeed)
│   │   ├── globals.css             # Tailwind + OKLCh theme tokens
│   │   └── api/feeds/
│   │       └── route.ts            # NDJSON streaming RSS API
│   │
│   ├── components/
│   │   ├── live-feed.tsx           # Main feed container + filters
│   │   ├── feed-card.tsx           # Article card (RTL-aware)
│   │   ├── feed-settings.tsx       # Feed management side panel
│   │   └── ui/                     # shadcn/ui primitives
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
│   │   └── feeds.ts                # 47 RSS feed definitions
│   │
│   ├── hooks/
│   │   ├── use-feed-stream.ts      # NDJSON streaming + merge logic
│   │   └── use-feed-prefs.ts       # localStorage preference hook
│   │
│   └── lib/
│       └── utils.ts                # cn() classname utility
│
├── public/                         # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── components.json                 # shadcn/ui config
├── postcss.config.mjs
├── eslint.config.mjs
└── tailwind.config (via CSS)       # Tailwind v4 CSS-based config
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

```bash
git clone https://github.com/<your-username>/leb-monitor.git
cd leb-monitor
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The feed begins streaming immediately.

### Production Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Feed Sources

### War Focused (17 sources)

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

### Breaking News (11 sources)

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

### General / Analysis (19 sources)

**Arabic:** Al Jazeera AR, Sky News Arabia, BBC Arabic, BBC AR Middle East, France 24 AR, DW Arabic, Annahar, Al Arabiya, Asharq Al-Awsat, Lebanon Debate, Al Quds, Rai Al Youm

**English:** Al-Monitor, The New Arab, Guardian Middle East, Foreign Policy

---

## Configuration

### Adding a New Feed

Edit `src/config/feeds.ts`:

```typescript
export const RSS_FEEDS: FeedSource[] = [
  // ... existing feeds
  {
    name: "Your Source",
    url: "https://example.com/rss",
    color: "#hex-color",        // Accent color for the source
    category: "war",            // "war" | "breaking" | "general"
  },
];
```

The feed will appear automatically on the next page load.

### Feed Categories

| Category | Color | Purpose |
|----------|-------|---------|
| `war` | Red (#ef4444) | Conflict, military, humanitarian |
| `breaking` | Amber (#f59e0b) | Fast-moving, time-sensitive news |
| `general` | Gray (#6b7280) | Broader analysis and coverage |

### User Preferences

Preferences are stored in `localStorage` under the key `lebmon-feed-prefs`:

```json
{
  "order": ["Al Jazeera EN", "BBC ME", "..."],
  "hidden": ["Source to hide"]
}
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16 |
| UI Library | React | 19 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| Components | shadcn/ui + Radix UI | latest |
| Icons | Lucide React | 0.576 |
| RSS Parsing | rss-parser | 3.13 |
| Data Fetching | SWR | 2.4 |
| Fonts | Poppins + Noto Sans Arabic | Google Fonts |

---

## Deployment

### Vercel (Recommended)

The app is fully compatible with Vercel. Connect your GitHub repository and it deploys on every push to `main`.

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

> **Note:** Enable `output: "standalone"` in `next.config.ts` for Docker builds.

### Self-Hosted

```bash
npm run build
NODE_ENV=production npm start
```

The app binds to port 3000 by default. Use a reverse proxy (nginx, Caddy) for HTTPS in production.

---

## Contributing

Contributions are welcome — from adding a single feed source to building new features.

| I want to... | How |
|---|---|
| **Report a bug** | [Open a bug report](../../issues/new?template=bug_report.yml) |
| **Request a feature** | [Open a feature request](../../issues/new?template=feature_request.yml) |
| **Suggest a feed source** | [Open a feed source request](../../issues/new?template=feed_source.yml) |
| **Submit code** | Read the [Contributing Guide](CONTRIBUTING.md) and open a PR |

### Quick Start for Contributors

```bash
git clone https://github.com/<your-username>/leb-monitor.git
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

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide — PR templates, code style, architecture walkthrough, and more.

---

## FAQ / Troubleshooting

<details>
<summary><strong>Some feeds show as "down" — is that normal?</strong></summary>

Yes. RSS feeds are third-party services. Some sources go down temporarily, block certain IPs, or rate-limit requests. The app handles this gracefully — failed feeds show a count in the amber bar, but all other sources continue working.
</details>

<details>
<summary><strong>I see 0 articles on first load</strong></summary>

The API fetches 47 feeds in parallel, which takes a few seconds. You should see a spinner and a "Streaming" indicator in the top bar. If nothing loads after 15 seconds:
- Check the browser console (`F12` → Console) for errors
- Make sure the dev server is running (`npm run dev`)
- Some corporate/school networks block RSS feeds — try from a different network
</details>

<details>
<summary><strong>Articles appear in the wrong language</strong></summary>

The app aggregates feeds in both Arabic and English. Arabic text is automatically detected and rendered right-to-left. If text direction looks wrong, it may be a feed returning content in an unexpected encoding — open an issue with the source name.
</details>

<details>
<summary><strong>How do I reset my feed preferences?</strong></summary>

Open browser DevTools (`F12` → Console) and run:
```javascript
localStorage.removeItem("lebmon-feed-prefs");
location.reload();
```
</details>

<details>
<summary><strong>Can I deploy this publicly?</strong></summary>

Yes. The app has no API keys, no database, and no authentication. It fetches public RSS feeds server-side and streams them to the browser. Deploy to Vercel, a VPS, or any Node.js host. See [Deployment](#deployment).
</details>

<details>
<summary><strong>Why NDJSON instead of Server-Sent Events or WebSockets?</strong></summary>

NDJSON over a simple `fetch()` is the lightest approach — no special client libraries, no connection management, and works with standard HTTP caching/proxies. Each line is a self-contained JSON object, making it easy to parse progressively.
</details>

<details>
<summary><strong>A feed I added doesn't show any articles</strong></summary>

Common causes:
1. The URL returns HTML, not XML — verify with `curl -s "URL" | head -20`
2. The feed uses a non-standard format the parser can't handle
3. The source blocks server-side requests (check for 403/401 errors in the terminal)
4. The feed returns items with no `<title>` or `<link>` — our parser needs at least a title
</details>

<details>
<summary><strong>How do I add a new feed category?</strong></summary>

1. Add the category to the `FeedCategory` type in `src/config/feeds.ts`
2. Add a label in `CATEGORY_LABELS` and a color in `CATEGORY_COLORS`
3. Add it to the `CATEGORY_ORDER` array
4. Assign feeds to it — the UI picks it up automatically
</details>

---

## License

This project is open source under the [MIT License](LICENSE).

---

## Acknowledgments

Built with data from independent journalists, humanitarian organizations, and news agencies covering the Lebanon–Israel conflict. This tool aggregates publicly available RSS feeds and does not generate or editorialize content.

---

<p align="center">
  <strong>LEB<span>MON</span></strong> — Conflict Monitor v1.0
</p>
