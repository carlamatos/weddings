import Link from 'next/link';
import type { UserPage } from '@/app/lib/definitions';
import { themeRegistry } from '@/app/ui/themes/registry';
import { siteHref } from '@/app/lib/app-url';

// A quiet pointer to one of the free planning tools (/tools) on the dashboard
// screen where a host needs it: the RSVP deadline calculator on RSVP, the
// guest count planner on Guest List. Sits at the bottom of the screen so it
// never pushes the screen's own tools down, and opens in a new tab so the
// dashboard stays put.
export function PlanningToolTip({ href, title, text, cta, internal }: { href: string; title: string; text: string; cta: string; internal?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap',
      background: '#F7F4F1', border: '1px solid #EDE8E3', borderRadius: 10, padding: '12px 16px', margin: '28px 0 0', fontFamily: 'system-ui, sans-serif',
    }}>
      <span style={{ fontSize: 14, lineHeight: 1.55, color: '#6B6470' }}>
        <strong style={{ color: '#241F2B' }}>{title}</strong> {text}
      </span>
      {internal ? (
        <Link href={href} style={{ fontSize: 13, fontWeight: 600, color: '#B6584A', textDecoration: 'none', whiteSpace: 'nowrap' }}>{cta} →</Link>
      ) : (
        <a href={siteHref(href)} target="_blank" rel="noopener" style={{ fontSize: 13, fontWeight: 600, color: '#B6584A', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          {cta} ↗
        </a>
      )}
    </div>
  );
}

// The RSVP deadline calculator, opened with this page's date and kind of event.
export function rsvpCalculatorHref(page: Pick<UserPage, 'event_date' | 'theme_slug'>): string {
  const raw = page.event_date as unknown;
  const date = raw instanceof Date ? raw.toISOString().slice(0, 10) : String(raw ?? '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return '/rsvp-deadline-calculator';
  const category = page.theme_slug ? themeRegistry[page.theme_slug]?.category : undefined;
  const [type, days, seating] = category === 'wedding' ? ['wedding', 14, 1] : category === 'business' ? ['corporate', 10, 1] : ['party', 7, 0];
  return `/rsvp-deadline-calculator#rsvp=${date}.${type}.${days}.${seating}`;
}
