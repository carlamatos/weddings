import type { Metadata } from 'next';
import { auth } from '@/auth';
import { pageMetadata } from '@/app/lib/marketing/seo';
import { THEME_CARDS } from '@/app/lib/marketing/theme-cards';
import { themeRegistry } from '@/app/ui/themes/registry';
import MarketingShell from '@/app/ui/marketing/marketing-shell';
import { TryInvitation } from '@/app/ui/marketing/try-invitation';
import '@/app/ui/auth.css';
import '@/app/ui/try-invitation.css';

// The Christmas version of /design-your-invitation: Christmas wording, the
// Christmas Party theme to start, and the Christmas themes first in the gallery.
export const metadata: Metadata = pageMetadata(
  'Design Your Christmas Party Invitation Free — Try It Now',
  'Pick a festive design, add your party’s name and date, and see your Christmas invitation and matching party page instantly. No account needed to try it.',
  '/design-your-christmas-invitation',
);

export default async function DesignYourChristmasInvitationPage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const { theme } = await searchParams;
  const initialTheme = theme && themeRegistry[theme] && THEME_CARDS.some((c) => c.slug === theme) ? theme : 'christmas-party';
  const session = await auth();
  return (
    <MarketingShell>
      <div className="auth-page try-invite">
        <TryInvitation key={initialTheme} initialTheme={initialTheme} isLoggedIn={!!session?.user} occasion="christmas" />
      </div>
    </MarketingShell>
  );
}
