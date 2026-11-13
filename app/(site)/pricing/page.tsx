import Link from 'next/link';
import type { Metadata } from 'next';
import { FAQ_GROUPS } from '@/app/lib/marketing/faq';
import { breadcrumbJsonLd, faqPageJsonLd, marketingMetadata, productJsonLd, webPageJsonLd } from '@/app/lib/marketing/seo';
import type { SeoMeta } from '@/app/lib/marketing/types';
import { PLAN_PRICE_PLUS_TAX, PLAN_TERM_MONTHS } from '@/app/lib/plans';
import MarketingShell from '@/app/ui/marketing/marketing-shell';
import { Breadcrumbs } from '@/app/ui/marketing/breadcrumbs';
import { FinalCta } from '@/app/ui/marketing/content-blocks';
import { FaqList } from '@/app/ui/marketing/faq-list';
import { JsonLd } from '@/app/ui/marketing/json-ld';
import { PricingCards } from '@/app/ui/marketing/pricing-cards';

const SEO: SeoMeta = {
  title: 'MyGala Pricing: Free to Start, Live Party $49.99 Once per Event',
  description:
    'MyGala pricing: create event pages free with every theme, RSVPs and invitations. Live Party is a one-time $49.99 CAD per event, not a subscription.',
  keywords: ['MyGala pricing', 'event website pricing', 'free wedding website', 'wedding website cost', 'event page one-time payment', 'RSVP website price'],
};

export const metadata: Metadata = marketingMetadata(SEO, '/pricing');

// Free vs Live Party, row by row. `true` = included; a string = the limit.
// Mirrors PLAN_FEATURES in app/lib/plans.ts and the FAQ's limits.
const COMPARE: { label: string; href?: string; free: boolean | string; plus: boolean | string }[] = [
  { label: 'Event pages', free: 'As many as you need', plus: 'Per event' },
  { label: 'Every theme, switch any time', href: '/features/event-templates', free: true, plus: true },
  { label: 'RSVPs with guest counts and CSV export', free: true, plus: true },
  { label: 'Guest list (spreadsheet or contacts import)', free: true, plus: true },
  { label: 'Invitations by email, text and WhatsApp', href: '/features/invitations', free: true, plus: true },
  { label: 'Countdown, event details, map and program', free: true, plus: true },
  { label: 'English, Spanish or French page', href: '/features/event-page-translations', free: true, plus: true },
  { label: 'Your address at mygala.ca/yourname', free: true, plus: true },
  { label: 'Photo gallery', free: 'Up to 8 photos', plus: 'Up to 100 photos' },
  { label: 'Guest photo wall and table QR codes', href: '/features/guest-photo-qr-code', free: 'Up to 50 photos', plus: 'Up to 500 photos' },
  { label: 'Find-your-table seating with a QR sign', href: '/features/find-your-table', free: false, plus: true },
  { label: 'Livestream and song requests', href: '/features/livestream', free: false, plus: true },
  { label: 'Automatic reminder emails', href: '/features/event-reminder-emails', free: false, plus: true },
  { label: 'Gift exchange (Secret Santa)', href: '/features/gift-exchange', free: true, plus: true },
  { label: 'Potluck sign-up', href: '/features/potluck', free: true, plus: true },
  { label: 'Custom sections', href: '/features/custom-sections', free: true, plus: true },
  { label: 'Gift registry section', free: true, plus: true },
  { label: 'Sponsors', href: '/features/custom-sections', free: false, plus: true },
  { label: 'Password-protected page', href: '/features/password-protection', free: false, plus: true },
  { label: 'Your own domain', href: '/features/custom-domain', free: false, plus: true },
  { label: 'Priority support', free: false, plus: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') return <td>{value}</td>;
  return value
    ? <td><span className="mk-check" aria-label="Included">✓</span></td>
    : <td><span className="mk-dash" aria-label="Not included">—</span></td>;
}

const PRICING_FAQS = FAQ_GROUPS.find((g) => g.id === 'pricing')?.faqs ?? [];

export default function PricingPage() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing' }];
  return (
    <MarketingShell>
      <JsonLd data={webPageJsonLd(SEO, '/pricing')} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={productJsonLd()} />
      <JsonLd data={faqPageJsonLd(PRICING_FAQS)} />

      <header className="mk-hero">
        <div className="wrap">
          <Breadcrumbs crumbs={crumbs} />
          <p className="eyebrow">MyGala pricing</p>
          <h1 className="mk-h1">Start free. Pay once, only for the events that need more.</h1>
          <p className="mk-lead">
            Every MyGala event page is free, with every theme, RSVPs, your guest list and invitations. <Link href="/live-party">Live Party</Link> is a single payment
            of {PLAN_PRICE_PLUS_TAX} per event that unlocks everything else for {PLAN_TERM_MONTHS} months. No subscription, no card kept on file.
          </p>
        </div>
      </header>

      <div className="wrap">
        <section className="mk-pricing">
          <PricingCards />
        </section>

        <section className="mk-body mk-compare-wrap">
          <h2 className="mk-h2">Compare Free and Live Party</h2>
          <div className="mk-compare-scroll">
            <table className="mk-compare">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">Free</th>
                  <th scope="col"><Link href="/live-party">Live Party</Link></th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.href ? <Link href={row.href}>{row.label}</Link> : row.label}</th>
                    <Cell value={row.free} />
                    <Cell value={row.plus} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mk-body">
          <section className="mk-block">
            <h2 className="mk-h2">How <Link href="/live-party">Live Party</Link> works</h2>
            <ul className="mk-list">
              <li><strong>Per event.</strong> Live Party belongs to one event page, so a free birthday page and a Live Party wedding page can sit side by side in your dashboard.</li>
              <li><strong>One payment.</strong> You pay once at checkout. Nothing renews, so there is nothing to cancel.</li>
              <li><strong>{PLAN_TERM_MONTHS} months of everything.</strong> Plenty of time to plan, celebrate and collect the photos afterwards. When the term ends, your page stays online on the free plan, or you can extend Live Party with another single payment.</li>
              <li><strong>Upgrade any time.</strong> Start free and switch to Live Party when you need it. Everything you set up stays as it is.</li>
            </ul>
          </section>

          <section className="mk-block" id="faq">
            <h2 className="mk-h2">Pricing questions</h2>
            <FaqList faqs={PRICING_FAQS} />
            <p className="mk-note">More questions? Read the <Link href="/faq">MyGala FAQ</Link> or <Link href="/contact">contact us</Link>.</p>
          </section>
        </div>
      </div>

      <FinalCta title="Your event page is free to start" text="Pick a theme, add your details and share your link today. Upgrade to Live Party only if your event needs it." />
    </MarketingShell>
  );
}
