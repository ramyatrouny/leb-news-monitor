"use client";

import type { FeedItem } from "@/app/api/feeds/route";

export type EntityType = "person" | "place" | "org" | "topic";

export interface Entity {
  name: string;      
  type: EntityType;
  aliases: string[]; 
}

export interface TagInfo {
  tag: string;         
  type: EntityType;
  count: number;       
}

const ENTITIES: Entity[] = [
  // ── People ────────────────────────────────────────────────────
  { name: "Joseph Aoun", type: "person", aliases: ["joseph aoun", "جوزاف عون", "جوزيف عون"] },
  { name: "Najib Mikati", type: "person", aliases: ["najib mikati", "نجيب ميقاتي", "mikati"] },
  { name: "Nabih Berri", type: "person", aliases: ["nabih berri", "نبيه بري", "berri"] },
  { name: "Hassan Nasrallah", type: "person", aliases: ["hassan nasrallah", "حسن نصرالله", "nasrallah", "نصرالله"] },
  { name: "Samir Geagea", type: "person", aliases: ["samir geagea", "سمير جعجع", "geagea", "جعجع"] },
  { name: "Gebran Bassil", type: "person", aliases: ["gebran bassil", "جبران باسيل", "bassil", "باسيل"] },
  { name: "Michel Aoun", type: "person", aliases: ["michel aoun", "ميشال عون"] },
  { name: "Walid Jumblatt", type: "person", aliases: ["walid jumblatt", "وليد جنبلاط", "jumblatt", "جنبلاط"] },
  { name: "Saad Hariri", type: "person", aliases: ["saad hariri", "سعد الحريري", "hariri", "الحريري"] },
  { name: "Suleiman Frangieh", type: "person", aliases: ["suleiman frangieh", "سليمان فرنجية", "frangieh", "فرنجية"] },
  { name: "Nawaf Salam", type: "person", aliases: ["nawaf salam", "نواف سلام", "salam"] },
  { name: "Benjamin Netanyahu", type: "person", aliases: ["benjamin netanyahu", "netanyahu", "نتنياهو", "بنيامين نتنياهو", "bibi"] },
  { name: "Yoav Gallant", type: "person", aliases: ["yoav gallant", "gallant", "غالانت", "يوآف غالانت"] },
  { name: "Benny Gantz", type: "person", aliases: ["benny gantz", "gantz", "غانتس", "بيني غانتس"] },
  { name: "Itamar Ben Gvir", type: "person", aliases: ["itamar ben gvir", "ben gvir", "بن غفير"] },
  { name: "Bezalel Smotrich", type: "person", aliases: ["bezalel smotrich", "smotrich", "سموتريتش"] },
  { name: "Ismail Haniyeh", type: "person", aliases: ["ismail haniyeh", "haniyeh", "هنية", "إسماعيل هنية"] },
  { name: "Yahya Sinwar", type: "person", aliases: ["yahya sinwar", "sinwar", "السنوار", "يحيى السنوار"] },
  { name: "Mahmoud Abbas", type: "person", aliases: ["mahmoud abbas", "abbas", "عباس", "محمود عباس", "abu mazen"] },
  { name: "Abdel Fattah el-Sisi", type: "person", aliases: ["abdel fattah el-sisi", "sisi", "السيسي", "عبد الفتاح السيسي"] },
  { name: "Mohammed bin Salman", type: "person", aliases: ["mohammed bin salman", "mbs", "محمد بن سلمان", "بن سلمان"] },
  { name: "Bashar al-Assad", type: "person", aliases: ["bashar al-assad", "assad", "الأسد", "بشار الأسد"] },
  { name: "Ebrahim Raisi", type: "person", aliases: ["ebrahim raisi", "raisi", "رئيسي", "إبراهيم رئيسي"] },
  { name: "Ali Khamenei", type: "person", aliases: ["ali khamenei", "khamenei", "خامنئي", "علي خامنئي"] },
  { name: "Recep Tayyip Erdogan", type: "person", aliases: ["recep tayyip erdogan", "erdogan", "أردوغان", "إردوغان"] },
  { name: "Joe Biden", type: "person", aliases: ["joe biden", "biden", "بايدن"] },
  { name: "Donald Trump", type: "person", aliases: ["donald trump", "trump", "ترامب"] },
  { name: "Antony Blinken", type: "person", aliases: ["antony blinken", "blinken", "بلينكن"] },
  { name: "António Guterres", type: "person", aliases: ["antonio guterres", "guterres", "غوتيريش"] },
  { name: "King Abdullah II", type: "person", aliases: ["king abdullah", "abdullah ii", "الملك عبدالله"] },
  { name: "Amos Hochstein", type: "person", aliases: ["amos hochstein", "hochstein", "هوكشتاين"] },

  { name: "Beirut", type: "place", aliases: ["beirut", "بيروت"] },
  { name: "Tripoli", type: "place", aliases: ["tripoli", "طرابلس"] },
  { name: "Sidon", type: "place", aliases: ["sidon", "صيدا", "saida"] },
  { name: "Tyre", type: "place", aliases: ["tyre", "صور"] },
  { name: "Baalbek", type: "place", aliases: ["baalbek", "بعلبك"] },
  { name: "Nabatieh", type: "place", aliases: ["nabatieh", "nabatiyeh", "النبطية"] },
  { name: "Jounieh", type: "place", aliases: ["jounieh", "جونية"] },
  { name: "Zahle", type: "place", aliases: ["zahle", "zahlé", "زحلة"] },
  { name: "South Lebanon", type: "place", aliases: ["south lebanon", "جنوب لبنان", "southern lebanon"] },
  { name: "Mount Lebanon", type: "place", aliases: ["mount lebanon", "جبل لبنان"] },
  { name: "Bekaa", type: "place", aliases: ["bekaa", "beqaa", "البقاع"] },
  { name: "Dahiyeh", type: "place", aliases: ["dahiyeh", "dahieh", "الضاحية", "dahiye"] },
  { name: "Rafic Hariri Airport", type: "place", aliases: ["rafic hariri airport", "beirut airport", "مطار بيروت", "مطار رفيق الحريري"] },
  { name: "Litani River", type: "place", aliases: ["litani", "الليطاني", "litani river"] },
  { name: "Blue Line", type: "place", aliases: ["blue line", "الخط الأزرق"] },
  { name: "Hermel", type: "place", aliases: ["hermel", "الهرمل"] },
  { name: "Bint Jbeil", type: "place", aliases: ["bint jbeil", "بنت جبيل"] },
  { name: "Marjayoun", type: "place", aliases: ["marjayoun", "مرجعيون"] },
  { name: "Naqoura", type: "place", aliases: ["naqoura", "الناقورة"] },
  { name: "Khalde", type: "place", aliases: ["khalde", "خلدة"] },
  { name: "Aley", type: "place", aliases: ["aley", "عاليه"] },
  { name: "Gaza", type: "place", aliases: ["gaza", "غزة", "gaza strip", "قطاع غزة"] },
  { name: "West Bank", type: "place", aliases: ["west bank", "الضفة الغربية", "الضفة"] },
  { name: "Jerusalem", type: "place", aliases: ["jerusalem", "القدس", "al-quds"] },
  { name: "Tel Aviv", type: "place", aliases: ["tel aviv", "تل أبيب"] },
  { name: "Haifa", type: "place", aliases: ["haifa", "حيفا"] },
  { name: "Rafah", type: "place", aliases: ["rafah", "رفح"] },
  { name: "Khan Younis", type: "place", aliases: ["khan younis", "khan yunis", "خان يونس"] },
  { name: "Jenin", type: "place", aliases: ["jenin", "جنين"] },
  { name: "Nablus", type: "place", aliases: ["nablus", "نابلس"] },
  { name: "Ramallah", type: "place", aliases: ["ramallah", "رام الله"] },
  { name: "Golan Heights", type: "place", aliases: ["golan heights", "golan", "الجولان", "هضبة الجولان"] },
  { name: "Al-Aqsa", type: "place", aliases: ["al-aqsa", "الأقصى", "al aqsa", "المسجد الأقصى"] },
  { name: "Damascus", type: "place", aliases: ["damascus", "دمشق"] },
  { name: "Tehran", type: "place", aliases: ["tehran", "طهران"] },
  { name: "Baghdad", type: "place", aliases: ["baghdad", "بغداد"] },
  { name: "Amman", type: "place", aliases: ["amman", "عمان"] },
  { name: "Cairo", type: "place", aliases: ["cairo", "القاهرة"] },
  { name: "Riyadh", type: "place", aliases: ["riyadh", "الرياض"] },
  { name: "Doha", type: "place", aliases: ["doha", "الدوحة"] },
  { name: "Ankara", type: "place", aliases: ["ankara", "أنقرة"] },
  { name: "Washington", type: "place", aliases: ["washington", "واشنطن"] },

  // ── Organizations ─────────────────────────────────────────────
  { name: "Hezbollah", type: "org", aliases: ["hezbollah", "حزب الله", "hezballah", "hizbollah", "hizbullah"] },
  { name: "Lebanese Army", type: "org", aliases: ["lebanese army", "الجيش اللبناني", "lebanese armed forces", "laf"] },
  { name: "Internal Security Forces", type: "org", aliases: ["internal security forces", "isf", "قوى الأمن الداخلي"] },
  { name: "Future Movement", type: "org", aliases: ["future movement", "تيار المستقبل"] },
  { name: "Free Patriotic Movement", type: "org", aliases: ["free patriotic movement", "fpm", "التيار الوطني الحر"] },
  { name: "Lebanese Forces", type: "org", aliases: ["lebanese forces", "القوات اللبنانية"] },
  { name: "Amal Movement", type: "org", aliases: ["amal movement", "amal", "حركة أمل"] },
  { name: "Progressive Socialist Party", type: "org", aliases: ["progressive socialist party", "psp", "الحزب التقدمي الاشتراكي"] },
  { name: "Kataeb", type: "org", aliases: ["kataeb", "الكتائب", "phalange"] },
  { name: "Central Bank of Lebanon", type: "org", aliases: ["central bank of lebanon", "مصرف لبنان", "banque du liban", "bdl"] },
  { name: "Hamas", type: "org", aliases: ["hamas", "حماس"] },
  { name: "Islamic Jihad", type: "org", aliases: ["islamic jihad", "الجهاد الإسلامي", "pij"] },
  { name: "Fatah", type: "org", aliases: ["fatah", "فتح"] },
  { name: "Palestinian Authority", type: "org", aliases: ["palestinian authority", "السلطة الفلسطينية", "pa"] },
  { name: "PLO", type: "org", aliases: ["plo", "منظمة التحرير الفلسطينية"] },
  { name: "IDF", type: "org", aliases: ["idf", "israel defense forces", "israeli military", "الجيش الإسرائيلي", "جيش الاحتلال"] },
  { name: "Mossad", type: "org", aliases: ["mossad", "الموساد"] },
  { name: "Shin Bet", type: "org", aliases: ["shin bet", "الشاباك", "shabak"] },
  { name: "Knesset", type: "org", aliases: ["knesset", "الكنيست"] },
  { name: "Likud", type: "org", aliases: ["likud", "الليكود"] },
  { name: "UNIFIL", type: "org", aliases: ["unifil", "اليونيفيل", "un interim force"] },
  { name: "UNRWA", type: "org", aliases: ["unrwa", "الأونروا"] },
  { name: "United Nations", type: "org", aliases: ["united nations", "الأمم المتحدة", "un"] },
  { name: "IRGC", type: "org", aliases: ["irgc", "الحرس الثوري", "islamic revolutionary guard corps", "revolutionary guard"] },
  { name: "Red Cross", type: "org", aliases: ["red cross", "الصليب الأحمر", "icrc", "red crescent", "الهلال الأحمر"] },
  { name: "WHO", type: "org", aliases: ["who", "world health organization", "منظمة الصحة العالمية"] },
  { name: "NATO", type: "org", aliases: ["nato", "الناتو", "حلف الناتو"] },
  { name: "EU", type: "org", aliases: ["european union", "الاتحاد الأوروبي"] },
  { name: "Arab League", type: "org", aliases: ["arab league", "جامعة الدول العربية", "الجامعة العربية"] },
  { name: "IMF", type: "org", aliases: ["imf", "international monetary fund", "صندوق النقد الدولي"] },
  { name: "World Bank", type: "org", aliases: ["world bank", "البنك الدولي"] },
  { name: "MSF", type: "org", aliases: ["doctors without borders", "médecins sans frontières", "أطباء بلا حدود"] },
  { name: "Amnesty International", type: "org", aliases: ["amnesty international", "منظمة العفو الدولية", "amnesty"] },
  { name: "Human Rights Watch", type: "org", aliases: ["human rights watch", "hrw", "هيومن رايتس ووتش"] },
  { name: "ISIS", type: "org", aliases: ["isis", "isil", "داعش", "islamic state", "تنظيم الدولة"] },
  { name: "Al-Qaeda", type: "org", aliases: ["al-qaeda", "al qaeda", "القاعدة", "تنظيم القاعدة"] },
  { name: "Houthis", type: "org", aliases: ["houthis", "houthi", "الحوثيون", "الحوثي", "ansar allah", "أنصار الله"] },
  { name: "Security Council", type: "org", aliases: ["security council", "مجلس الأمن", "unsc"] },
];

interface AliasEntry {
  alias: string;
  entity: Entity;
}

const ALIAS_LIST: AliasEntry[] = ENTITIES.flatMap((e) =>
  e.aliases.map((a) => ({ alias: a.toLowerCase(), entity: e })),
).sort((a, b) => b.alias.length - a.alias.length);

const SHORT_ALIAS = new Set(
  ALIAS_LIST.filter((a) => a.alias.length <= 3).map((a) => a.alias),
);

const KNOWN_ALIAS_SET = new Set(
  ENTITIES.flatMap((e) => e.aliases.map((a) => a.toLowerCase())),
);
const KNOWN_NAME_SET = new Set(
  ENTITIES.map((e) => e.name.toLowerCase()),
);

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractEntities(text: string): Map<string, EntityType> {
  const found = new Map<string, EntityType>();
  const lower = text.toLowerCase();

  for (const { alias, entity } of ALIAS_LIST) {
    if (found.has(entity.name)) continue;

    if (SHORT_ALIAS.has(alias)) {
      const re = new RegExp(`\\b${escapeRegex(alias)}\\b`, "i");
      if (re.test(text)) {
        found.set(entity.name, entity.type);
      }
    } else if (lower.includes(alias)) {
      found.set(entity.name, entity.type);
    }
  }

  return found;
}

const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const STOP_WORDS = new Set([
  // English
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "has", "have", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "not", "no", "so", "if",
  "as", "it", "its", "that", "this", "these", "those", "he", "she",
  "they", "we", "you", "my", "his", "her", "our", "your", "their",
  "me", "him", "us", "them", "who", "what", "when", "where", "how",
  "which", "than", "more", "also", "up", "out", "about", "into", "over",
  "after", "before", "between", "during", "just", "new", "said", "says",
  "all", "some", "any", "being", "very", "most", "only", "own", "same",
  "such", "other", "each", "every", "both", "few", "much", "many",
  "too", "then", "now", "here", "there", "still", "even", "first",
  "last", "long", "great", "way", "one", "two", "three", "four", "five",
  "six", "old", "like", "back", "well", "get", "got", "set", "make",
  "made", "take", "come", "came", "go", "went", "going", "part", "while",
  "per", "via", "read", "update", "news", "report", "reports", "source",
  "sources", "according", "say", "told", "tell", "year", "years", "day",
  "days", "time", "week", "month", "ago", "today", "yesterday", "latest",
  "breaking", "people", "official", "officials", "state", "government",
  "country", "world", "international", "national", "local", "region",
  "area", "city", "group", "number", "case", "point", "end", "system",
  "program", "company", "follow", "show", "call", "called", "under",
  "through", "against", "around", "among", "several", "ten", "seven",
  "eight", "nine", "until", "since", "above", "below", "full", "life",
  "down", "side", "another", "found", "work", "place", "right", "left",
  "high", "large", "small", "including", "early", "near", "late",
  "war", "attack", "killed", "dead", "death", "help", "use", "used",
  // Arabic
  "في", "من", "على", "إلى", "عن", "مع", "هذا", "هذه", "التي", "الذي",
  "أن", "إن", "كان", "قد", "لا", "ما", "هو", "هي", "ذلك", "بين",
  "كل", "بعد", "قبل", "حتى", "ثم", "أو", "بل", "لكن", "عند",
  "عبر", "خلال", "منذ", "تم", "يتم", "كما", "لم", "لن", "سوف",
  "نحو", "ضد", "حول", "دون", "فوق", "تحت", "وفق", "أكثر", "أقل",
  "عدد", "بعض", "أحد", "أي", "غير", "حيث", "إذا", "أما", "مثل",
  "يوم", "أمس", "اليوم",
]);

/** Tokenise text — shared by tags + trending for single-pass efficiency */
export function tokenizeText(text: string): string[] {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^['-]+|['-]+$/g, ""))
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()));
}

function displayName(word: string): string {
  if (ARABIC_RE.test(word)) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export interface TextAnalysis {
  /** Per-article token sets (article id → set of lowercase tokens) */
  articleTokens: Map<string, Set<string>>;
  /** Per-word document frequency (lowercase word → { display, articleIds }) */
  wordDocs: Map<string, { display: string; articles: Set<string> }>;
}

let analysisCache: { key: FeedItem[]; result: TextAnalysis } | null = null;

/** Single-pass text analysis — cached by reference equality on items array */
export function analyzeTexts(items: FeedItem[]): TextAnalysis {
  if (analysisCache && analysisCache.key === items) {
    return analysisCache.result;
  }

  const articleTokens = new Map<string, Set<string>>();
  const wordDocs = new Map<string, { display: string; articles: Set<string> }>();

  for (const item of items) {
    const text = `${item.title} ${item.snippet}`;
    const tokens = tokenizeText(text);
    const seen = new Set<string>();

    for (const tok of tokens) {
      const key = tok.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const entry = wordDocs.get(key);
      if (entry) {
        entry.articles.add(item.id);
      } else {
        wordDocs.set(key, { display: tok, articles: new Set([item.id]) });
      }
    }
    articleTokens.set(item.id, seen);
  }

  const result = { articleTokens, wordDocs };
  analysisCache = { key: items, result };
  return result;
}

export function tagArticles(
  items: FeedItem[],
): { tagMap: Map<string, Set<string>>; tagIndex: Map<string, TagInfo> } {
  const tagMap = new Map<string, Set<string>>();
  const counters = new Map<string, { type: EntityType; count: number }>();

  for (const item of items) {
    const text = `${item.title} ${item.snippet}`;
    const entities = extractEntities(text);

    if (entities.size > 0) {
      const tags = new Set<string>();
      for (const [name, type] of entities) {
        tags.add(name);
        const existing = counters.get(name);
        if (existing) existing.count++;
        else counters.set(name, { type, count: 1 });
      }
      tagMap.set(item.id, tags);
    }
  }

  if (items.length === 0) {
    return { tagMap, tagIndex: new Map<string, TagInfo>() };
  }

  const { wordDocs } = analyzeTexts(items);

  // Significant terms: ≥2 articles, <40% corpus, not a known alias
  const maxDocs = Math.max(3, Math.floor(items.length * 0.4));
  const candidates: { display: string; key: string; count: number; score: number }[] = [];

  for (const [key, { display, articles }] of wordDocs) {
    if (articles.size < 2 || articles.size > maxDocs) continue;
    if (KNOWN_ALIAS_SET.has(key) || KNOWN_NAME_SET.has(key)) continue;

    const idf = Math.log(items.length / articles.size);
    candidates.push({
      display: displayName(display),
      key,
      count: articles.size,
      score: articles.size * idf,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  const topDynamic = candidates.slice(0, 50);

  for (const { display, key, count } of topDynamic) {
    if (counters.has(display)) continue;
    counters.set(display, { type: "topic", count });

    const docs = wordDocs.get(key)!;
    for (const articleId of docs.articles) {
      const tags = tagMap.get(articleId) || new Set<string>();
      tags.add(display);
      tagMap.set(articleId, tags);
    }
  }

  /* ── Phase 3: Fallback — give untagged articles their top terms ─ */
  for (const item of items) {
    const existing = tagMap.get(item.id);
    if (existing && existing.size > 0) continue;

    const text = `${item.title} ${item.snippet}`;
    const tokens = tokenizeText(text);
    const seen = new Set<string>();
    const scored: { term: string; score: number }[] = [];

    for (const tok of tokens) {
      const key = tok.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      if (KNOWN_ALIAS_SET.has(key)) continue;

      const docs = wordDocs.get(key);
      if (!docs) continue;

      const idf = Math.log(items.length / docs.articles.size);
      scored.push({ term: displayName(tok), score: idf });
    }

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 3);

    if (top.length > 0) {
      const tags = new Set<string>();
      for (const { term } of top) {
        tags.add(term);
        const c = counters.get(term);
        if (c) c.count++;
        else counters.set(term, { type: "topic", count: 1 });
      }
      tagMap.set(item.id, tags);
    }
  }

  const tagIndex = new Map<string, TagInfo>();
  for (const [tag, { type, count }] of counters) {
    tagIndex.set(tag, { tag, type, count });
  }

  return { tagMap, tagIndex };
}

export function applyTagFilter(
  items: FeedItem[],
  activeTags: Set<string>,
  tagMap: Map<string, Set<string>>,
): FeedItem[] {
  if (activeTags.size === 0) return items;
  return items.filter((item) => {
    const itemTags = tagMap.get(item.id);
    if (!itemTags) return false;
    for (const tag of activeTags) {
      if (!itemTags.has(tag)) return false;
    }
    return true;
  });
}
