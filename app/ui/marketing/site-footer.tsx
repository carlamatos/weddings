import Link from 'next/link';
import { FEATURES } from '@/app/lib/marketing/features';
import { EVENT_TYPES } from '@/app/lib/marketing/events';

// Footer for every marketing page: links to each feature and event type
// page, plus the company pages.
export default function SiteFooter() {
  return (
    <footer className="footer site-footer">
      <div className="site-footer-cols">
        <div>
          <p className="site-footer-heading">Features</p>
          {FEATURES.map((f) => <Link key={f.slug} href={`/features/${f.slug}`}>{f.navLabel}</Link>)}
        </div>
        <div>
          <p className="site-footer-heading">Events</p>
          {EVENT_TYPES.map((e) => <Link key={e.slug} href={`/events/${e.slug}`}>{e.name}</Link>)}
        </div>
        <div>
          <p className="site-footer-heading">MyGala</p>
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>
      <p className="footer-wordmark">My<span className="accent">Gala</span></p>
      <p style={{ marginTop: 6 }}>mygala.ca</p>
    </footer>
  );
}
