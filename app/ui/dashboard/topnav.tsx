import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { auth } from '@/auth';
import { fetchEventThemes } from '@/app/lib/data';
import { isPagePaidAndLive } from '@/app/lib/plans';
import type { UserPage } from '@/app/lib/definitions';
import ThemeSwitcher from './theme-switcher';
import LanguageSwitcher from './language-switcher';
import UpgradeButton from './upgrade-button';
import UserMenu from './user-menu';
import MobileMenu from './MobileMenu';
import ShareMenu from './share-menu';
import { publicPageUrl } from '@/app/lib/share';
import { pagePath } from '@/app/lib/dashboard';
import { siteHref } from '@/app/lib/app-url';

export default async function TopNav({ page: userPage, status }: { page?: UserPage; status?: Record<string, boolean> }) {
  const session = await auth();
  const themes = await fetchEventThemes();
  const pageId = userPage ? Number(userPage.id) : undefined;

  const isPaid = !!userPage && isPagePaidAndLive(userPage);
  const previewHref = userPage
    ? (isPaid && userPage.custom_domain ? `https://${userPage.custom_domain}` : siteHref(`/${userPage.slug}`))
    : undefined;
  const pageUrl = userPage ? publicPageUrl(userPage) : '';
  const title = userPage?.heading || 'MyGala';
  const share = userPage
    ? { url: pageUrl, title, heading: 'Share your page', sharePageHref: pagePath(userPage.id, '/share') }
    : undefined;
  // A link straight to the page's RSVP form.
  const shareRsvp = userPage
    ? { url: `${pageUrl}#rsvp`, title: `RSVP — ${title}`, heading: 'Share your RSVP', sharePageHref: pagePath(userPage.id, '/share') }
    : undefined;
  const free = !!userPage && !isPaid;

  return (
    <header className="dash-topnav">
      <MobileMenu pageId={pageId} pageName={userPage?.heading} isPaid={isPaid} status={status} themes={themes} currentThemeId={userPage?.theme_id ?? null} currentLanguage={userPage?.language ?? 'en'} />

      {free && <div className="dash-topnav-actions"><UpgradeButton pageId={pageId} /></div>}
      {pageId !== undefined && userPage && (
        <div className="dash-topnav-actions">
          {themes.length > 0 && (
            <ThemeSwitcher
              pageId={pageId}
              currentThemeId={userPage.theme_id ?? null}
              themes={themes}
            />
          )}
          <LanguageSwitcher pageId={pageId} currentLanguage={userPage.language ?? 'en'} />
        </div>
      )}

      <div className="dash-topnav-actions">
        {shareRsvp && <ShareMenu label="Share RSVP" {...shareRsvp} />}
        {share && <ShareMenu label="Share" {...share} />}
        {previewHref && (
          <a href={previewHref} target="_blank" rel="noopener noreferrer" className="dash-preview-link">
            <ArrowTopRightOnSquareIcon />
            Preview<span className="dash-preview-full-text"> page</span>
          </a>
        )}
      </div>

      <UserMenu
        name={session?.user?.name || 'Guest'}
        pageId={pageId}
        pageStatus={userPage?.status}
        page={userPage ? { id: Number(userPage.id), slug: userPage.slug, heading: userPage.heading, isPaid } : undefined}
        // On phones and tablets the top bar keeps just the menu button and
        // the profile; these move into the profile menu.
        phoneActions={userPage && pageId !== undefined ? {
          pageId, upgrade: free, previewHref, share, shareRsvp,
          themes, currentThemeId: userPage.theme_id ?? null, language: userPage.language ?? 'en',
        } : undefined}
      />
    </header>
  );
}
