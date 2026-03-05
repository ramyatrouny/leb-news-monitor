# LEBMON — Feature Ideas & Expansion Roadmap

> Comprehensive catalog of features to evolve LEBMON from a conflict RSS aggregator into a full-spectrum intelligence platform.

---

## Table of Contents

- [1. Search & Discovery](#1-search--discovery)
- [2. Article Experience](#2-article-experience)
- [3. Source Expansion](#3-source-expansion)
- [4. Intelligence & Analytics](#4-intelligence--analytics)
- [5. Visualization & Maps](#5-visualization--maps)
- [6. User Personalization](#6-user-personalization)
- [7. Notifications & Alerts](#7-notifications--alerts)
- [8. Social & Collaboration](#8-social--collaboration)
- [9. Data Persistence & Archive](#9-data-persistence--archive)
- [10. Platform & Performance](#10-platform--performance)
- [11. Accessibility & i18n](#11-accessibility--i18n)
- [12. Admin & Monitoring](#12-admin--monitoring)
- [13. API & Developer Tools](#13-api--developer-tools)
- [14. Content Enrichment](#14-content-enrichment)
- [15. Monetization & Sustainability](#15-monetization--sustainability)
- [16. Security & Trust](#16-security--trust)

---

## 1. Search & Discovery

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 1.1 | **Full-text search** | Real-time keyword search across all article titles and snippets with instant highlighting | Medium |
| 1.2 | **Advanced search filters** | Combine filters: date range, source, category, language, has-image | Medium |
| 1.3 | **Search history** | Remember recent searches in localStorage with quick-access chips | Low |
| 1.4 | **Saved search alerts** | Save a search query and get notified when new matching articles arrive | High |
| 1.5 | **Fuzzy search** | Tolerate typos and transliteration mismatches (e.g., "Hizballah" = "Hezbollah") | Medium |
| 1.6 | **Search across languages** | Type in English, find Arabic articles (cross-lingual semantic search) | High |
| 1.7 | **Trending keywords bar** | Show a horizontal scroller of top keywords extracted from the last hour's articles | Medium |
| 1.8 | **"More like this"** | Click a button on any article to find similar articles by topic/entity | High |
| 1.9 | **Tag-based browsing** | Auto-tag articles with entities (people, places, orgs) and let users filter by tag | High |
| 1.10 | **Date picker filter** | Calendar-based filter to view articles from a specific date or range | Low |

---

## 2. Article Experience

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 2.1 | **Reading mode / article preview** | Inline modal that fetches and displays the full article text without leaving the app | High |
| 2.2 | **Article summary (AI)** | One-click AI-generated summary of the full article in 2-3 sentences | High |
| 2.3 | **Auto-translate toggle** | Translate any article between Arabic/English/French on the fly | Medium |
| 2.4 | **Bookmarks / saved articles** | Heart/bookmark icon to save articles locally (localStorage or account-based) | Low |
| 2.5 | **Reading list** | Queue articles to "read later" with a dedicated reading list view | Low |
| 2.6 | **Article sharing** | Share button with copy-link, Twitter/X, WhatsApp, Telegram deep links | Low |
| 2.7 | **Article annotations** | Highlight text and add personal notes to saved articles | Medium |
| 2.8 | **Text-to-speech** | Play article text aloud using browser Speech Synthesis API (Arabic + English) | Medium |
| 2.9 | **Article comparison** | Side-by-side view comparing how 2+ sources covered the same event | High |
| 2.10 | **Thread view** | Link articles that cover the same developing story into a chronological thread | High |
| 2.11 | **Image gallery** | Expand article images into a lightbox with zoom and multi-image support | Low |
| 2.12 | **Related articles sidebar** | Show related articles from other sources when viewing an article | Medium |
| 2.13 | **Estimated reading time** | Display estimated read time (based on word count) on each card | Low |
| 2.14 | **Font size control** | Let users increase/decrease article text size for readability | Low |
| 2.15 | **Article freshness indicator** | Visual badge showing "Just now", "Minutes ago", "Hours ago" with color coding | Low |

---

## 3. Source Expansion

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 3.1 | **Telegram channel integration** | Ingest messages from key Telegram channels (via Telegram Bot API or scraping) | High |
| 3.2 | **Twitter/X feed support** | Pull tweets from conflict reporters, official accounts, and hashtags | High |
| 3.3 | **YouTube channel monitoring** | Track video uploads from conflict-related YouTube channels (titles, thumbnails) | Medium |
| 3.4 | **Reddit subreddit feeds** | Monitor r/lebanon, r/worldnews, r/geopolitics for relevant discussion threads | Medium |
| 3.5 | **Government press releases** | Scrape official government press portals (Lebanese, Israeli, UN) | Medium |
| 3.6 | **Podcast feed integration** | List latest episodes from conflict-analysis podcasts with play links | Low |
| 3.7 | **User-submitted sources** | Let users add their own RSS URLs that merge into their personal feed | Medium |
| 3.8 | **OSINT feeds** | Integrate open-source intelligence feeds (Liveuamap, ACLED, satellite imagery alerts) | High |
| 3.9 | **Wire services** | Add AP, Reuters, AFP wire feeds for immediate conflict dispatches | Low |
| 3.10 | **Academic journals** | Pull RSS from JSTOR, Google Scholar alerts for Lebanon/Israel conflict research | Medium |
| 3.11 | **Newsletter ingestion** | Parse email newsletters (Substack, Mailchimp) into the feed via IMAP or webhook | High |
| 3.12 | **Think tank feeds** | Add Brookings, Carnegie, RAND, Chatham House, CSIS Middle East programs | Low |
| 3.13 | **Arabic blog aggregation** | Discover and aggregate Arabic-language conflict blogs and independent journalists | Medium |
| 3.14 | **Facebook page monitoring** | Track public Facebook pages of Lebanese news outlets | High |
| 3.15 | **WhatsApp channel support** | Integrate WhatsApp Channels API for news channels | High |
| 3.16 | **Source suggestion engine** | Recommend new sources to add based on cross-references in existing articles | High |

---

## 4. Intelligence & Analytics

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 4.1 | **Sentiment analysis** | NLP-based per-article sentiment: escalation / neutral / de-escalation | High |
| 4.2 | **Trend detection** | Surface topics gaining momentum across multiple sources in the last 1h/6h/24h | High |
| 4.3 | **Entity extraction (NER)** | Auto-extract people, organizations, locations, and weapons from articles | High |
| 4.4 | **Event clustering** | Group articles from different sources that cover the same event | High |
| 4.5 | **Source bias analysis** | Display media bias ratings and political leaning for each source | Medium |
| 4.6 | **Narrative tracking** | Track how narratives evolve over days/weeks across sources | High |
| 4.7 | **Breaking news detection** | AI-based detection of breaking events from sudden article volume spikes | High |
| 4.8 | **Conflict intensity meter** | Real-time "temperature gauge" based on article volume, sentiment, and keyword severity | High |
| 4.9 | **Daily/weekly analytics dashboard** | Charts showing article volume by source, category, sentiment over time | Medium |
| 4.10 | **Word cloud** | Dynamic word cloud of most-used terms in the current feed | Low |
| 4.11 | **Source coverage gaps** | Highlight stories covered by some sources but missing from others | High |
| 4.12 | **Fact-check cross-reference** | Flag articles that contradict each other or known verified facts | High |
| 4.13 | **Casualty/displacement tracker** | Parse numbers from humanitarian reports to build a running statistics dashboard | High |
| 4.14 | **Media coverage heatmap** | Heatmap showing which sources are most active at which times of day | Medium |
| 4.15 | **Topic timeline** | Visualize how a specific topic (e.g., "ceasefire") trends over days/weeks | Medium |
| 4.16 | **AI daily briefing** | Auto-generated morning briefing summarizing overnight developments | High |
| 4.17 | **Escalation alerts** | Detect sudden shifts in language tone or article volume that signal escalation | High |
| 4.18 | **Source reliability scoring** | Track which sources are first to report verified events vs. misinformation | High |

---

## 5. Visualization & Maps

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 5.1 | **Interactive conflict map** | Plot geotagged articles on a Mapbox/Leaflet map of Lebanon-Israel border region | High |
| 5.2 | **Event heatmap** | Density overlay showing where most events are being reported | High |
| 5.3 | **Timeline view** | Horizontal scrollable timeline with article dots plotted chronologically | Medium |
| 5.4 | **Source network graph** | Interactive graph showing which sources cite or reference each other | High |
| 5.5 | **Article volume chart** | Line/bar chart showing articles per hour/day with category breakdown | Medium |
| 5.6 | **Conflict zone boundaries** | Overlay UNIFIL zones, Blue Line, and administrative boundaries on the map | Medium |
| 5.7 | **Animated event replay** | "Play back" events on the map over a selected time window | High |
| 5.8 | **Infographic generator** | Auto-generate shareable infographics from daily statistics | High |
| 5.9 | **Category distribution pie chart** | Visual breakdown of war vs. breaking vs. general article distribution | Low |
| 5.10 | **Live ticker bar** | CNN-style scrolling news ticker at the top or bottom of the screen | Low |
| 5.11 | **Split-screen mode** | View two different source filters or categories simultaneously | Medium |
| 5.12 | **Before/after satellite view** | Embed satellite imagery comparisons for areas mentioned in articles | High |

---

## 6. User Personalization

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 6.1 | **Light mode toggle** | User-switchable light/dark theme (currently dark-only) | Low |
| 6.2 | **Custom color themes** | Choose from preset themes or customize accent colors | Medium |
| 6.3 | **Layout density options** | Compact / comfortable / spacious card grid density | Low |
| 6.4 | **Column count override** | Force 1/2/3/4 column layout regardless of screen size | Low |
| 6.5 | **Card style variants** | Choose between card layouts: standard, headlines-only, magazine, list view | Medium |
| 6.6 | **Source priority weighting** | Assign priority weights to sources so preferred sources appear higher | Medium |
| 6.7 | **Custom feed categories** | Create personal categories and assign sources to them | Medium |
| 6.8 | **Mute keywords** | Hide articles containing specific keywords (e.g., filter out sports news) | Medium |
| 6.9 | **Focus mode** | Show only articles from the last 1h / 6h / 24h / 7d | Low |
| 6.10 | **Poll frequency control** | Let users set refresh interval: 15s / 30s / 60s / manual | Low |
| 6.11 | **Startup view preference** | Choose default view on load: all articles, specific category, or bookmarks | Low |
| 6.12 | **User accounts (optional)** | Sync preferences, bookmarks, and saved searches across devices | High |
| 6.13 | **Import/export settings** | Export preferences as JSON and import on another device | Low |
| 6.14 | **Keyboard shortcuts** | Navigate feeds, switch categories, open articles, toggle settings via keyboard | Medium |
| 6.15 | **Gesture controls (mobile)** | Swipe to dismiss, pull to refresh, long press to bookmark | Medium |
| 6.16 | **Reading history** | Track which articles you've already opened to visually dim them | Low |

---

## 7. Notifications & Alerts

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 7.1 | **Browser push notifications** | Opt-in push notifications for breaking news from selected sources | Medium |
| 7.2 | **Custom alert rules** | "Notify me when any article mentions [keyword] from [source]" | High |
| 7.3 | **Email digest** | Daily/weekly email summary of top stories | High |
| 7.4 | **Telegram bot alerts** | Send breaking news to a personal Telegram bot | Medium |
| 7.5 | **Discord webhook integration** | Push breaking news to a Discord channel via webhook | Low |
| 7.6 | **Slack integration** | Post filtered articles to a Slack channel | Low |
| 7.7 | **Sound alerts** | Optional audio notification when breaking news arrives | Low |
| 7.8 | **Alert throttling** | Rate-limit notifications to avoid spam during high-volume events | Medium |
| 7.9 | **SMS alerts (Twilio)** | Send critical breaking news via SMS for users without internet | High |
| 7.10 | **RSS output feed** | Generate a unified RSS/Atom feed from LEBMON's aggregated output | Medium |

---

## 8. Social & Collaboration

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 8.1 | **Shared collections** | Create and share curated article collections via shareable links | Medium |
| 8.2 | **Community annotations** | Crowdsourced context notes on articles (similar to Community Notes) | High |
| 8.3 | **Upvote / downvote articles** | Community ranking of article importance | Medium |
| 8.4 | **Discussion threads** | Threaded comments on articles for community discussion | High |
| 8.5 | **Collaborative watchlists** | Teams can share source lists and alert configurations | Medium |
| 8.6 | **Embed widget** | Embeddable iframe widget for websites/blogs to show LEBMON's live feed | Medium |
| 8.7 | **Public API for journalists** | RESTful API for journalists and researchers to query aggregated data | High |
| 8.8 | **Source submission by users** | Community-driven source discovery with moderation queue | Medium |
| 8.9 | **Weekly roundup page** | Auto-generated weekly summary page that's shareable on social media | Medium |
| 8.10 | **Reporter profiles** | Track and follow specific journalists across multiple outlets | High |

---

## 9. Data Persistence & Archive

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 9.1 | **Database persistence** | Store articles in PostgreSQL/SQLite for historical access | High |
| 9.2 | **Full-text search index** | ElasticSearch/Meilisearch index for fast historical search | High |
| 9.3 | **Article dedup improvements** | Content-hash based dedup to catch reposts with different URLs | Medium |
| 9.4 | **Data export** | Export articles as CSV, JSON, or PDF for research purposes | Medium |
| 9.5 | **Archive browser** | Browse articles by date with calendar navigation | Medium |
| 9.6 | **Snapshot / wayback** | Save article snapshots in case original URLs go down | High |
| 9.7 | **Statistics API** | Expose aggregate stats (articles/day, source uptime, etc.) via API | Medium |
| 9.8 | **Data retention policies** | Configurable TTL for stored articles (7d, 30d, 90d, forever) | Medium |
| 9.9 | **Incremental backup** | Automated daily backups of the article database | Medium |
| 9.10 | **Event timeline database** | Structured event log linking articles to confirmed events | High |

---

## 10. Platform & Performance

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 10.1 | **PWA / offline support** | Service worker caching for offline article reading | Medium |
| 10.2 | **Server-side caching** | Redis or in-memory cache to reduce RSS fetch load (60s TTL) | Medium |
| 10.3 | **Edge deployment** | Deploy API to Cloudflare Workers or Vercel Edge for global low-latency | Medium |
| 10.4 | **WebSocket streaming** | Upgrade from polling to persistent WebSocket for true real-time | Medium |
| 10.5 | **React Native mobile app** | Native iOS/Android app with push notifications | High |
| 10.6 | **Desktop app (Electron/Tauri)** | Standalone desktop app with system tray notifications | High |
| 10.7 | **Image proxy / optimization** | Proxy article images through Next.js Image for optimization and privacy | Medium |
| 10.8 | **Lazy load images** | Only load article images when cards scroll into view | Low |
| 10.9 | **Virtual scrolling** | Replace infinite scroll with virtualized list for 1000+ articles | Medium |
| 10.10 | **Background sync** | Sync new articles in the background even when tab is not focused | Low |
| 10.11 | **Compression (gzip/brotli)** | Compress NDJSON stream responses for faster transfer | Low |
| 10.12 | **CDN for static assets** | Serve static assets from CDN edge nodes | Low |
| 10.13 | **Rate limiting** | Protect the API from abuse with per-IP rate limiting | Medium |
| 10.14 | **Health check endpoint** | `GET /api/health` returning feed status and uptime metrics | Low |
| 10.15 | **Performance monitoring** | Integrate Sentry or similar for error tracking and performance metrics | Medium |

---

## 11. Accessibility & i18n

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 11.1 | **Full i18n framework** | Translate all UI strings into Arabic, English, and French | Medium |
| 11.2 | **Language auto-detect** | Set UI language based on browser locale with manual override | Low |
| 11.3 | **Screen reader optimization** | ARIA live regions for new article announcements | Medium |
| 11.4 | **High contrast mode** | WCAG AAA compliant high-contrast theme option | Medium |
| 11.5 | **Reduced motion mode** | Respect `prefers-reduced-motion` and disable all animations | Low |
| 11.6 | **Dyslexia-friendly font** | Toggle to OpenDyslexic or similar accessible font | Low |
| 11.7 | **Keyboard navigation** | Full keyboard support: Tab through articles, Enter to open, Escape to close | Medium |
| 11.8 | **Focus indicators** | Visible focus rings on all interactive elements | Low |
| 11.9 | **Persian/Farsi support** | Add Farsi sources and font support for broader Middle East coverage | Medium |
| 11.10 | **Hebrew source support** | Add Hebrew-language Israeli sources with RTL rendering | Medium |
| 11.11 | **Turkish language support** | Add Turkish sources (Anadolu, TRT, etc.) with proper rendering | Low |

---

## 12. Admin & Monitoring

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 12.1 | **Feed health dashboard** | Admin page showing uptime, latency, error rates per source | Medium |
| 12.2 | **Feed auto-discovery** | Enter a website URL and auto-detect its RSS feed endpoints | Medium |
| 12.3 | **Feed validation tool** | Test a new RSS URL and preview parsed articles before adding it | Low |
| 12.4 | **Source status page** | Public page showing which sources are currently up/down | Low |
| 12.5 | **Error alerting** | Notify admin (email/Slack) when a source has been down for > 1 hour | Medium |
| 12.6 | **A/B testing framework** | Test different UI layouts, card designs, or feature rollouts | High |
| 12.7 | **Usage analytics** | Track which sources/categories users engage with most | Medium |
| 12.8 | **Content moderation** | Flag or filter articles with graphic content with user-controlled toggle | Medium |
| 12.9 | **Admin authentication** | Protected admin routes with simple auth for management features | Medium |
| 12.10 | **Feed scheduling** | Configure different poll intervals per source based on update frequency | Medium |

---

## 13. API & Developer Tools

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 13.1 | **REST API** | Full REST API with pagination, filtering, and sorting for external consumers | High |
| 13.2 | **GraphQL API** | GraphQL endpoint for flexible querying by frontend clients | High |
| 13.3 | **Webhook system** | POST notifications to external URLs when articles match specific criteria | Medium |
| 13.4 | **RSS/Atom output feed** | Generate a unified RSS feed from LEBMON's aggregated + filtered output | Medium |
| 13.5 | **API documentation (Swagger)** | Interactive API docs with OpenAPI/Swagger spec | Medium |
| 13.6 | **API rate limiting + keys** | Issue API keys for third-party consumers with usage quotas | High |
| 13.7 | **SDK / npm package** | Publish a JavaScript SDK for consuming LEBMON's API | Medium |
| 13.8 | **IFTTT / Zapier integration** | Connect LEBMON events to automation platforms | Medium |
| 13.9 | **CLI tool** | Command-line interface to query articles, manage sources, check health | Medium |
| 13.10 | **Plugin system** | Architecture for community-built plugins (custom sources, enrichment, etc.) | High |

---

## 14. Content Enrichment

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 14.1 | **Auto-generated article summaries** | Use LLM APIs to generate 2-3 sentence summaries per article | High |
| 14.2 | **Key quote extraction** | Pull the most significant quote from each article automatically | High |
| 14.3 | **Location geotagging** | Extract and geocode location mentions for map integration | High |
| 14.4 | **Duplicate detection** | Identify when multiple sources report the same story with different URLs | Medium |
| 14.5 | **Image captioning** | AI-generated alt text for article images that lack descriptions | High |
| 14.6 | **Category auto-classification** | ML-based article categorization beyond source-level assignment | High |
| 14.7 | **Reading level indicator** | Assess and display article complexity (Flesch-Kincaid or similar) | Low |
| 14.8 | **Claim extraction** | Extract specific factual claims from articles for verification tracking | High |
| 14.9 | **Source attribution chain** | Track when articles cite other articles and show the citation chain | High |
| 14.10 | **Multimedia enrichment** | Embed related videos, podcasts, or social posts alongside articles | Medium |
| 14.11 | **Context cards** | Auto-generated background cards explaining key people, places, or events mentioned | High |
| 14.12 | **Glossary tooltips** | Hover over terms like "UNIFIL", "Blue Line", "1701" to see definitions | Medium |

---

## 15. Monetization & Sustainability

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 15.1 | **Premium tier** | Advanced features (AI summaries, alerts, archive) behind a subscription | High |
| 15.2 | **Donation support** | "Buy Me a Coffee" / GitHub Sponsors / Open Collective integration | Low |
| 15.3 | **Institutional licensing** | Enterprise tier for NGOs, newsrooms, and think tanks with SLA | High |
| 15.4 | **White-label version** | Configurable branding for organizations to deploy their own monitor | High |
| 15.5 | **Sponsored sources** | Allow organizations to sponsor their source's placement (transparent) | Medium |
| 15.6 | **Data licensing** | License aggregated, anonymized analytics data to researchers | High |
| 15.7 | **Consulting services** | Offer custom monitoring setups for specific conflict regions | N/A |

---

## 16. Security & Trust

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 16.1 | **Content Security Policy** | Strict CSP headers to prevent XSS and injection attacks | Medium |
| 16.2 | **Subresource Integrity** | SRI hashes for all external scripts and stylesheets | Low |
| 16.3 | **Feed URL validation** | Sanitize and validate all RSS URLs to prevent SSRF attacks | Medium |
| 16.4 | **Image proxy** | Proxy all article images through the server to prevent tracking pixels | Medium |
| 16.5 | **Tor/VPN friendly** | Ensure the app works well behind Tor and VPNs for users in conflict zones | Low |
| 16.6 | **Privacy mode** | Disable all analytics and external requests for maximum privacy | Low |
| 16.7 | **Source verification badges** | Verified checkmarks for sources that meet editorial standards | Medium |
| 16.8 | **Misinformation flagging** | Community or automated flagging of articles containing unverified claims | High |
| 16.9 | **GDPR compliance** | Cookie consent, data export, and data deletion capabilities | Medium |
| 16.10 | **Audit log** | Track all admin actions and configuration changes | Medium |

---

## Priority Matrix

### Quick Wins (Low effort, high impact)

| Feature | Why |
|---------|-----|
| 1.1 Full-text search | Most requested feature; dramatically improves usability |
| 2.4 Bookmarks | Simple localStorage feature with huge UX value |
| 2.13 Estimated reading time | Trivial to calculate, helps users prioritize |
| 6.1 Light mode toggle | Simple theme toggle, broadens user base |
| 6.3 Layout density options | CSS-only change with big personalization impact |
| 6.9 Focus mode | Simple time filter with immediate utility |
| 6.16 Reading history | Track opened links, dim visited cards |
| 5.10 Live ticker bar | High visual impact, simple scroll animation |
| 10.8 Lazy load images | Performance improvement with minimal code |
| 10.14 Health check endpoint | Essential for monitoring and deployment |

### High-Value Strategic Features

| Feature | Why |
|---------|-----|
| 4.1 Sentiment analysis | Unique differentiator; enables conflict intensity tracking |
| 4.4 Event clustering | Transforms from a feed reader into an intelligence tool |
| 5.1 Interactive conflict map | Killer feature for conflict monitoring |
| 9.1 Database persistence | Unlocks archive, search history, analytics, and all data features |
| 4.16 AI daily briefing | Massive value-add; saves users significant time |
| 3.1 Telegram integration | Access to fastest-moving conflict information |
| 7.1 Push notifications | Critical for breaking news use case |
| 2.1 Reading mode | Eliminates need to leave the app |

### Moonshots (High effort, transformative)

| Feature | Why |
|---------|-----|
| 5.7 Animated event replay | Unprecedented conflict visualization |
| 4.12 Fact-check cross-reference | Groundbreaking for media integrity |
| 10.5 React Native mobile app | Reaches mobile-first audiences in the region |
| 13.10 Plugin system | Enables community-driven platform growth |
| 14.11 Context cards | Makes complex geopolitics accessible to general audience |
| 4.13 Casualty/displacement tracker | Critical humanitarian data aggregation |

---

## Implementation Phases

### Phase 1 — Foundation (Weeks 1-4)
> Goal: Core UX improvements that make the existing product stickier

- [ ] 1.1 Full-text search
- [ ] 2.4 Bookmarks / saved articles
- [ ] 6.1 Light mode toggle
- [ ] 6.14 Keyboard shortcuts
- [ ] 6.16 Reading history
- [ ] 10.8 Lazy load images
- [ ] 10.14 Health check endpoint
- [ ] 2.13 Estimated reading time

### Phase 2 — Engagement (Weeks 5-8)
> Goal: Features that bring users back daily

- [ ] 2.1 Reading mode / article preview
- [ ] 7.1 Browser push notifications
- [ ] 5.10 Live ticker bar
- [ ] 6.9 Focus mode (time filters)
- [ ] 1.10 Date picker filter
- [ ] 2.6 Article sharing
- [ ] 2.15 Article freshness indicator
- [ ] 6.3 Layout density options

### Phase 3 — Intelligence (Weeks 9-14)
> Goal: Transform from aggregator to intelligence platform

- [ ] 9.1 Database persistence (PostgreSQL)
- [ ] 9.2 Full-text search index
- [ ] 4.4 Event clustering
- [ ] 4.1 Sentiment analysis
- [ ] 4.3 Entity extraction (NER)
- [ ] 4.8 Conflict intensity meter
- [ ] 1.7 Trending keywords bar
- [ ] 4.9 Analytics dashboard

### Phase 4 — Visualization (Weeks 15-18)
> Goal: Unique visual experiences

- [ ] 5.1 Interactive conflict map
- [ ] 5.3 Timeline view
- [ ] 5.5 Article volume chart
- [ ] 14.3 Location geotagging
- [ ] 14.12 Glossary tooltips
- [ ] 4.15 Topic timeline

### Phase 5 — Platform (Weeks 19-24)
> Goal: Scale to multiple audiences

- [ ] 3.1 Telegram channel integration
- [ ] 10.1 PWA / offline support
- [ ] 10.2 Server-side caching (Redis)
- [ ] 11.1 Full i18n framework
- [ ] 13.1 REST API
- [ ] 13.4 RSS/Atom output feed
- [ ] 7.3 Email digest
- [ ] 4.16 AI daily briefing

### Phase 6 — Growth (Weeks 25+)
> Goal: Community and sustainability

- [ ] 8.1 Shared collections
- [ ] 8.6 Embed widget
- [ ] 12.1 Feed health dashboard
- [ ] 15.2 Donation support
- [ ] 10.5 React Native mobile app
- [ ] 13.10 Plugin system
- [ ] 2.2 Article summary (AI)
- [ ] 14.11 Context cards

---

## Feature Count Summary

| Category | Count |
|----------|-------|
| Search & Discovery | 10 |
| Article Experience | 15 |
| Source Expansion | 16 |
| Intelligence & Analytics | 18 |
| Visualization & Maps | 12 |
| User Personalization | 16 |
| Notifications & Alerts | 10 |
| Social & Collaboration | 10 |
| Data Persistence & Archive | 10 |
| Platform & Performance | 15 |
| Accessibility & i18n | 11 |
| Admin & Monitoring | 10 |
| API & Developer Tools | 10 |
| Content Enrichment | 12 |
| Monetization & Sustainability | 7 |
| Security & Trust | 10 |
| **Total** | **192** |

---

> Generated for LEBMON — Conflict Monitor. Prioritize based on user feedback, technical feasibility, and strategic alignment.
