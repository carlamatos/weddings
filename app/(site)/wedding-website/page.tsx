import type { Metadata } from 'next';
import { INVITATION_LANDING_PAGES } from '@/app/lib/marketing/invitation-landing';
import { marketingMetadata } from '@/app/lib/marketing/seo';
import { InvitationLandingView } from '@/app/ui/marketing/invitation-landing-view';

// Wedding website and matching invitations: couples search for "website",
// so that word leads. Static, so it's served straight from the CDN.
const page = INVITATION_LANDING_PAGES.weddings;

export const metadata: Metadata = marketingMetadata(page.seo, page.path);

export default function WeddingWebsitePage() {
  return <InvitationLandingView page={page} />;
}
