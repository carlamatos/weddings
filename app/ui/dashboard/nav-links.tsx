'use client';

import { DocumentIcon, UsersIcon, GlobeAltIcon, PhotoIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { name: 'Edit Page', section: '', icon: DocumentIcon, paidOnly: false },
  { name: 'RSVPs', section: '/rsvp', icon: UsersIcon, paidOnly: false },
  { name: 'Domain', section: '/domain', icon: GlobeAltIcon, paidOnly: false },
  { name: 'Guest Photos', section: '/guest-photos', icon: PhotoIcon, paidOnly: true },
  { name: 'Song Requests', section: '/song-requests', icon: MusicalNoteIcon, paidOnly: true },
];

// Links only appear when a page is selected (pageId set), and point at that page.
export default function NavLinks({ pageId, isPaid }: { pageId?: number; isPaid?: boolean }) {
  const pathname = usePathname();
  if (pageId === undefined) return null;
  return (
    <>
      {links
        .filter((link) => !link.paidOnly || isPaid)
        .map((link) => {
          const Icon = link.icon;
          const href = `/dashboard/pages/${pageId}${link.section}`;
          return (
            <Link
              key={link.name}
              href={href}
              className={`dash-nav-link${pathname === href ? ' dash-nav-link--active' : ''}`}
            >
              <Icon />
              {link.name}
            </Link>
          );
        })}
    </>
  );
}
