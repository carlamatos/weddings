import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';

export default function SideNav({ pageId, isPaid }: { pageId?: number; isPaid?: boolean }) {
  return (
    <aside className="dash-sidebar">
      <Link href="/" className="dash-sidebar-logo">
        <span className="dash-sidebar-wordmark">
          My<span className="accent">Gala</span>
        </span>
      </Link>

      <nav className="dash-sidebar-nav">
        <NavLinks pageId={pageId} isPaid={isPaid} />
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
