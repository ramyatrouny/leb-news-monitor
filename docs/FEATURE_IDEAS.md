# LEBMON — Feature Ideas & Expansion Roadmap

> Curated catalog of features to evolve LEBMON from a conflict RSS aggregator into a full-spectrum intelligence platform.
> Cleaned up against the actual codebase — removed already-implemented, unrealistic, and out-of-scope items.

---

## Already Implemented (for reference)

The following were in the original list but **already exist** in the codebase:

- Light/Dark mode toggle (useTheme hook + `dark` class)
- Layout density / grid-list toggle (useLayout hook)
- Font size control (useFontSize hook, 4 presets)
- Source visibility toggling & reordering (useFeedPrefs hook)
- Lazy load images (Next.js image optimization)
- Article freshness indicator (relative timestamps already shown)
- RTL/LTR auto-detection (Unicode range analysis)
- Streaming indicator (spinner during NDJSON fetch)
- PWA manifest (manifest.ts exists)
- Compression (Next.js `compress: true`)
- Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy in next.config.ts)
- Health check (feed errors reported in NDJSON `done` message)

---

## Table of Contents

- [1. Search & Discovery](#1-search--discovery)
- [2. Article Experience](#2-article-experience)
- [3. Source Expansion](#3-source-expansion)
- [4. Intelligence & Analytics](#4-intelligence--analytics)
- [5. Visualization & Maps](#5-visualization--maps)
- [6. User Personalization](#6-user-personalization)
- [7. Notifications & Alerts](#7-notifications--alerts)
- [8. Data Persistence & Archive](#8-data-persistence--archive)
- [9. Platform & Performance](#9-platform--performance)
- [10. Accessibility & i18n](#10-accessibility--i18n)
- [11. Admin & Monitoring](#11-admin--monitoring)
- [12. Content Enrichment](#12-content-enrichment)

---

## 1. Search & Discovery

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 1.1 | **Full-text search** | Real-time keyword search across all article titles and snippets with instant highlighting | Low |
| 1.2 | **Search history** | Remember recent searches in localStorage with quick-access chips | Low |
| 1.3 | **Fuzzy search** | Tolerate typos and transliteration mismatches (e.g., "Hizballah" = "Hezbollah") | Medium |
| 1.4 | **Trending keywords bar** | Horizontal scroller of top keywords extracted from the last hour's articles | Medium |
| 1.5 | **Date picker filter** | Calendar-based filter to view articles from a specific date or range | Low |

**Removed:**
- *Advanced search filters* — No database; filters beyond client-side text search need persistence
- *Saved search alerts* — Requires backend notifications infrastructure
- *Cross-lingual semantic search* — Requires ML embeddings pipeline + vector DB
- *"More like this"* — Requires NLP similarity scoring + article embeddings
- *Tag-based browsing* — Requires NER pipeline (entity extraction) that doesn't exist

> **Note:** 1.1 is trivial — articles are already in client memory. Just filter `items[]` by title/snippet match.

---

## 2. Article Experience

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 2.1 | **Bookmarks / saved articles** | Heart/bookmark icon to save articles to localStorage | Low |
| 2.2 | **Reading list** | Queue articles to "read later" with a dedicated reading list view | Low |
| 2.3 | **Article sharing** | Share button with copy-link, Twitter/X, WhatsApp, Telegram deep links | Low |
| 2.4 | **Image gallery** | Expand article images into a lightbox with zoom | Low |
| 2.5 | **Estimated reading time** | Display estimated read time (based on word count) on each card | Low |
| 2.6 | **Reading mode / article preview** | Inline modal that fetches and displays the full article text | High |
| 2.7 | **Auto-translate toggle** | Translate any article between Arabic/English/French on the fly | Medium |

**Removed:**
- *Article summary (AI)* — Requires LLM API integration + per-article cost
- *Article annotations* — Requires persistent storage beyond localStorage for anything useful
- *Text-to-speech* — Browser Speech Synthesis for Arabic is unreliable; poor UX
- *Article comparison (side-by-side)* — Requires event clustering (doesn't exist) as a prerequisite
- *Thread view* — Requires event clustering + timeline DB
- *Related articles sidebar* — Requires similarity scoring / NLP
- *Font size control* — Already implemented (useFontSize hook)
- *Article freshness indicator* — Already implemented (relative timestamps)

---

## 3. Source Expansion

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 3.1 | **Wire services** | Add AP, Reuters, AFP wire feeds for immediate conflict dispatches | Low |
| 3.2 | **Think tank feeds** | Add Brookings, Carnegie, RAND, Chatham House Middle East programs | Low |
| 3.3 | **Podcast feed integration** | List latest episodes from conflict-analysis podcasts with play links | Low |
| 3.4 | **Government press releases** | Scrape official government press portals (Lebanese, Israeli, UN) | Medium |
| 3.5 | **YouTube channel monitoring** | Track video uploads from conflict-related YouTube channels (titles, thumbnails) | Medium |
| 3.6 | **Reddit subreddit feeds** | Monitor r/lebanon, r/worldnews via Reddit RSS endpoints | Low |
| 3.7 | **User-submitted sources** | Let users add their own RSS URLs that merge into their personal feed | Medium |
| 3.8 | **Arabic blog aggregation** | Discover and aggregate Arabic-language conflict blogs | Medium |

**Removed:**
- *Telegram channel integration* — Requires Telegram Bot API auth + persistent polling server
- *Twitter/X feed support* — Twitter API is paywalled ($100/mo minimum); scraping is fragile and against ToS
- *OSINT feeds (Liveuamap, ACLED)* — Most require API keys + paid subscriptions
- *Newsletter ingestion* — Requires IMAP server or webhook infrastructure
- *Facebook page monitoring* — Requires Facebook Graph API approval (restricted)
- *WhatsApp channel support* — WhatsApp Channels API is extremely limited; no public RSS
- *Source suggestion engine* — Requires NLP cross-referencing + recommendation system
- *Academic journals* — JSTOR/Scholar don't have reliable public RSS feeds

> **Note:** 3.1, 3.2, 3.3, 3.6 are just adding URLs to `src/config/feeds.ts` — trivial.

---

## 4. Intelligence & Analytics

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 4.1 | **Word cloud** | Dynamic word cloud of most-used terms in the current feed | Low |
| 4.2 | **Article volume chart** | Simple bar chart showing articles per hour from current session data | Medium |
| 4.3 | **Trend detection (basic)** | Surface topics appearing across multiple sources in the last hour | Medium |
| 4.4 | **Source bias labels** | Display static media bias ratings for each source (editorial metadata) | Low |

**Removed:**
- *Sentiment analysis* — Requires NLP pipeline (no ML infra exists)
- *Entity extraction (NER)* — Requires NLP model (Transformers.js could work but adds significant bundle size)
- *Event clustering* — Requires NLP similarity + database for grouping
- *Narrative tracking* — Requires weeks of persistent data + NLP
- *Breaking news detection* — Requires historical baseline data (no database)
- *Conflict intensity meter* — Requires sentiment + volume baselines (no persistence)
- *Daily/weekly analytics dashboard* — No historical data stored
- *Source coverage gaps* — Requires event clustering as prerequisite
- *Fact-check cross-reference* — Requires external fact-check APIs + NLP
- *Casualty/displacement tracker* — Requires structured data extraction + database
- *Media coverage heatmap* — Requires historical time-series data
- *Topic timeline* — Requires database persistence
- *AI daily briefing* — Requires LLM API + cost per generation
- *Escalation alerts* — Requires sentiment + historical baselines
- *Source reliability scoring* — Requires months of tracked data + verification pipeline

> **Reality check:** Most intelligence features require a database (Section 8) as a prerequisite. Without persistence, analytics are limited to the current session's ~44 feed snapshots.

---

## 5. Visualization & Maps

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 5.1 | **Timeline view** | Horizontal scrollable timeline with article dots plotted chronologically | Medium |
| 5.2 | **Category distribution chart** | Visual breakdown of war vs. breaking vs. general article counts | Low |
| 5.3 | **Live ticker bar** | CNN-style scrolling news ticker at the top or bottom of the screen | Low |
| 5.4 | **Split-screen mode** | View two different category filters simultaneously | Medium |

**Removed:**
- *Interactive conflict map* — Requires geocoding articles (no location extraction exists) + map library
- *Event heatmap* — Requires geotagged articles (none are geotagged)
- *Source network graph* — Requires citation tracking (doesn't exist)
- *Conflict zone boundaries* — Requires map integration as prerequisite
- *Animated event replay* — Requires map + historical database
- *Infographic generator* — Requires chart library + template system + analytics data
- *Before/after satellite view* — Requires satellite imagery API (commercial, expensive)

---

## 6. User Personalization

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 6.1 | **Focus mode** | Show only articles from the last 1h / 6h / 24h / 7d | Low |
| 6.2 | **Poll frequency control** | Let users set refresh interval: 15s / 30s / 60s / manual | Low |
| 6.3 | **Startup view preference** | Choose default view on load: all articles, specific category | Low |
| 6.4 | **Keyboard shortcuts** | Navigate feeds, switch categories, open articles via keyboard | Medium |
| 6.5 | **Mute keywords** | Hide articles containing specific keywords | Medium |
| 6.6 | **Reading history** | Track which articles you've already opened to visually dim them | Low |
| 6.7 | **Import/export settings** | Export preferences as JSON and import on another device | Low |
| 6.8 | **Card style variants** | Choose between card layouts: standard, headlines-only, list view | Medium |

**Removed:**
- *Light mode toggle* — Already implemented
- *Custom color themes* — Over-engineering for a news monitor
- *Layout density options* — Already implemented (grid/list toggle)
- *Column count override* — Already responsive (1-3 columns)
- *Source priority weighting* — Source reordering already exists
- *Custom feed categories* — Categories are tied to RSS source metadata
- *User accounts* — Requires auth infrastructure (none exists)
- *Gesture controls (mobile)* — Pull-to-refresh conflicts with native browser behavior; swipe gestures unreliable
- *Font size control* — Already implemented

---

## 7. Notifications & Alerts

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 7.1 | **Browser push notifications** | Opt-in push notifications for breaking news | Medium |
| 7.2 | **Sound alerts** | Optional audio notification when breaking news arrives | Low |
| 7.3 | **Discord webhook integration** | Push breaking news to a Discord channel via webhook | Low |

**Removed:**
- *Custom alert rules* — Requires backend rules engine + notification service
- *Email digest* — Requires email service (SendGrid, Resend, etc.) + cron job + user accounts
- *Telegram bot alerts* — Requires backend bot server running 24/7
- *Slack integration* — Same as Discord but requires OAuth app approval
- *Alert throttling* — Only needed if notification system exists (it doesn't)
- *SMS alerts (Twilio)* — Requires Twilio account + backend + per-message cost
- *RSS output feed* — Medium value; would need a dedicated API route to generate Atom/RSS XML

> **Note:** 7.1 works client-side with the Push API + service worker. No backend needed for basic implementation (notifications fire when polling detects new breaking articles).

---

## 8. Data Persistence & Archive

> **This is the most critical infrastructure gap.** Many features in other sections are blocked until persistence exists.

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 8.1 | **Database persistence** | Store articles in PostgreSQL/SQLite for historical access | High |
| 8.2 | **Article dedup improvements** | Content-hash based dedup to catch reposts with different URLs | Medium |
| 8.3 | **Data export** | Export currently loaded articles as CSV or JSON | Low |
| 8.4 | **Data retention policies** | Configurable TTL for stored articles | Medium |

**Removed:**
- *Full-text search index (ElasticSearch/Meilisearch)* — Overkill; SQLite FTS5 is sufficient if a DB is added
- *Archive browser* — Requires database first
- *Snapshot / wayback* — Requires persistent storage + web scraping pipeline
- *Statistics API* — Requires database first
- *Incremental backup* — Requires database first
- *Event timeline database* — Requires event clustering + database

> **If you add one infrastructure piece, make it a database.** It unblocks: archive browsing, analytics dashboard, trend detection, search history persistence, and more.

---

## 9. Platform & Performance

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 9.1 | **PWA offline support** | Service worker caching for offline article reading | Medium |
| 9.2 | **Server-side caching** | In-memory or Redis cache to reduce RSS fetch load (60s TTL) | Medium |
| 9.3 | **WebSocket streaming** | Upgrade from polling to persistent WebSocket for true real-time | Medium |
| 9.4 | **Virtual scrolling** | Replace infinite scroll with virtualized list for 1000+ articles | Medium |
| 9.5 | **Background sync** | Sync new articles in background even when tab is not focused | Low |
| 9.6 | **Rate limiting** | Protect the API from abuse with per-IP rate limiting | Medium |
| 9.7 | **Image proxy / optimization** | Proxy article images through Next.js Image for optimization and privacy | Medium |

**Removed:**
- *Edge deployment* — Already on Vercel (edge by default)
- *React Native mobile app* — Massive scope creep; PWA is sufficient
- *Desktop app (Electron/Tauri)* — Massive scope creep; PWA is sufficient
- *Lazy load images* — Already implemented
- *Compression (gzip/brotli)* — Already enabled (`compress: true`)
- *CDN for static assets* — Vercel already serves static assets from CDN
- *Health check endpoint* — Feed errors already reported in NDJSON `done` message
- *Performance monitoring (Sentry)* — Vercel Analytics + Speed Insights already integrated

---

## 10. Accessibility & i18n

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 10.1 | **Full i18n framework** | Translate all UI strings into Arabic, English, and French | Medium |
| 10.2 | **Language auto-detect** | Set UI language based on browser locale with manual override | Low |
| 10.3 | **Screen reader optimization** | ARIA live regions for new article announcements | Medium |
| 10.4 | **Reduced motion mode** | Respect `prefers-reduced-motion` and disable all animations | Low |
| 10.5 | **Focus indicators** | Visible focus rings on all interactive elements | Low |
| 10.6 | **Keyboard navigation** | Full keyboard support: Tab through articles, Enter to open | Medium |
| 10.7 | **Hebrew source support** | Add Hebrew-language Israeli sources with RTL rendering | Medium |

**Removed:**
- *High contrast mode* — WCAG AAA is overkill; ensure AA compliance instead
- *Dyslexia-friendly font* — Very niche; low ROI
- *Persian/Farsi support* — Out of scope (Lebanon/Israel focus)
- *Turkish language support* — Out of scope (Lebanon/Israel focus)

> **Note:** RTL rendering already works (Unicode-based detection). Hebrew sources just need feed URLs added + RTL already handles display.

---

## 11. Admin & Monitoring

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 11.1 | **Feed health dashboard** | Admin page showing uptime, latency, error rates per source | Medium |
| 11.2 | **Feed validation tool** | Test a new RSS URL and preview parsed articles before adding | Low |
| 11.3 | **Source status page** | Public page showing which sources are currently up/down | Low |
| 11.4 | **Feed auto-discovery** | Enter a website URL and auto-detect its RSS feed endpoints | Medium |

**Removed:**
- *Error alerting (email/Slack)* — Requires notification infrastructure
- *A/B testing framework* — Overkill for this project
- *Usage analytics* — Vercel Analytics already handles this
- *Content moderation* — No user-generated content to moderate
- *Admin authentication* — No admin features exist yet to protect
- *Feed scheduling* — All feeds are polled at the same 30s interval; per-source intervals add complexity for minimal gain

---

## 12. Content Enrichment

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 12.1 | **Glossary tooltips** | Hover over terms like "UNIFIL", "Blue Line", "1701" to see definitions | Medium |
| 12.2 | **Reading level indicator** | Assess and display article complexity (Flesch-Kincaid or similar) | Low |
| 12.3 | **Duplicate detection** | Identify when multiple sources report the same story | Medium |

**Removed:**
- *Auto-generated article summaries* — Requires LLM API + per-article cost
- *Key quote extraction* — Requires NLP pipeline
- *Location geotagging* — Requires geocoding API + NER
- *Image captioning* — Requires vision AI model
- *Category auto-classification* — Requires ML model training
- *Claim extraction* — Requires advanced NLP
- *Source attribution chain* — Requires citation tracking across sources
- *Multimedia enrichment* — Requires cross-platform API integrations
- *Context cards* — Requires knowledge base + NLP entity linking

---

## Removed Sections (entire sections cut)

### Social & Collaboration — REMOVED
> All features (shared collections, community annotations, upvotes, discussion threads, embed widgets, public API, reporter profiles) require user accounts, authentication, and a database. None of this infrastructure exists. Revisit after Section 8 (persistence) is implemented.

### API & Developer Tools — REMOVED
> Features like REST API, GraphQL, webhooks, SDK, CLI, and plugin system are premature. The app has a single API route that streams RSS. Build the product first, then consider developer-facing APIs.

### Monetization & Sustainability — REMOVED
> Premium tiers, institutional licensing, white-label versions, and data licensing all require user accounts, payment infrastructure, and significant product maturity. The only viable item was "donation support" (Buy Me a Coffee link) — add that to the footer when ready.

### Security & Trust — REMOVED (mostly implemented or N/A)
> - CSP headers: partially done (security headers in next.config.ts)
> - Feed URL validation: only admin adds feeds; no user input to validate
> - Image proxy: listed in Section 9.7
> - Tor/VPN friendly: works by default (no IP-based features)
> - Privacy mode: no tracking beyond Vercel/GA (can be removed)
> - Source verification badges: editorial decision, not a tech feature
> - Misinformation flagging: requires community features (no user accounts)
> - GDPR compliance: no personal data collected (localStorage only)
> - Audit log: no admin actions to audit

---

## Priority Matrix

### Quick Wins (Low effort, high impact)

| Feature | Why |
|---------|-----|
| 1.1 Full-text search | Articles already in client memory; just add a filter input |
| 2.1 Bookmarks | Simple localStorage feature with huge UX value |
| 2.5 Estimated reading time | Trivial word count calculation |
| 5.3 Live ticker bar | High visual impact, simple scroll animation |
| 6.1 Focus mode | Simple time filter on existing pubDate |
| 6.6 Reading history | Track opened links in localStorage, dim visited cards |
| 1.5 Date picker filter | Calendar UI filtering on existing pubDate field |
| 8.3 Data export | JSON.stringify the current articles array + download |

### High-Value Strategic Features

| Feature | Why |
|---------|-----|
| 8.1 Database persistence | Unblocks archive, analytics, trends — the #1 infrastructure investment |
| 9.1 PWA offline support | Critical for users in conflict zones with unreliable internet |
| 7.1 Push notifications | Critical for breaking news use case |
| 2.6 Reading mode | Eliminates need to leave the app |
| 10.1 i18n framework | Arabic UI for Arabic-speaking majority audience |
| 9.2 Server-side caching | Reduces load on RSS sources; faster responses |

### Future Considerations (after database exists)

| Feature | Why |
|---------|-----|
| 4.3 Trend detection | Requires historical article data |
| 12.3 Duplicate detection | Better with content hashing in a database |
| 5.1 Timeline view | Most useful with archived historical articles |
| 11.1 Feed health dashboard | Requires stored uptime/error metrics |

---

## Implementation Phases

### Phase 1 — Quick Wins (1-2 weeks)
> Goal: Core UX improvements that make the existing product stickier

- [*] 1.1 Full-text search
- [*] 2.1 Bookmarks / saved articles
- [*] 2.5 Estimated reading time
- [ ] 6.1 Focus mode (time filters)
- [ ] 6.6 Reading history
- [ ] 1.5 Date picker filter
- [ ] 6.2 Poll frequency control

### Phase 2 — Engagement (2-4 weeks)
> Goal: Features that bring users back daily

- [ ] 2.6 Reading mode / article preview
- [ ] 5.3 Live ticker bar
- [ ] 2.3 Article sharing
- [ ] 6.4 Keyboard shortcuts
- [ ] 6.5 Mute keywords
- [ ] 7.2 Sound alerts for breaking news

### Phase 3 — Infrastructure (4-6 weeks)
> Goal: Lay the foundation for advanced features

- [ ] 8.1 Database persistence (PostgreSQL or SQLite)
- [ ] 9.2 Server-side caching
- [ ] 9.1 PWA offline support (service worker)
- [ ] 8.2 Article dedup improvements
- [ ] 9.6 Rate limiting

### Phase 4 — Intelligence & i18n (6-10 weeks)
> Goal: Transform from aggregator to intelligence tool

- [ ] 10.1 Full i18n framework
- [ ] 4.1 Word cloud
- [ ] 4.2 Article volume chart
- [ ] 4.3 Trend detection
- [ ] 12.1 Glossary tooltips
- [ ] 11.1 Feed health dashboard

### Phase 5 — Source Expansion (ongoing)
> Goal: Broaden coverage

- [ ] 3.1 Wire services (AP, Reuters, AFP)
- [ ] 3.2 Think tank feeds
- [ ] 3.6 Reddit subreddit feeds
- [ ] 3.7 User-submitted sources
- [ ] 10.7 Hebrew source support

---

## Feature Count Summary

| Category | Count |
|----------|-------|
| Search & Discovery | 5 |
| Article Experience | 7 |
| Source Expansion | 8 |
| Intelligence & Analytics | 4 |
| Visualization & Maps | 4 |
| User Personalization | 8 |
| Notifications & Alerts | 3 |
| Data Persistence & Archive | 4 |
| Platform & Performance | 7 |
| Accessibility & i18n | 7 |
| Admin & Monitoring | 4 |
| Content Enrichment | 3 |
| **Total** | **64** |

*Down from 192 — removed 128 features that were already implemented, unrealistic without major infrastructure, or out of scope.*

---

> Generated for LEBMON — Conflict Monitor. Prioritize based on user feedback, technical feasibility, and strategic alignment.
