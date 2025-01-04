import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';
export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-0 py-0 md:px-0">
      <Link
        className="mb-2 flex h-20 items-end light-sage justify-start p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40 ">
          <AcmeLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md light-sage md:block"></div>
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
          <button className="flex h-[48px] sidebar-menu w-full grow items-center justify-center gap-2 rounded-md sage p-3 text-sm font-medium md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
