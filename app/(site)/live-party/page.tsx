import Link from 'next/link';
import type { Metadata } from 'next';
import { LIVE_PARTY_EN } from '@/app/lib/marketing/live-party';
import { marketingMetadata } from '@/app/lib/marketing/seo';
import MarketingShell from '@/app/ui/marketing/marketing-shell';
import { FinalCta } from '@/app/ui/marketing/content-blocks';
import { LivePartyView } from '@/app/ui/marketing/live-party-view';

// Everything in the Live Party plan, with its video. Linked from every
// place the site names Live Party.
export const metadata: Metadata = {
  ...marketingMetadata(LIVE_PARTY_EN.seo, LIVE_PARTY_EN.path),
};

export default function LivePartyPage() {
  return (
    <MarketingShell>
      <LivePartyView c={LIVE_PARTY_EN} />
      <div className="wrap">
        <p className="mk-note lvp-more-q">More questions? Read the <Link href="/faq">MyGala FAQ</Link> or <Link href="/contact">contact us</Link>.</p>
      </div>
      <FinalCta title={LIVE_PARTY_EN.final.title} text={LIVE_PARTY_EN.final.text} />
    </MarketingShell>
  );
}
