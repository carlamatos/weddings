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

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
          key={link.name}
          href={link.href}
          className={clsx(
            'sidebar-menu flex h-[48px] grow items-center justify-center gap-2 light-sage  p-3 text-sm font-medium hover:sage hover:text-black-600 md:flex-none md:justify-start md:p-2 md:px-3',
            {
              'sage text-black-600': pathname === link.href,
            },
          )}
        >
          <LinkIcon className="w-6" />
          <p className="hidden md:block">{link.name}</p>
        </Link>
        );
      })}
    </>
  );
}
