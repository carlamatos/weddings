import type { Metadata } from 'next';
import { TRY_INVITATION_PAGES } from '@/app/lib/marketing/try-invitation';
import { TryInvitationLanding, tryInvitationMetadata } from '@/app/ui/marketing/try-invitation-page';

// Try an invitation before signing up (app/ui/marketing/try-invitation-page.tsx).
const page = TRY_INVITATION_PAGES.default;

export const metadata: Metadata = tryInvitationMetadata(page);

export default async function DesignYourInvitationPage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const { theme } = await searchParams;
  return <TryInvitationLanding page={page} theme={theme} />;
}
