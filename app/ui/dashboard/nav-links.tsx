'use client';

import { DocumentIcon, GiftTopIcon, UsersIcon, UserGroupIcon, ClipboardDocumentListIcon, ChevronDownIcon, GlobeAltIcon, PhotoIcon, MusicalNoteIcon, CalendarDaysIcon, ShareIcon, BellAlertIcon, RectangleStackIcon, TrophyIcon, GiftIcon, VideoCameraIcon, Squares2X2Icon, LockClosedIcon, CakeIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, MinusCircleIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type NavItem = { name: string; section: string; icon: typeof DocumentIcon; paidOnly: boolean; greyOutIfFree: boolean };

// Everything about the people coming, grouped under "Guests".
const guestLinks: NavItem[] = [
  { name: 'Guest List', section: '/guest-list', icon: ClipboardDocumentListIcon, paidOnly: false, greyOutIfFree: false },
  { name: 'RSVP', section: '/rsvp', icon: UsersIcon, paidOnly: false, greyOutIfFree: false },
  { name: 'Invitations', section: '/invitations', icon: EnvelopeIcon, paidOnly: false, greyOutIfFree: true },
  { name: 'Guest Photos', section: '/guest-photos', icon: PhotoIcon, paidOnly: false, greyOutIfFree: true },
];

const links: NavItem[] = [
  { name: 'Edit Page', section: '', icon: DocumentIcon, paidOnly: false, greyOutIfFree: false },
  { name: 'Potluck', section: '/potluck', icon: CakeIcon, paidOnly: false, greyOutIfFree: true },
  { name: 'Gift Exchange', section: '/gift-exchange', icon: GiftTopIcon, paidOnly: false, greyOutIfFree: true },
  // Kept visible (not filtered out) for free accounts, but greyed out — clicking still
  // reaches the upgrade prompt on each section's own page.
  { name: 'Domain', section: '/domain', icon: GlobeAltIcon, paidOnly: false, greyOutIfFree: true },
  { name: 'Password', section: '/password', icon: LockClosedIcon, paidOnly: false, greyOutIfFree: true },
  { name: 'Live Stream', section: '/livestream', icon: VideoCameraIcon, paidOnly: false, greyOutIfFree: true },
  { name: 'Song Requests', section: '/song-requests', icon: MusicalNoteIcon, paidOnly: false, greyOutIfFree: true },
  { name: 'Reminders', section: '/reminders', icon: BellAlertIcon, paidOnly: false, greyOutIfFree: true },
  // Free tier now, same as everything else.
  { name: 'Event Program', section: '/event-program', icon: CalendarDaysIcon, paidOnly: false, greyOutIfFree: false },
  { name: 'Custom Sections', section: '/custom-sections', icon: RectangleStackIcon, paidOnly: false, greyOutIfFree: true },
  { name: 'Sponsors', section: '/sponsors', icon: TrophyIcon, paidOnly: false, greyOutIfFree: true },
  { name: 'Registry', section: '/registry', icon: GiftIcon, paidOnly: false, greyOutIfFree: true },
  { name: 'Share', section: '/share', icon: ShareIcon, paidOnly: false, greyOutIfFree: false },
];

// "Event pages" (the dashboard landing) is always there; the per-page links
// appear when a page is selected (pageId set), under that event's name, and
// point at that page.
// status: whether each section is on for this page (app/lib/section-status.ts),
// shown as a small icon beside it.
export default function NavLinks({ pageId, pageName, isPaid, status }: { pageId?: number; pageName?: string; isPaid?: boolean; status?: Record<string, boolean> }) {
  const pathname = usePathname();
  const base = `/dashboard/pages/${pageId}`;
  const guestsActive = pageId !== undefined && guestLinks.some((l) => pathname === `${base}${l.section}`);
  const [guestsOpen, setGuestsOpen] = useState(true);
  const showGuests = guestsOpen || guestsActive;

  const item = (link: NavItem, nested = false) => {
    const Icon = link.icon;
    const href = `${base}${link.section}`;
    const greyedOut = link.greyOutIfFree && !isPaid;
    return (
      <Link
        key={link.name}
        href={href}
        className={`dash-nav-link${nested ? ' dash-nav-link--nested' : ''}${pathname === href ? ' dash-nav-link--active' : ''}`}
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
        {!greyedOut && status && link.section in status && <SectionState on={status[link.section]} name={link.name} />}
      </Link>
    );
  };

  const visible = (link: NavItem) => !link.paidOnly || isPaid;
  const [editPage, ...rest] = links.filter(visible);

  return (
    <>
      <Link href="/dashboard" className={`dash-nav-link${pathname === '/dashboard' ? ' dash-nav-link--active' : ''}`}>
        <Squares2X2Icon />
        Event pages
      </Link>
      {pageId !== undefined && (
        <p className="dash-nav-group" title={pageName}>{pageName || 'Untitled event'}</p>
      )}
      {pageId !== undefined && (
        <>
          {editPage && item(editPage)}
          <button
            type="button"
            className={`dash-nav-link dash-nav-parent${guestsActive ? ' dash-nav-parent--active' : ''}`}
            aria-expanded={showGuests}
            aria-controls="dash-nav-guests"
            // Stays open while one of its screens is showing. stopPropagation:
            // the mobile drawer closes on any click inside the menu.
            onClick={(e) => { e.stopPropagation(); if (!guestsActive) setGuestsOpen((o) => !o); }}
          >
            <UserGroupIcon />
            Guests
            <ChevronDownIcon className="dash-nav-chevron" style={{ marginLeft: 'auto', transform: showGuests ? 'rotate(180deg)' : undefined }} />
          </button>
          {showGuests && (
            <div id="dash-nav-guests" className="dash-nav-children">
              {guestLinks.filter(visible).map((link) => item(link, true))}
            </div>
          )}
          {rest.map((link) => item(link))}
        </>
      )}
    </>
  );
}

function SectionState({ on, name }: { on: boolean; name: string }) {
  const label = on ? `${name} is on` : `${name} is off`;
  const Icon = on ? CheckCircleIcon : MinusCircleIcon;
  return (
    <span className="dash-nav-state" title={label} style={{ marginLeft: 'auto', display: 'inline-flex', color: on ? '#3D6B46' : '#B8B0A8' }}>
      <Icon aria-hidden="true" style={{ width: 16, height: 16 }} />
      <span className="sr-only">{on ? 'On' : 'Off'}</span>
    </span>
  );
}
