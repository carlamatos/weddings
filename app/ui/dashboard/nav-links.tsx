'use client';

import { DocumentIcon, UsersIcon, GlobeAltIcon, PhotoIcon, MusicalNoteIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { name: 'Edit Page', section: '', icon: DocumentIcon, paidOnly: false, greyOutIfFree: false },
  { name: 'RSVPs', section: '/rsvp', icon: UsersIcon, paidOnly: false, greyOutIfFree: false },
  // Kept visible (not filtered out) for free accounts, but greyed out — clicking still
  // reaches the upgrade prompt on each section's own page.
  { name: 'Domain', section: '/domain', icon: GlobeAltIcon, paidOnly: false, greyOutIfFree: true },
  { name: 'Guest Photos', section: '/guest-photos', icon: PhotoIcon, paidOnly: false, greyOutIfFree: true },
  { name: 'Song Requests', section: '/song-requests', icon: MusicalNoteIcon, paidOnly: false, greyOutIfFree: true },
  // Free tier now, same as everything else.
  { name: 'Event Program', section: '/event-program', icon: CalendarDaysIcon, paidOnly: false, greyOutIfFree: false },
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
          const greyedOut = link.greyOutIfFree && !isPaid;
          return (
            <Link
              key={link.name}
              href={href}
              className={`dash-nav-link${pathname === href ? ' dash-nav-link--active' : ''}`}
              style={greyedOut ? { opacity: 0.45 } : undefined}
              title={greyedOut ? 'Upgrade to Plus to unlock' : undefined}
            >
              <Icon />
              {link.name}
              {greyedOut && (
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: '#B6584A', border: '1px solid #B6584A', borderRadius: 999, padding: '1px 6px' }}>
                  Plus
                </span>
              )}
            </Link>
          );
        })}
    </>
  );
}
