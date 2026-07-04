'use client';

import { DocumentIcon, UsersIcon, GlobeAltIcon, PhotoIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { name: 'Edit Page', href: '/dashboard', icon: DocumentIcon, paidOnly: false },
  { name: 'RSVPs', href: '/dashboard/rsvp', icon: UsersIcon, paidOnly: false },
  { name: 'Domain', href: '/dashboard/domain', icon: GlobeAltIcon, paidOnly: false },
  { name: 'Guest Photos', href: '/dashboard/guest-photos', icon: PhotoIcon, paidOnly: true },
  { name: 'Song Requests', href: '/dashboard/song-requests', icon: MusicalNoteIcon, paidOnly: true },
];

export default function NavLinks({ hasPage, isPaid }: { hasPage: boolean; isPaid?: boolean }) {
  const pathname = usePathname();
  return (
    <>
      {links
        .filter((link) => hasPage && (!link.paidOnly || isPaid))
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
