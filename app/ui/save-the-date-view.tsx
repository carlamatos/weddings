import { INVITATION_SETTING, googleFontsHref, normalizeInvitation, withInvitationText, type InvitationDesign } from '@/app/lib/invitation';
import { invitationDetails } from '@/app/lib/invitation-details';
import { calendarEvent, googleCalendarUrl, icsUrl, saveTheDateCopy, saveTheDateUrl } from '@/app/lib/save-the-date';
import { OG_HEIGHT, OG_WIDTH, publicPageUrl, socialCardImageFor } from '@/app/lib/share';
import type { UserPage } from '@/app/lib/definitions';
import { InvitationCard } from '@/app/ui/dashboard/invitation-card';
import PageViewBeacon from '@/app/ui/page-view-beacon';

// The save-the-date guests open (app/lib/save-the-date.ts): the host's
// invitation design worded as a save-the-date (the event's name, the date,
// the city, "Invitation to follow"), then Google Calendar and Apple Calendar
// buttons and a link to the event page. Used by /<slug>/save-the-date and a
// custom domain's /save-the-date. count: send the guest view (not for anyone
// signed in, as on the event page).

export function saveTheDateDesign(page: UserPage, settings: Record<string, string>): InvitationDesign {
  let saved: unknown = null;
  try { saved = JSON.parse(settings[INVITATION_SETTING] ?? 'null'); } catch { saved = null; }
  let design = normalizeInvitation(saved, page.theme_slug, page.language);
  // Their own uploaded invitation has no words to change: the theme's design.
  if (design.layout === 'own') design = normalizeInvitation(null, page.theme_slug, page.language);
  const t = saveTheDateCopy(page.language);
  return { ...design, eyebrow: t.saveTheDate, message: '', closing: t.invitationToFollow, showQr: false };
}

export function SaveTheDateView({ page, settings, count }: { page: UserPage; settings: Record<string, string>; count: boolean }) {
  const t = saveTheDateCopy(page.language);
  const design = saveTheDateDesign(page, settings);
  const full = withInvitationText(invitationDetails(page, null, false), design);
  // The day and the city: the rest comes with the invitation.
  const city = page.location === 'virtual' ? full.venue : [page.city, page.country].filter(Boolean).join(', ');
  const details = { ...full, time: '', venue: '', address: city, rsvpOff: true };
  const event = calendarEvent(page);

  const button: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 18px', borderRadius: 999,
    fontSize: 15, fontWeight: 600, textDecoration: 'none', background: '#fff', color: '#241F2B', border: '1px solid #DDD5CE', minWidth: 190,
  };

  return (
    <main lang={page.language || 'en'} style={{ minHeight: '100vh', background: '#F2EFEC', padding: '32px 16px 48px', fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', boxSizing: 'border-box' }}>
      <link rel="stylesheet" href={googleFontsHref([design.headingFont, design.bodyFont])} />
      {count && <PageViewBeacon pageId={Number(page.id)} />}
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <div style={{ boxShadow: '0 10px 30px rgba(36,31,43,0.14)', borderRadius: 6, overflow: 'hidden' }}>
          <InvitationCard design={design} details={details} />
        </div>

        {event && (
          <section style={{ textAlign: 'center', marginTop: 28 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#241F2B', margin: '0 0 14px' }}>{t.addToCalendar}</h2>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" style={button}>
                <CalendarDot color="#4285F4" />{t.google}
              </a>
              <a href={icsUrl(page)} style={button}>
                <CalendarDot color="#241F2B" />{t.apple}
              </a>
            </div>
          </section>
        )}

        <p style={{ textAlign: 'center', margin: '26px 0 0' }}>
          <a href={publicPageUrl(page)} style={{ color: '#6B6470', fontSize: 14 }}>{t.seePage}</a>
        </p>
      </div>
    </main>
  );
}

function CalendarDot({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke={color} strokeWidth="1.8" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Its link preview: "Save the date: <name>", the date, and the page's
// preview image. Not in search results.
export function saveTheDateMetadata(page: UserPage): import('next').Metadata {
  const t = saveTheDateCopy(page.language);
  const title = t.metaTitle(page.heading || 'MyGala');
  const date = invitationDetails(page).date;
  const description = date ? t.metaDescription(date) : t.invitationToFollow;
  const image = { url: socialCardImageFor(page), width: OG_WIDTH, height: OG_HEIGHT, type: 'image/jpeg', alt: title };
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: false },
    openGraph: { type: 'website', siteName: 'MyGala', title, description, url: saveTheDateUrl(page), images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: image.url, alt: title }] },
  };
}
