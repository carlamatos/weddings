import type { Metadata } from 'next';
import { auth } from '@/auth';
import { pageMetadata } from '@/app/lib/marketing/seo';
import { THEME_CARDS } from '@/app/lib/marketing/theme-cards';
import { themeRegistry } from '@/app/ui/themes/registry';
import MarketingShell from '@/app/ui/marketing/marketing-shell';
import { TryInvitation } from '@/app/ui/marketing/try-invitation';
import '@/app/ui/auth.css';
import '@/app/ui/try-invitation.css';

// Try an invitation before signing up (app/ui/marketing/try-invitation.tsx).
// ?theme= opens it in a theme, e.g. from a theme's own page or a landing page.
export const metadata: Metadata = pageMetadata(
  'Design Your Invitation Free — Try It Now',
  'Pick a design, add your names and date, and see your invitation and matching event website instantly. No account needed to try it; free to start.',
  '/design-your-invitation',
);

export default async function DesignYourInvitationPage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const { theme } = await searchParams;
  const initialTheme = theme && themeRegistry[theme] && THEME_CARDS.some((c) => c.slug === theme) ? theme : THEME_CARDS[0].slug;
  const session = await auth();
  return (
    <MarketingShell>
      <div className="auth-page try-invite">
        <TryInvitation key={initialTheme} initialTheme={initialTheme} isLoggedIn={!!session?.user} />
      </div>
    </MarketingShell>
  );
}
