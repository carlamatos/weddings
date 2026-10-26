import type { Metadata } from 'next';
import { INVITATION_LANDING_PAGES } from '@/app/lib/marketing/invitation-landing';
import { marketingMetadata } from '@/app/lib/marketing/seo';
import { InvitationLandingView } from '@/app/ui/marketing/invitation-landing-view';

// Christmas party invitations: lead with the invitation; the party page it
// opens into is the bonus. Static, so it's served straight from the CDN.
const page = INVITATION_LANDING_PAGES.christmas;

export const metadata: Metadata = marketingMetadata(page.seo, page.path);

export default function ChristmasInvitationsPage() {
  return <InvitationLandingView page={page} />;
}
