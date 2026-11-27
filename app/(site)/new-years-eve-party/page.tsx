import type { Metadata } from 'next';
import { INVITATION_LANDING_PAGES } from '@/app/lib/marketing/invitation-landing';
import { marketingMetadata } from '@/app/lib/marketing/seo';
import { InvitationLandingView } from '@/app/ui/marketing/invitation-landing-view';

// New Year's Eve parties: the two New Year's themes (New Year's Eve and
// Fireworks), why a party page makes the night more fun, and invitations to
// match. Linked from /party-celebrations. Static, so it's served straight
// from the CDN.
const page = INVITATION_LANDING_PAGES['new-years'];

export const metadata: Metadata = marketingMetadata(page.seo, page.path);

export default function NewYearsEvePartyPage() {
  return <InvitationLandingView page={page} />;
}
