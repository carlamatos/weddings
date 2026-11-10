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

import { getDashText } from '@/app/lib/dash-text/server';
import type { DashText } from '@/app/lib/dash-text/en';
import { fill } from '@/app/lib/dash-text/fill';
export default async function TopNav({ page: userPage, status, setup }: { page?: UserPage; status?: Record<string, boolean>; setup?: SetupStep[] }) {
  const d = await getDashText();
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
        { tab: d.topnav.yourPage, target: { url: pageUrl, title, heading: d.topnav.shareYourPage, sharePageHref: pagePath(userPage.id, '/share'), pageId: Number(userPage.id) } },
        { tab: d.topnav.rsvpForm, target: { url: `${pageUrl}#rsvp`, title: `RSVP — ${title}`, heading: d.topnav.shareYourRsvpForm, sharePageHref: pagePath(userPage.id, '/share'), pageId: Number(userPage.id) } },
      ]
    : undefined;
  // Whether guests can see the page, with its address beside it.
  const pageState = userPage ? pageStateOf(userPage.status, d.pageState) : undefined;
  const shortUrl = pageUrl.replace(/^https?:\/\//, '');

  return (
    <header className="dash-topnav">
      <MobileMenu pageId={pageId} pageName={userPage?.heading} isPaid={isPaid} status={status} setup={setup} themes={themes} currentThemeId={userPage?.theme_id ?? null} currentLanguage={userPage?.language ?? 'en'} />

      {pageId !== undefined && userPage && themes.length > 0 && (
        <ThemeSwitcher pageId={pageId} currentThemeId={userPage.theme_id ?? null} themes={themes} quick nudge />
      )}

      {pageId !== undefined && userPage && (
        <div className="dash-topnav-actions">
          {themes.length > 0 && (
            <ThemeSwitcher
              pageId={pageId}
              currentThemeId={userPage.theme_id ?? null}
              themes={themes}
              label={d.topnav.theme}
              nudge
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
          title={fill(d.topnav.opensYourPageInA, { hint: pageState.hint })}
        >
          <span className="dash-page-status-dot" aria-hidden="true" />
          <span className="dash-page-status-label">{pageState.label}</span>
          <span className="dash-page-status-url">{shortUrl}</span>
          <ArrowTopRightOnSquareIcon aria-hidden="true" />
        </a>
      )}

      {shareChoices && (
        <div className="dash-topnav-actions">
          <ShareMenu choices={shareChoices} tip={setup?.some((s) => s.id === 'share' && !s.done) ?? false} />
        </div>
      )}

      <UserMenu
        // Email sign-ups no longer give a name; show the email's first part.
        name={session?.user?.name?.trim() || session?.user?.email?.split('@')[0] || 'Guest'}
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

// The page's status as guests see it. Pages go live when they're created
// (a draft first, until the account's email is verified); the owner can
// take one offline (deactivate) and MyGala can suspend one.
function pageStateOf(status: string | undefined, t: DashText['pageState']): { kind: 'live' | 'off' | 'suspended'; label: string; hint: string } {
  if (status === 'draft') return { kind: 'off', label: t.draft, hint: t.draftHint };
  if (status === 'suspended') return { kind: 'suspended', label: t.suspended, hint: t.suspendedHint };
  if (status === 'inactive') return { kind: 'off', label: t.offline, hint: t.offlineHint };
  return { kind: 'live', label: t.live, hint: t.liveHint };
}
