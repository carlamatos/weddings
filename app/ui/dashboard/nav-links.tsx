'use client';

import {
  DocumentIcon, GiftTopIcon, UsersIcon, ClipboardDocumentListIcon, GlobeAltIcon, PhotoIcon, MusicalNoteIcon,
  CalendarDaysIcon, ShareIcon, BellAlertIcon, RectangleStackIcon, TrophyIcon, GiftIcon, VideoCameraIcon,
  Squares2X2Icon, LockClosedIcon, CakeIcon, EnvelopeIcon, ChevronRightIcon, UserGroupIcon, QuestionMarkCircleIcon, TvIcon, BanknotesIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { PLUS_FEATURES } from '@/app/lib/plus-features';
import { FREE_GUEST_PHOTO_LIMIT } from '@/app/lib/guest-photos';
import type { SetupStep } from '@/app/lib/setup-progress';
import { openProfile } from './user-menu';
import { OPEN_PARAM } from '@/app/ui/themes/open-editor';
import { siteHref } from '@/app/lib/app-url';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import type { DashText } from '@/app/lib/dash-text/en';
import { fill } from '@/app/lib/dash-text/fill';
type NavItem = { name: keyof DashText['screens']; section: string; icon: typeof DocumentIcon };

// Grouped by what the host is doing: building the page, looking after the
// guests, running the day itself, planning (budget and timeline), and the
// page's settings. On a free page,
// Plus sections (PLUS_FEATURES) carry a small gold sparkle — or, when a
// whole group is Plus, the group's heading carries one "Plus" mark instead.
// They open and can be set up fully, and ask for Plus only when they're
// turned on for guests.
const GROUPS: { title: keyof DashText['navGroups']; links: NavItem[] }[] = [
  {
    title: 'page',
    links: [
      { name: 'editEventPage', section: '', icon: DocumentIcon },
      { name: 'eventProgram', section: '/event-program', icon: CalendarDaysIcon },
      { name: 'customSections', section: '/custom-sections', icon: RectangleStackIcon },
      { name: 'registry', section: '/registry', icon: GiftIcon },
      { name: 'sponsors', section: '/sponsors', icon: TrophyIcon },
    ],
  },
  {
    title: 'guests',
    links: [
      { name: 'guestList', section: '/guest-list', icon: ClipboardDocumentListIcon },
      { name: 'rsvp', section: '/rsvp', icon: UsersIcon },
      { name: 'invitations', section: '/invitations', icon: EnvelopeIcon },
      { name: 'reminders', section: '/reminders', icon: BellAlertIcon },
      { name: 'share', section: '/share', icon: ShareIcon },
    ],
  },
  {
    title: 'onTheDay',
    links: [
      { name: 'guestPhotos', section: '/guest-photos', icon: PhotoIcon },
      { name: 'photoSlideshow', section: '/slideshow', icon: TvIcon },
      { name: 'findYourTable', section: '/seating', icon: UserGroupIcon },
      { name: 'songRequests', section: '/song-requests', icon: MusicalNoteIcon },
      { name: 'liveStream', section: '/livestream', icon: VideoCameraIcon },
      { name: 'potluck', section: '/potluck', icon: CakeIcon },
      { name: 'giftExchange', section: '/gift-exchange', icon: GiftTopIcon },
    ],
  },
  {
    title: 'planning',
    links: [
      { name: 'budget', section: '/budget', icon: BanknotesIcon },
      { name: 'timeline', section: '/timeline', icon: ClockIcon },
    ],
  },
  {
    title: 'settings',
    links: [
      { name: 'domain', section: '/domain', icon: GlobeAltIcon },
      { name: 'password', section: '/password', icon: LockClosedIcon },
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
  const d = useDashText();
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
        title={plus ? fill(d.navLinks.plusSetItUpNow, { name: d.screens[link.name] }) : on ? fill(d.navLinks.isOnYourPage, { name: d.screens[link.name] }) : undefined}
      >
        <Icon />
        {d.screens[link.name]}
        {on ? <span className="dash-nav-tag dash-nav-tag--on">{d.navLinks.on}</span>
          : plus && !groupIsPlus ? <SparklesIcon className="dash-nav-sparkle" aria-label="Plus" />
          : freeHook ? <span className="dash-nav-tag dash-nav-tag--free">{FREE_GUEST_PHOTO_LIMIT} {d.navLinks.free}</span>
          : null}
      </Link>
    );
  };

  return (
    <>
      <Link href="/dashboard" className={`dash-nav-link${pathname === '/dashboard' ? ' dash-nav-link--active' : ''}`}>
        <Squares2X2Icon />
        {d.navLinks.eventPages}
      </Link>
      {pageId !== undefined && (
        <p className="dash-nav-event" title={pageName}>{pageName || d.navLinks.untitledEvent}</p>
      )}
      {pageId !== undefined && setup && <SetupChecklist steps={setup} base={base} />}
      {pageId !== undefined && GROUPS.map((group) => {
        const groupIsPlus = group.links.every(isPlus);
        return (
          <div className="dash-nav-section" key={group.title}>
            <p className="dash-nav-group">
              {d.navGroups[group.title]}
              {groupIsPlus && <span className="dash-nav-group-plus"><SparklesIcon aria-hidden="true" />Plus</span>}
            </p>
            {group.links.map((link) => item(link, groupIsPlus))}
          </div>
        );
      })}
      {/* Every screen's how-to guides (/help), in a new tab. */}
      <a href={siteHref('/help')} target="_blank" rel="noopener" className="dash-nav-link dash-nav-help">
        <QuestionMarkCircleIcon />
        {d.navLinks.helpCentre}
      </a>
    </>
  );
}

// The screen where a step is done; editor steps also open their popup.
function stepHref(s: SetupStep, base: string) {
  return `${base}${s.section}${s.open ? `?${OPEN_PARAM}=${s.open}` : ''}`;
}

function stepBody(s: SetupStep, d: DashText) {
  return (
    <>
      {s.done ? <CheckCircleIcon aria-hidden="true" /> : <span className="dash-setup-dot" aria-hidden="true" />}
      <span>{s.label}</span>
      <span className="sr-only">{s.done ? d.setupSteps.done : d.setupSteps.toDo}</span>
    </>
  );
}

// "Your page is 3/5 ready", a progress bar and the next step; the full list
// opens below. Gone once every step is done.
function SetupChecklist({ steps, base }: { steps: SetupStep[]; base: string }) {
  const d = useDashText();
  const [open, setOpen] = useState(false);
  const done = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);
  if (!next) return null;
  return (
    <div className="dash-setup">
      <p className="dash-setup-title">{fill(d.navLinks.yourPageIsReady, { done, length: steps.length })}</p>
      <div className="dash-setup-bar" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={done} aria-label={d.navLinks.pageSetup}>
        <span style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      {next.action === 'profile' ? (
        <button type="button" className="dash-setup-next" onClick={openProfile}>
          <span>{fill(d.navLinks.next, { label: next.label })}</span>
          <ChevronRightIcon />
        </button>
      ) : (
        <Link href={stepHref(next, base)} className="dash-setup-next">
          <span>{fill(d.navLinks.next, { label: next.label })}</span>
          <ChevronRightIcon />
        </Link>
      )}
      <button
        type="button"
        className="dash-setup-toggle"
        aria-expanded={open}
        // The mobile drawer closes on any click inside the menu.
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >
        {open ? d.navLinks.hideSteps : d.navLinks.seeAllSteps}
      </button>
      {open && (
        <ul className="dash-setup-list">
          {steps.map((s) => (
            <li key={s.label} className={s.done ? 'is-done' : undefined}>
              {s.action === 'profile' ? (
                <button type="button" onClick={openProfile}>{stepBody(s, d)}</button>
              ) : (
                <Link href={stepHref(s, base)}>{stepBody(s, d)}</Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
