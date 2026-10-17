'use client';

import {
  DocumentIcon, GiftTopIcon, UsersIcon, ClipboardDocumentListIcon, GlobeAltIcon, PhotoIcon, MusicalNoteIcon,
  CalendarDaysIcon, ShareIcon, BellAlertIcon, RectangleStackIcon, TrophyIcon, GiftIcon, VideoCameraIcon,
  Squares2X2Icon, LockClosedIcon, CakeIcon, EnvelopeIcon, ChevronRightIcon, UserGroupIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { PLUS_FEATURES } from '@/app/lib/plus-features';
import { FREE_GUEST_PHOTO_LIMIT } from '@/app/lib/guest-photos';
import type { SetupStep } from '@/app/lib/setup-progress';

type NavItem = { name: string; section: string; icon: typeof DocumentIcon };

// Grouped by what the host is doing: building the page, looking after the
// guests, running the day itself, and the page's settings. On a free page,
// Plus sections (PLUS_FEATURES) carry a small gold sparkle — or, when a
// whole group is Plus, the group's heading carries one "Plus" mark instead.
// They open and can be set up fully, and ask for Plus only when they're
// turned on for guests.
const GROUPS: { title: string; links: NavItem[] }[] = [
  {
    title: 'Page',
    links: [
      { name: 'Edit Event Page', section: '', icon: DocumentIcon },
      { name: 'Event Program', section: '/event-program', icon: CalendarDaysIcon },
      { name: 'Custom Sections', section: '/custom-sections', icon: RectangleStackIcon },
      { name: 'Registry', section: '/registry', icon: GiftIcon },
      { name: 'Sponsors', section: '/sponsors', icon: TrophyIcon },
    ],
  },
  {
    title: 'Guests',
    links: [
      { name: 'Guest List', section: '/guest-list', icon: ClipboardDocumentListIcon },
      { name: 'RSVP', section: '/rsvp', icon: UsersIcon },
      { name: 'Invitations', section: '/invitations', icon: EnvelopeIcon },
      { name: 'Reminders', section: '/reminders', icon: BellAlertIcon },
      { name: 'Share', section: '/share', icon: ShareIcon },
    ],
  },
  {
    title: 'On the day',
    links: [
      { name: 'Guest Photos', section: '/guest-photos', icon: PhotoIcon },
      { name: 'Find Your Table', section: '/seating', icon: UserGroupIcon },
      { name: 'Song Requests', section: '/song-requests', icon: MusicalNoteIcon },
      { name: 'Live Stream', section: '/livestream', icon: VideoCameraIcon },
      { name: 'Potluck', section: '/potluck', icon: CakeIcon },
      { name: 'Gift Exchange', section: '/gift-exchange', icon: GiftTopIcon },
    ],
  },
  {
    title: 'Settings',
    links: [
      { name: 'Domain', section: '/domain', icon: GlobeAltIcon },
      { name: 'Password', section: '/password', icon: LockClosedIcon },
    ],
  },
];

// "Event pages" (the dashboard landing) is always there; the per-page links
// appear when a page is selected (pageId set), under that event's name, and
// point at that page.
// status: whether each section is live on the page for guests
// (app/lib/section-status.ts), shown as "On" beside it.
// setup: the page's setup checklist (app/lib/setup-progress.ts).
export default function NavLinks({
  pageId, pageName, isPaid, status, setup,
}: {
  pageId?: number;
  pageName?: string;
  isPaid?: boolean;
  status?: Record<string, boolean>;
  setup?: SetupStep[];
}) {
  const pathname = usePathname();
  const base = `/dashboard/pages/${pageId}`;

  const isPlus = (link: NavItem) => !isPaid && link.section in PLUS_FEATURES;

  const item = (link: NavItem, groupIsPlus: boolean) => {
    const Icon = link.icon;
    const href = `${base}${link.section}`;
    const plus = isPlus(link);
    const on = !!status?.[link.section];
    // Guest Photos is free up to a limit: say so on free pages.
    const freeHook = !isPaid && link.section === '/guest-photos' && !on;
    return (
      <Link
        key={link.name}
        href={href}
        className={`dash-nav-link${pathname === href ? ' dash-nav-link--active' : ''}`}
        title={plus ? `${link.name} (Plus): set it up now; it goes live with Plus` : on ? `${link.name} is on your page` : undefined}
      >
        <Icon />
        {link.name}
        {on ? <span className="dash-nav-tag dash-nav-tag--on">On</span>
          : plus && !groupIsPlus ? <SparklesIcon className="dash-nav-sparkle" aria-label="Plus" />
          : freeHook ? <span className="dash-nav-tag dash-nav-tag--free">{FREE_GUEST_PHOTO_LIMIT} free</span>
          : null}
      </Link>
    );
  };

  return (
    <>
      <Link href="/dashboard" className={`dash-nav-link${pathname === '/dashboard' ? ' dash-nav-link--active' : ''}`}>
        <Squares2X2Icon />
        Event pages
      </Link>
      {pageId !== undefined && (
        <p className="dash-nav-event" title={pageName}>{pageName || 'Untitled event'}</p>
      )}
      {pageId !== undefined && setup && <SetupChecklist steps={setup} base={base} />}
      {pageId !== undefined && GROUPS.map((group) => {
        const groupIsPlus = group.links.every(isPlus);
        return (
          <div className="dash-nav-section" key={group.title}>
            <p className="dash-nav-group">
              {group.title}
              {groupIsPlus && <span className="dash-nav-group-plus"><SparklesIcon aria-hidden="true" />Plus</span>}
            </p>
            {group.links.map((link) => item(link, groupIsPlus))}
          </div>
        );
      })}
    </>
  );
}

// "Your page is 3/5 ready", a progress bar and the next step; the full list
// opens below. Gone once every step is done.
function SetupChecklist({ steps, base }: { steps: SetupStep[]; base: string }) {
  const [open, setOpen] = useState(false);
  const done = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);
  if (!next) return null;
  return (
    <div className="dash-setup">
      <p className="dash-setup-title">Your page is {done}/{steps.length} ready</p>
      <div className="dash-setup-bar" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={done} aria-label="Page setup">
        <span style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      <Link href={`${base}${next.section}`} className="dash-setup-next">
        <span>Next: {next.label}</span>
        <ChevronRightIcon />
      </Link>
      <button
        type="button"
        className="dash-setup-toggle"
        aria-expanded={open}
        // The mobile drawer closes on any click inside the menu.
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >
        {open ? 'Hide steps' : 'See all steps'}
      </button>
      {open && (
        <ul className="dash-setup-list">
          {steps.map((s) => (
            <li key={s.label} className={s.done ? 'is-done' : undefined}>
              <Link href={`${base}${s.section}`}>
                {s.done ? <CheckCircleIcon aria-hidden="true" /> : <span className="dash-setup-dot" aria-hidden="true" />}
                <span>{s.label}</span>
                <span className="sr-only">{s.done ? ' (done)' : ' (to do)'}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
