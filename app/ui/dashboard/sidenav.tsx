import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut, auth } from '@/auth';
import { fetchUserPageById } from '@/app/lib/data';
export default async function SideNav() {
  const session = await auth();
  const userId = session?.user?.id;
  const userPage = userId ? await fetchUserPageById(userId) : undefined;
  const hasPage = userPage !== undefined;
  return (
    <div className="flex h-full flex-col px-0 py-0 md:px-0">
      <Link
        className="mb-2 flex h-20 items-end light-sage justify-start p-4 md-h-40"
        href="/"
      >
        <div className="w-32 text-white md-w-40">
          <AcmeLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md-flex-col md-space-x-0 md-space-y-2">
        <NavLinks hasPage={hasPage} />
        <div className="hidden h-auto w-full grow rounded-md light-sage md-block"></div>
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
          <button className="sidenav-signout-btn sidebar-menu light-sage">
            <PowerIcon className="w-6" />
            <div className="hidden md-block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
