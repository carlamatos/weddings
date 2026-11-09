import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';
import { siteHref } from '@/app/lib/app-url';
import type { SetupStep } from '@/app/lib/setup-progress';

import { getDashText } from '@/app/lib/dash-text/server';
export default async function SideNav({ pageId, pageName, isPaid, status, setup }: { pageId?: number; pageName?: string; isPaid?: boolean; status?: Record<string, boolean>; setup?: SetupStep[] }) {
  const d = await getDashText();
  return (
    <aside className="dash-sidebar">
      <Link href={siteHref('/')} className="dash-sidebar-logo">
        <span className="dash-sidebar-wordmark">
          My<span className="accent">Gala</span>
        </span>
      </Link>

      <nav className="dash-sidebar-nav">
        <NavLinks pageId={pageId} pageName={pageName} isPaid={isPaid} status={status} setup={setup} />
      </nav>

      <div className="dash-sidebar-footer">
        <form action={async () => { 'use server'; await signOut(); }}>
          <button className="dash-signout-btn" type="submit">
            <PowerIcon />
            {d.sidenav.signOut}
          </button>
        </form>
      </div>
    </aside>
  );
}
