import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { auth } from '@/auth';
import { fetchEventThemes, fetchPageSettings, isSectionOn } from '@/app/lib/data';
import { isPagePaidAndLive } from '@/app/lib/plans';
import type { UserPage } from '@/app/lib/definitions';
import ThemeSwitcher from './theme-switcher';
import LanguageSwitcher from './language-switcher';
import UserMenu from './user-menu';
import MobileMenu from './MobileMenu';
import ShareMenu, { type ShareChoice } from './share-menu';
import { shareTipFor, type SetupStep } from '@/app/lib/setup-progress';
import { publicPageUrl } from '@/app/lib/share';
import { pagePath } from '@/app/lib/dashboard';
import { siteHref } from '@/app/lib/app-url';
import { shareLockOf } from '@/app/lib/page-status';
import { isSaveTheDateTime, saveTheDateUrl } from '@/app/lib/save-the-date';

import { getDashText } from '@/app/lib/dash-text/server';
import type { DashText } from '@/app/lib/dash-text/en';
import { fill } from '@/app/lib/dash-text/fill';
export default async function TopNav({ page: userPage, status, setup }: { page?: UserPage; status?: Record<string, boolean>; setup?: SetupStep[] }) {
  const d = await getDashText();
  const session = await auth();
  const pageId = userPage ? Number(userPage.id) : undefined;
  const [themes, settings] = await Promise.all([fetchEventThemes(), pageId !== undefined ? fetchPageSettings(pageId) : Promise.resolve({} as Record<string, string>)]);

  const isPaid = !!userPage && isPagePaidAndLive(userPage);
  const previewHref = userPage
    ? (isPaid && userPage.custom_domain && userPage.domain_status === 'active' ? `https://${userPage.custom_domain}` : siteHref(`/${userPage.slug}`))
    : undefined;
  const pageUrl = userPage ? publicPageUrl(userPage) : '';
  const title = userPage?.heading || 'MyGala';
  // One Share button: the page, or straight to its RSVP form (unless the
  // host hid the RSVP). Months before the event, the save-the-date
  // (app/lib/save-the-date.ts) comes first, and opens selected. A draft
  // shows how to publish instead of the link (lock).
  const lock = shareLockOf(userPage?.status, !!session?.user?.verifiedEmail);
  const invitePath = userPage ? pagePath(userPage.id, '/invitations') : '';
  const shareChoices: ShareChoice[] | undefined = userPage
    ? [
        ...!isSaveTheDateTime(userPage) ? [] : [{ tab: d.topnav.saveTheDate, target: { url: saveTheDateUrl(userPage), title: `${d.topnav.saveTheDate}: ${title}`, heading: d.topnav.shareYourSaveTheDate, sharePageHref: invitePath, pageId: Number(userPage.id), lock, message: fill(d.quickShare.saveTheDateMessage, { title, url: saveTheDateUrl(userPage) }) } }],
        { tab: d.topnav.yourPage, target: { url: pageUrl, title, heading: d.topnav.shareYourPage, sharePageHref: invitePath, pageId: Number(userPage.id), lock } },
        ...!isSectionOn(settings, 'show_rsvp') ? [] : [{ tab: d.topnav.rsvpForm, target: { url: `${pageUrl}#rsvp`, title: `RSVP — ${title}`, heading: d.topnav.shareYourRsvpForm, sharePageHref: invitePath, pageId: Number(userPage.id), lock } }],
      ]
    : undefined;
  // Whether guests can see the page, with its address beside it.
  const pageState = userPage ? pageStateOf(userPage.status, d.pageState) : undefined;
  const shortUrl = pageUrl.replace(/^https?:\/\//, '');
  // "Your page is ready to share", after the Themes tip (share-tip.tsx).
  const shareTip = userPage && setup ? shareTipFor(userPage, setup) : { show: false, daysToGo: null };

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
          <ShareMenu choices={shareChoices} pageId={pageId} tip={shareTip} />
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
          shareTip,
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
