import type { Metadata } from 'next';
import { INVITATION_LANDING_PAGES } from '@/app/lib/marketing/invitation-landing';
import { landingPageMetadata } from '@/app/lib/marketing/landing-metadata';
import { InvitationLandingView } from '@/app/ui/marketing/invitation-landing-view';
import { SpanishFooter } from '@/app/ui/marketing/es/spanish-shell';
import '@/app/ui/marketing/es/es.css';

// The New Year's Eve party page in Spanish (/new-years-eve-party), with the
// Spanish pages' footer. Linked from /es. Static.
const page = INVITATION_LANDING_PAGES['new-years-es'];

export const metadata: Metadata = landingPageMetadata(page);

export default function FiestaDeAnoNuevoPage() {
  return <InvitationLandingView page={page} footer={<SpanishFooter english="/new-years-eve-party" />} />;
}
