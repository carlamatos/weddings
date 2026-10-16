import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { auth } from '@/auth';
import { fetchEventThemes } from '@/app/lib/data';
import { isPagePaidAndLive } from '@/app/lib/plans';
import type { UserPage } from '@/app/lib/definitions';
import ThemeSwitcher from './theme-switcher';
import LanguageSwitcher from './language-switcher';
import UserMenu from './user-menu';
import MobileMenu from './MobileMenu';
import ShareMenu, { type ShareChoice } from './share-menu';
import type { SetupStep } from '@/app/lib/setup-progress';
import { publicPageUrl } from '@/app/lib/share';
import { pagePath } from '@/app/lib/dashboard';
import { siteHref } from '@/app/lib/app-url';

export default async function TopNav({ page: userPage, status, setup }: { page?: UserPage; status?: Record<string, boolean>; setup?: SetupStep[] }) {
  const session = await auth();
  const themes = await fetchEventThemes();
  const pageId = userPage ? Number(userPage.id) : undefined;

  const isPaid = !!userPage && isPagePaidAndLive(userPage);
  const previewHref = userPage
    ? (isPaid && userPage.custom_domain && userPage.domain_status === 'active' ? `https://${userPage.custom_domain}` : siteHref(`/${userPage.slug}`))
    : undefined;
  const pageUrl = userPage ? publicPageUrl(userPage) : '';
  const title = userPage?.heading || 'MyGala';
  // One Share button: the page, or straight to its RSVP form.
  const shareChoices: ShareChoice[] | undefined = userPage
    ? [
        { tab: 'Your page', target: { url: pageUrl, title, heading: 'Share your page', sharePageHref: pagePath(userPage.id, '/share') } },
        { tab: 'RSVP form', target: { url: `${pageUrl}#rsvp`, title: `RSVP — ${title}`, heading: 'Share your RSVP form', sharePageHref: pagePath(userPage.id, '/share') } },
      ]
    : undefined;
  // Whether guests can see the page, with its address beside it.
  const pageState = userPage ? pageStateOf(userPage.status) : undefined;
  const shortUrl = pageUrl.replace(/^https?:\/\//, '');

  return (
    <header className="dash-topnav">
      <MobileMenu pageId={pageId} pageName={userPage?.heading} isPaid={isPaid} status={status} setup={setup} themes={themes} currentThemeId={userPage?.theme_id ?? null} currentLanguage={userPage?.language ?? 'en'} />

      {pageId !== undefined && userPage && (
        <div className="dash-topnav-actions">
          {themes.length > 0 && (
            <ThemeSwitcher
              pageId={pageId}
              currentThemeId={userPage.theme_id ?? null}
              themes={themes}
              label="Theme"
            />
          )}
          <LanguageSwitcher pageId={pageId} currentLanguage={userPage.language ?? 'en'} />
        </div>
      )}

      <span className="dash-topnav-spacer" />

      {previewHref && pageState && (
        <a
          href={previewHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`dash-page-status dash-page-status--${pageState.kind}`}
          title={`${pageState.hint} Opens your page in a new tab.`}
        >
          <span className="dash-page-status-dot" aria-hidden="true" />
          <span className="dash-page-status-label">{pageState.label}</span>
          <span className="dash-page-status-url">{shortUrl}</span>
          <ArrowTopRightOnSquareIcon aria-hidden="true" />
        </a>
      )}

      {shareChoices && (
        <div className="dash-topnav-actions">
          <ShareMenu choices={shareChoices} />
        </div>
      )}

      <UserMenu
        name={session?.user?.name || 'Guest'}
        pageId={pageId}
        pageStatus={userPage?.status}
        page={userPage ? { id: Number(userPage.id), slug: userPage.slug, heading: userPage.heading, isPaid } : undefined}
        // On phones and tablets the top bar keeps just the menu button and
        // the profile; these move into the profile menu.
        phoneActions={userPage && pageId !== undefined ? {
          pageId, previewHref, shareChoices: shareChoices!,
          themes, currentThemeId: userPage.theme_id ?? null, language: userPage.language ?? 'en',
        } : undefined}
      />
    </header>
  );
}

// The page's status as guests see it. Pages go live when they're created;
// the owner can take one offline (deactivate) and MyGala can suspend one.
function pageStateOf(status?: string): { kind: 'live' | 'off' | 'suspended'; label: string; hint: string } {
  if (status === 'suspended') return { kind: 'suspended', label: 'Suspended', hint: 'Suspended by MyGala: guests can’t open your page.' };
  if (status === 'inactive') return { kind: 'off', label: 'Offline', hint: 'Deactivated: guests see “page unavailable”. Reactivate it from your profile menu.' };
  return { kind: 'live', label: 'Live', hint: 'Live: guests can open your page.' };
}
