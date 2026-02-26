'use client';

import {
  DocumentIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Edit Page', href: '/dashboard', icon: DocumentIcon },
];

export default function NavLinks({ hasPage }: { hasPage: boolean }) {
  const pathname = usePathname();
  return (
    <>
      {links
        .filter((link) => link.name !== 'Edit Page' || hasPage)
        .map((link) => {
          const LinkIcon = link.icon;
          return (
            <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'nav-link sidebar-menu light-sage',
              {
                'nav-link--active': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p>{link.name}</p>
          </Link>
          );
        })}
    </>
  );
}
