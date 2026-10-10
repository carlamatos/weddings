import { siteUrl } from '@/app/lib/site-url';
import { COMPANY } from '@/app/lib/company';
import { FEATURES } from '@/app/lib/marketing/features';
import { EVENT_TYPES } from '@/app/lib/marketing/events';
import { PLAN_FEATURES, PLAN_PRICE_PLUS_TAX, PLAN_TERM_MONTHS } from '@/app/lib/plans';

// /llms.txt — a plain-language summary of MyGala for AI assistants and LLM
// crawlers (https://llmstxt.org): what it is, who it's for, the plans and the
// key pages. Built from the same data as the site, so it can't drift.
export const dynamic = 'force-static';

export function GET() {
  const base = siteUrl();
  const link = (title: string, path: string, note?: string) => `- [${title}](${base}${path})${note ? `: ${note}` : ''}`;
  const body = [
    '# MyGala',
    '',
    `> MyGala (${base.replace(/^https?:\/\//, '')}) is a Canadian event website builder. Hosts create a website for any event — weddings, birthdays, baby showers, quinceañeras, conferences, galas, holiday parties and community events — and share one link where guests find every detail and RSVP. Free to start; MyGala Plus is a one-time ${PLAN_PRICE_PLUS_TAX} per event page (not a subscription).`,
    '',
    `MyGala is owned and operated by ${COMPANY.legalName}, ${COMPANY.address.join(', ')}. Contact: ${COMPANY.email}${COMPANY.phone ? `, ${COMPANY.phone}` : ''}.`,
    '',
    'Key facts:',
    '- Guests never need an account or an app to RSVP, upload photos or sign up for a potluck.',
    '- Event pages can be shown in English, French or Spanish.',
    '- An account can create as many event pages as it needs; each page is free or Plus on its own.',
    `- Plus unlocks premium features for that page for ${PLAN_TERM_MONTHS} months, then the page stays live on the free plan. Plus never renews automatically.`,
    '- Plus purchases are non-refundable except where the law requires; charges made in error can be reported within 14 days.',
    '- Payments are processed by Stripe in Canadian dollars (CAD).',
    '',
    '## Plans',
    '',
    `- Free ($0): ${PLAN_FEATURES.free.join('; ')}.`,
    `- Plus (${PLAN_PRICE_PLUS_TAX}, one-time, per event): ${PLAN_FEATURES.plus.join('; ')}.`,
    link('Pricing', '/#pricing'),
    '',
    '## Features',
    '',
    link('All features', '/features'),
    ...FEATURES.map((f) => link(f.navLabel, `/features/${f.slug}`, `${f.summary} (${f.plan})`)),
    '',
    '## Event types',
    '',
    ...EVENT_TYPES.map((e) => link(e.name, `/events/${e.slug}`, e.seo.description)),
    '',
    '## Help and policies',
    '',
    link('FAQ', '/faq', 'Answers about pricing, RSVPs, privacy, photos, languages and custom domains'),
    link('About MyGala', '/about'),
    link('Contact', '/contact'),
    link('Terms of Service', '/terms', 'Including Plus payment, refund and cancellation terms (section 8)'),
    link('Privacy Policy', '/privacy'),
    link('Company Information', '/company'),
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
