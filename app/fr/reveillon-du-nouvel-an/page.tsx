import type { Metadata } from 'next';
import { INVITATION_LANDING_PAGES } from '@/app/lib/marketing/invitation-landing';
import { landingPageMetadata } from '@/app/lib/marketing/landing-metadata';
import { InvitationLandingView } from '@/app/ui/marketing/invitation-landing-view';
import { FrenchFooter } from '@/app/ui/marketing/fr/french-shell';

// The New Year's Eve party page in French (/new-years-eve-party), with the
// French pages' footer. Linked from /fr. Static.
const page = INVITATION_LANDING_PAGES['new-years-fr'];

export const metadata: Metadata = landingPageMetadata(page);

export default function ReveillonDuNouvelAnPage() {
  return <InvitationLandingView page={page} footer={<FrenchFooter english="/new-years-eve-party" />} />;
}
