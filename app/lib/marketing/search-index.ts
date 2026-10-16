import { FEATURES } from './features';
import { EVENT_TYPES } from './events';
import { FAQ_GROUPS } from './faq';
import { THEME_CARDS } from './theme-cards';
import { BLOG_POSTS } from './blog';
import { PLAN_FEATURES, PLAN_PRICE_PLUS_TAX, PLAN_TERM_MONTHS } from '@/app/lib/plans';
import { appHref } from '@/app/lib/app-url';
import type { ContentBlock, Faq } from './types';

// The site search (top bar → search icon): every marketing page, feature,
// event type, theme, blog article and FAQ answer, searched in the browser. Loaded only
// when the search opens, so it adds nothing to a page's first load.

export type SearchKind = 'Page' | 'Feature' | 'Event type' | 'Theme' | 'Article' | 'FAQ';

export type SearchEntry = {
  kind: SearchKind;
  title: string;
  url: string;
  snippet: string;
  // Normalised text the query is matched against (see normalize).
  titleText: string;
  snippetText: string;
  bodyText: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  wedding: 'Wedding',
  birthdays: 'Celebrations — birthdays, quinceañeras, baby showers',
  business: 'Business events — conferences, galas, team events',
  community: 'General events — community, holidays, parties',
};

// Lower case, accents removed (quinceañera → quinceanera), punctuation as spaces.
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const blockText = (blocks: ContentBlock[]) =>
  blocks.flatMap((b) => [b.heading, ...(b.paragraphs ?? []), ...(b.bullets ?? [])]);
const faqText = (faqs: Faq[]) => faqs.flatMap((f) => [f.q, f.a]);

function entry(kind: SearchKind, title: string, url: string, snippet: string, body: string[]): SearchEntry {
  return { kind, title, url, snippet, titleText: normalize(title), snippetText: normalize(snippet), bodyText: normalize([snippet, ...body].join(' ')) };
}

function buildIndex(): SearchEntry[] {
  const pages: SearchEntry[] = [
    entry('Page', 'Home', '/', 'Create a free event website: RSVPs, guest list, invitations, guest photos and more.', ['mygala event page website free start']),
    entry('Page', 'Pricing', '/#pricing', `Free to start. Plus is ${PLAN_PRICE_PLUS_TAX}, one-time, per event, for ${PLAN_TERM_MONTHS} months.`,
      ['price prices cost how much plan plans free plus upgrade payment one time subscription', ...PLAN_FEATURES.free, ...PLAN_FEATURES.plus]),
    entry('Page', 'All themes', '/#themes', 'Browse every theme for weddings, celebrations, business and general events.', ['themes templates designs styles']),
    entry('Page', 'All features', '/features', 'Everything MyGala can do for your event, free and Plus.', FEATURES.map((f) => `${f.navLabel} ${f.summary}`)),
    entry('Page', 'Blog', '/blog', 'Wedding and event planning tips, checklists and guides.', ['blog articles guides tips advice planning']),
    entry('Page', 'FAQ', '/faq', 'Answers to common questions about MyGala.', ['frequently asked questions help support']),
    entry('Page', 'About us', '/about', 'Who we are and why we built MyGala.', ['about company team story mygala canada']),
    entry('Page', 'Contact us', '/contact', 'Questions, feedback or help with your event page.', ['contact email support help phone reach']),
    entry('Page', 'Company information', '/company', 'MYGALA INC. — legal name, address and contact details.', ['company legal business address corporation mygala inc']),
    entry('Page', 'Privacy policy', '/privacy', 'How we collect, use and protect your information.', ['privacy data personal information cookies delete deletion pipeda']),
    entry('Page', 'Terms of service', '/terms', 'The terms for using MyGala, including payments and refunds.', ['terms conditions refund refunds payment legal agreement']),
    entry('Page', 'Open-source licences', '/open-source', 'Open-source software MyGala uses and its licences.', ['open source licence license lgpl software']),
    entry('Page', 'Sign up', appHref('/register'), 'Create your free account and your first event page.', ['sign up register create account start free']),
    entry('Page', 'Log in', appHref('/login'), 'Log in to manage your event pages.', ['log in login sign in dashboard account password']),
  ];

  const features = FEATURES.map((f) => entry('Feature', f.navLabel, `/features/${f.slug}`, f.summary, [
    f.h1, f.eyebrow, f.lead, f.plan, f.seo.title, f.seo.description, ...(f.seo.keywords ?? []),
    ...f.highlights.flatMap((h) => [h.title, h.text]), ...blockText(f.blocks),
    ...f.steps.flatMap((s) => [s.title, s.text]), ...faqText(f.faqs),
  ]));

  const eventTypes = EVENT_TYPES.map((e) => entry('Event type', e.name, `/events/${e.slug}`, e.lead, [
    e.h1, e.eyebrow, e.seo.title, e.seo.description, ...(e.seo.keywords ?? []), ...e.occasions,
    ...blockText(e.blocks), ...faqText(e.faqs),
  ]));

  const themes = THEME_CARDS.map((t) => entry('Theme', t.name, `/themes/${t.slug}`, t.desc, [
    CATEGORY_LABEL[t.category] ?? '', 'theme template design', t.sample.heading,
  ]));

  const articles = BLOG_POSTS.map((p) => entry('Article', p.title, `/blog/${p.slug}`, p.summary, [
    p.eyebrow, p.lead, p.seo.description, ...(p.seo.keywords ?? []), ...blockText(p.sections), ...faqText(p.faqs),
  ]));

  const faqs = FAQ_GROUPS.flatMap((g) => g.faqs.map((f) => entry('FAQ', f.q, `/faq#${g.id}`, f.a, [g.title])));

  return [...pages, ...features, ...eventTypes, ...themes, ...articles, ...faqs];
}

export const SEARCH_INDEX: SearchEntry[] = buildIndex();

const KIND_BOOST: Record<SearchKind, number> = { Page: 3, Feature: 3, 'Event type': 3, Theme: 2, Article: 2, FAQ: 0 };

// Query words, with a plural "s" dropped so "photos" also finds "photo".
export function queryTerms(query: string): string[] {
  return normalize(query)
    .split(' ')
    .filter(Boolean)
    .map((t) => (t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t));
}

// Every word must appear (in the title or the text). Matches in the title,
// then in the summary, then anywhere rank in that order; matches at the start
// of a word and the whole phrase in the title rank higher.
export function searchSite(query: string, limit = 30): SearchEntry[] {
  const terms = queryTerms(query);
  if (!terms.length) return [];
  const phrase = normalize(query);
  const scored: { e: SearchEntry; score: number }[] = [];
  for (const e of SEARCH_INDEX) {
    let score = 0;
    let all = true;
    for (const t of terms) {
      const inTitle = e.titleText.includes(t);
      if (!inTitle && !e.bodyText.includes(t)) { all = false; break; }
      if (inTitle) score += ` ${e.titleText}`.includes(` ${t}`) ? 12 : 7;
      else if (e.snippetText.includes(t)) score += 5; // in its summary: it's about this
      else score += ` ${e.bodyText}`.includes(` ${t}`) ? 2 : 1;
    }
    if (!all) continue;
    if (phrase.length > 2 && e.titleText.includes(phrase)) score += 15;
    if (e.titleText === phrase) score += 10;
    scored.push({ e, score: score + KIND_BOOST[e.kind] });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.e);
}
