'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

// Reports a Google Ads purchase conversion when Stripe's confirm route lands
// the buyer here with ?purchase=plus&tid=…&value=…&currency=…, then strips
// those parameters so a refresh or a shared link doesn't report it again.
// The Stripe session id is the transaction_id, so Google also de-duplicates.
export default function PurchaseConversion() {
  const params = useSearchParams();

  useEffect(() => {
    if (params.get('purchase') !== 'plus') return;
    const tid = params.get('tid') ?? '';
    const value = Number(params.get('value'));
    const currency = params.get('currency') || 'CAD';

    const url = new URL(window.location.href);
    for (const k of ['purchase', 'tid', 'value', 'currency']) url.searchParams.delete(k);
    window.history.replaceState(window.history.state, '', url);

    // gtag is defined by the Google tag script in the root layout, which loads
    // after hydration; wait for it (up to 10s).
    let tries = 0;
    const timer = window.setInterval(() => {
      if (!window.gtag && ++tries < 40) return;
      window.clearInterval(timer);
      window.gtag?.('event', 'conversion', {
        send_to: 'AW-18504468577/rGKJCN_KsJcdEOGQz_dE',
        value: value > 0 ? value : 1.0,
        currency,
        transaction_id: tid,
        new_customer: true,
      });
    }, 250);
    return () => window.clearInterval(timer);
  }, [params]);

  return null;
}
