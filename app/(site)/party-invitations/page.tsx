import type { Metadata } from 'next';
import { INVITATION_LANDING_PAGES } from '@/app/lib/marketing/invitation-landing';
import { marketingMetadata } from '@/app/lib/marketing/seo';
import { InvitationLandingView } from '@/app/ui/marketing/invitation-landing-view';

// Party and celebration invitations (Christmas, birthdays, baby showers,
// Halloween first), each opening into its party page. Static, so it's
// served straight from the CDN.
const page = INVITATION_LANDING_PAGES.celebrations;

export const metadata: Metadata = marketingMetadata(page.seo, page.path);

export default function PartyInvitationsPage() {
  return <InvitationLandingView page={page} />;
}
