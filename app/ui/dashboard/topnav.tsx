import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { auth } from '@/auth';
import { fetchUserPageById, fetchEventThemes } from '@/app/lib/data';
import ThemeSwitcher from './theme-switcher';
import LanguageSwitcher from './language-switcher';
import UpgradeButton from './upgrade-button';
import UserMenu from './user-menu';
import MobileMenu from './MobileMenu';

export default async function TopNav() {
  const session = await auth();
  const userId = session?.user?.id;
  const [userPage, themes] = await Promise.all([
    userId ? fetchUserPageById(userId) : Promise.resolve(undefined),
    fetchEventThemes(),
  ]);

  const isPaid = userPage?.plan_type === 'paid';

  return (
    <header className="dash-topnav">
      <MobileMenu hasPage={!!userPage} themes={themes} currentThemeId={userPage?.theme_id ?? null} currentLanguage={userPage?.language ?? 'en'} />

      {userPage && !isPaid && <UpgradeButton />}
      {userPage && themes.length > 0 && (
        <ThemeSwitcher
          currentThemeId={userPage.theme_id ?? null}
          themes={themes}
        />
      )}
      {userPage && (
        <LanguageSwitcher currentLanguage={userPage.language ?? 'en'} />
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
