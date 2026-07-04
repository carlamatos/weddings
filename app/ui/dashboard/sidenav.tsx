import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut, auth } from '@/auth';
import { fetchUserPageById } from '@/app/lib/data';

export default async function SideNav() {
  const session = await auth();
  const userId = session?.user?.id;
  const userPage = userId ? await fetchUserPageById(userId) : undefined;
  const hasPage = userPage !== undefined;
  const isPaid = userPage?.plan_type === 'paid';

  return (
    <aside className="dash-sidebar">
      <Link href="/" className="dash-sidebar-logo">
        <span className="dash-sidebar-wordmark">
          My<span className="accent">Gala</span>
        </span>
      </Link>

      <nav className="dash-sidebar-nav">
        <NavLinks hasPage={hasPage} isPaid={isPaid} />
      </nav>

      <div className="dash-sidebar-footer">
        <form action={async () => { 'use server'; await signOut(); }}>
          <button className="dash-signout-btn" type="submit">
            <PowerIcon />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
