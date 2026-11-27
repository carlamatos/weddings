import type { Metadata } from 'next';
import { INVITATION_LANDING_PAGES } from '@/app/lib/marketing/invitation-landing';
import { landingPageMetadata } from '@/app/lib/marketing/landing-metadata';
import { InvitationLandingView } from '@/app/ui/marketing/invitation-landing-view';

// New Year's Eve parties: the two New Year's themes (New Year's Eve and
// Fireworks), why a party page makes the night more fun, and invitations to
// match. Linked from the home page and /party-celebrations; also in French
// (/fr/reveillon-du-nouvel-an) and Spanish (/es/fiesta-de-ano-nuevo).
// Static, so it's served straight from the CDN.
const page = INVITATION_LANDING_PAGES['new-years'];

export const metadata: Metadata = landingPageMetadata(page);

export default function NewYearsEvePartyPage() {
  return <InvitationLandingView page={page} />;
}
