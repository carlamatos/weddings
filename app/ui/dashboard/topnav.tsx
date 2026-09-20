import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { auth } from '@/auth';
import { fetchEventThemes } from '@/app/lib/data';
import type { UserPage } from '@/app/lib/definitions';
import ThemeSwitcher from './theme-switcher';
import LanguageSwitcher from './language-switcher';
import UpgradeButton from './upgrade-button';
import UserMenu from './user-menu';
import MobileMenu from './MobileMenu';

export default async function TopNav({ page: userPage }: { page?: UserPage }) {
  const session = await auth();
  const themes = await fetchEventThemes();
  const pageId = userPage ? Number(userPage.id) : undefined;

  const isPaid = userPage?.plan_type === 'paid';

  return (
    <header className="dash-topnav">
      <MobileMenu pageId={pageId} isPaid={isPaid} themes={themes} currentThemeId={userPage?.theme_id ?? null} currentLanguage={userPage?.language ?? 'en'} />

      {userPage && !isPaid && <UpgradeButton />}
      {pageId !== undefined && userPage && themes.length > 0 && (
        <ThemeSwitcher
          pageId={pageId}
          currentThemeId={userPage.theme_id ?? null}
          themes={themes}
        />
      )}
      {pageId !== undefined && userPage && (
        <LanguageSwitcher pageId={pageId} currentLanguage={userPage.language ?? 'en'} />
      )}

      {userPage && (
        <a
          href={
            isPaid && userPage.custom_domain
              ? `https://${userPage.custom_domain}`
              : `/${userPage.slug}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="dash-preview-link"
        >
          <ArrowTopRightOnSquareIcon />
          Preview<span className="dash-preview-full-text"> page</span>
        </a>
      )}

      <UserMenu name={session?.user?.name || 'Guest'} isPaid={isPaid} />
    </header>
  );
}
