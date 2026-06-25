import { UserCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { auth } from '@/auth';
import { fetchUserPageById, fetchEventThemes } from '@/app/lib/data';
import ThemeSwitcher from './theme-switcher';

export default async function TopNav() {
  const session = await auth();
  const userId = session?.user?.id;
  const [userPage, themes] = await Promise.all([
    userId ? fetchUserPageById(userId) : Promise.resolve(undefined),
    fetchEventThemes(),
  ]);

  return (
    <header className="dash-topnav">
      {userPage && themes.length > 0 && (
        <ThemeSwitcher
          currentThemeId={userPage.theme_id ?? null}
          themes={themes}
        />
      )}

      {userPage && (
        <a
          href={`/${userPage.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="dash-preview-link"
        >
          <ArrowTopRightOnSquareIcon />
          Preview page
        </a>
      )}

      <div className="dash-user">
        <UserCircleIcon />
        <span>{session?.user?.name || 'Guest'}</span>
      </div>
    </header>
  );
}
