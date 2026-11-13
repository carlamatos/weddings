import Link from 'next/link';
import { appHref } from '@/app/lib/app-url';
import { PLAN_CURRENCY, PLAN_FEATURES, PLAN_ONE_TIME_PRICE } from '@/app/lib/plans';

// The Free and Live Party plan cards, plus the checkout note under them. Shared by
// the homepage pricing section and /pricing so they can't drift apart.
// `reveal` adds the homepage's scroll-in animation classes.
export function PricingCards({ reveal = false }: { reveal?: boolean }) {
  const r = reveal ? ' reveal' : '';
  return (
    <>
      <div className="pricing-grid">
        <div className={`price-card${r}`}>
          <p className="price-tier">Free</p>
          <p className="price-amount">$0</p>
          <p className="price-desc">Everything you need to get started.</p>
          <ul className="price-features">
            {PLAN_FEATURES.free.map((f) => <li key={f}>{f}</li>)}
          </ul>
          <Link href={appHref('/register')} className="btn-secondary" style={{ textAlign: 'center' }} data-cta="pricing-free">Get started free</Link>
        </div>
        <div className={`price-card featured${r}${reveal ? ' delay-1' : ''}`}>
          <span className="price-badge">Most popular</span>
          <p className="price-tier"><Link href="/live-party" className="price-tier-link">Live Party</Link></p>
          <p className="price-amount">${PLAN_ONE_TIME_PRICE}<span className="per"> {PLAN_CURRENCY} + tax, one-time, per event</span></p>
          <p className="price-desc">Every MyGala feature for your event.</p>
          <ul className="price-features">
            {PLAN_FEATURES.plus.map((f) => <li key={f}>{f}</li>)}
          </ul>
          <Link href="/live-party" className="price-more">See everything in Live Party →</Link>
          <Link href={appHref('/register')} className="btn-primary" style={{ textAlign: 'center' }} data-cta="pricing-plus">Start your event page</Link>
        </div>
      </div>
      {/* What Stripe and card networks expect next to a price: who processes
          payment, accepted cards, the currency, and the refund policy. */}
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.7, margin: '28px auto 0', maxWidth: 640 }}>
        🔒 Secure checkout by Stripe · Visa, Mastercard and American Express accepted · Prices in Canadian dollars ({PLAN_CURRENCY}); GST/HST and provincial sales tax are added at checkout.{' '}
        <Link href="/terms#refunds" style={{ color: 'var(--rose)' }}>Refund &amp; cancellation policy</Link>
      </p>
    </>
  );
}
