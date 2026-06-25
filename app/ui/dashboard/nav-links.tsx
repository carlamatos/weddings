'use client';

import { DocumentIcon, UsersIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { name: 'Edit Page', href: '/dashboard', icon: DocumentIcon },
  { name: 'RSVPs', href: '/dashboard/rsvp', icon: UsersIcon },
  { name: 'Domain', href: '/dashboard/domain', icon: GlobeAltIcon },
];

export default function NavLinks({ hasPage }: { hasPage: boolean }) {
  const pathname = usePathname();
  return (
    <>
      {links
        .filter((link) => link.name === 'Edit Page' ? hasPage : hasPage)
        .map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`dash-nav-link${pathname === link.href ? ' dash-nav-link--active' : ''}`}
            >
              <Icon />
              {link.name}
            </Link>
          );
        })}
    </>
  );
}
