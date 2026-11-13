import type { Metadata } from 'next';
import { esMetadata } from '@/app/lib/marketing/es';
import { LIVE_PARTY_ES, LIVE_PARTY_PATH } from '@/app/lib/marketing/live-party';
import SpanishShell from '@/app/ui/marketing/es/spanish-shell';
import { EsFinalCta } from '@/app/ui/marketing/es/es-blocks';
import { LivePartyView } from '@/app/ui/marketing/live-party-view';

// Todo lo que incluye Live Party, en español, with the Spanish video.
export function generateMetadata(): Metadata {
  return esMetadata(LIVE_PARTY_ES.seo, LIVE_PARTY_ES.path);
}

export default function SpanishLiveParty() {
  return (
    <SpanishShell english={LIVE_PARTY_PATH}>
      <LivePartyView c={LIVE_PARTY_ES} />
      <EsFinalCta title={LIVE_PARTY_ES.final.title} text={LIVE_PARTY_ES.final.text} cta="live-party-final" liveParty={false} />
    </SpanishShell>
  );
}
