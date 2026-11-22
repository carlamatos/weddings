import { sql } from '@vercel/postgres';
import { GOAL_ADMIN_LABELS, PURPOSE_ADMIN_LABELS, isPagePurpose } from './event-goals';
import { sendMailBatch, wrap, button, escHtml } from './mail';
import { siteUrl } from './site-url';

// Emails for the super admins (SUPER_ADMIN_EMAILS). Server-only (no 'use
// server'). Not one per new page (most are never used): instead
// - "A page is active": the first time a guest replies on a page — an RSVP,
//   or joining the Secret Santa from its form (notifyAdminsPageActive);
// - "Published today": once a day, the pages that went live that day, with
//   their links (sendPublishedPagesDigest, from the daily cron).
// Pages owned by a super admin are left out of both.

export function superAdminEmails(): string[] {
  return [...new Set((process.env.SUPER_ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean))];
}

// When the page's first guest reply was emailed to the admins (or found to
// be long past, for pages that were already in use before this email).
export const ACTIVE_NOTIFIED_SETTING = 'admin_active_notified_at';

const TZ = 'America/Vancouver';

type PageRow = {
  id: number;
  heading: string | null;
  slug: string;
  goal: string | null;
  purpose?: string | null;
  event_date: string | null;
  owner_name: string | null;
  owner_email: string | null;
};

const pageUrl = (slug: string) => `${siteUrl()}/${encodeURIComponent(slug)}`;
const link = (url: string) => `<a href="${url}" style="color: #B6584A;">${escHtml(url.replace(/^https?:\/\//, ''))}</a>`;

// Called after a guest's RSVP or Secret Santa sign-up is saved. Sends at
// most once per page (the setting is claimed first), never for the host's
// own test reply, and never throws: it must not break the guest's reply.
export async function notifyAdminsPageActive(
  pageId: number | string,
  reply: { kind: 'rsvp' | 'secret-santa'; name: string; email: string },
): Promise<void> {
  const admins = superAdminEmails();
  if (!admins.length) return;
  try {
    const res = await sql<PageRow & { replies: number; santas: number }>`
      SELECT up.id, up.heading, up.slug, up.event_date::text AS event_date,
             (SELECT setting_value FROM user_page_settings s WHERE s.user_page_id = up.id AND s.setting_name = 'event_goal') AS goal,
             (SELECT setting_value FROM user_page_settings s WHERE s.user_page_id = up.id AND s.setting_name = 'page_purpose') AS purpose,
             u.name AS owner_name, u.email AS owner_email,
             (SELECT COUNT(*)::int FROM event_guests g WHERE g.user_page_id = up.id AND g.responded_at IS NOT NULL
                AND lower(COALESCE(g.email, '')) <> lower(COALESCE(u.email, ''))) AS replies,
             (SELECT COUNT(*)::int FROM page_gift_exchange x WHERE x.user_page_id = up.id
                AND lower(COALESCE(x.email, '')) <> lower(COALESCE(u.email, ''))) AS santas
      FROM user_page up LEFT JOIN users u ON u.id = up.user_id
      WHERE up.id = ${pageId}
    `;
    const page = res.rows[0];
    if (!page) return;
    const owner = (page.owner_email ?? '').toLowerCase();
    if (owner && reply.email.trim().toLowerCase() === owner) return; // the host trying their own form
    if (owner && admins.includes(owner)) return;

    // Claim it (once per page). A page that already had several replies
    // before this email existed is marked without sending.
    const claimed = await sql`
      INSERT INTO user_page_settings (user_page_id, setting_name, setting_value)
      VALUES (${page.id}, ${ACTIVE_NOTIFIED_SETTING}, ${new Date().toISOString()})
      ON CONFLICT (user_page_id, setting_name) DO NOTHING
      RETURNING setting_value
    `;
    if (!claimed.rows[0]) return;
    if (page.replies > 1 || page.santas > 1) return;

    const title = page.heading || page.slug;
    const what = reply.kind === 'rsvp' ? 'replied to the RSVP' : 'joined the Secret Santa';
    const url = pageUrl(page.slug);
    const html = wrap(`
      <h2 style="margin: 0 0 16px; font-size: 20px;">A page is active: ${escHtml(title)} 🎉</h2>
      <p style="margin: 0 0 16px; line-height: 1.6;">The page has been shared: <strong>${escHtml(reply.name || 'A guest')}</strong> just ${what}, the first guest to do so.</p>
      <table style="border-collapse: collapse; width: 100%; margin: 0 0 24px;">
        ${row('Page', link(url))}
        ${row('Planning', page.goal ? escHtml(GOAL_ADMIN_LABELS[page.goal] ?? page.goal) : null)}
        ${row('Making', isPagePurpose(page.purpose) ? escHtml(PURPOSE_ADMIN_LABELS[page.purpose]) : null)}
        ${row('Date', page.event_date ? escHtml(page.event_date.slice(0, 10)) : null)}
        ${row('Host', `${escHtml(page.owner_name || '—')}${page.owner_email ? `<br /><a href="mailto:${escHtml(page.owner_email)}" style="color: #B6584A;">${escHtml(page.owner_email)}</a>` : ''}`)}
      </table>
      ${button(`${siteUrl()}/admin/pages?q=${encodeURIComponent(page.slug)}`, 'Open in admin')}
      <p style="margin: 24px 0 0; font-size: 13px; color: #9A8F8C;">Sent to MyGala super admins once per page, at its first guest reply.</p>
    `);
    await sendMailBatch(admins.map((to) => ({ to, subject: `A page is active: ${title}`, html, ...(page.owner_email ? { replyTo: page.owner_email } : {}) })));
  } catch (error) {
    console.error('Failed to notify admins of an active page:', error);
  }
}

// The Pacific day that just ended (the cron runs just before midnight
// Pacific; an hour back keeps the same day in summer time too).
function reportDay(now = new Date()): string {
  return new Date(now.getTime() - 60 * 60 * 1000).toLocaleDateString('en-CA', { timeZone: TZ });
}

// Once a day: the pages that went live that day (made live, or published
// from a draft), and the pages that got their first guest reply. Sent even
// when there are none, so a quiet day is still reported.
export async function sendPublishedPagesDigest(now = new Date()): Promise<{ day: string; published: number; active: number; sent: boolean }> {
  const day = reportDay(now);
  const admins = superAdminEmails();
  const adminList = admins.join(','); // emails can't contain commas
  // user_page.created_at is a UTC time without a zone; status_changed_at has one.
  const published = await sql<PageRow & { plan_type: string | null; was_draft: boolean }>`
    SELECT up.id, up.heading, up.slug, up.event_date::text AS event_date, up.plan_type,
           (up.status_changed_at IS NOT NULL) AS was_draft,
           (SELECT setting_value FROM user_page_settings s WHERE s.user_page_id = up.id AND s.setting_name = 'event_goal') AS goal,
           u.name AS owner_name, u.email AS owner_email
    FROM user_page up LEFT JOIN users u ON u.id = up.user_id
    WHERE up.status = 'active'
      AND (COALESCE(up.status_changed_at, up.created_at AT TIME ZONE 'UTC') AT TIME ZONE ${TZ})::date = ${day}::date
      AND NOT (lower(COALESCE(u.email, '')) = ANY(string_to_array(${adminList}, ',')))
    ORDER BY COALESCE(up.status_changed_at, up.created_at AT TIME ZONE 'UTC')
  `;
  const active = await sql<PageRow>`
    SELECT up.id, up.heading, up.slug, up.event_date::text AS event_date,
           (SELECT setting_value FROM user_page_settings s2 WHERE s2.user_page_id = up.id AND s2.setting_name = 'event_goal') AS goal,
           u.name AS owner_name, u.email AS owner_email
    FROM user_page_settings s
    JOIN user_page up ON up.id = s.user_page_id
    LEFT JOIN users u ON u.id = up.user_id
    WHERE s.setting_name = ${ACTIVE_NOTIFIED_SETTING}
      AND (s.setting_value::timestamptz AT TIME ZONE ${TZ})::date = ${day}::date
      AND NOT (lower(COALESCE(u.email, '')) = ANY(string_to_array(${adminList}, ',')))
  `;
  if (!admins.length) return { day, published: published.rows.length, active: active.rows.length, sent: false };

  const nice = new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const item = (p: PageRow, extra = '') => `
    <li style="margin: 0 0 12px; line-height: 1.5;">
      <strong>${escHtml(p.heading || p.slug)}</strong>${p.goal ? ` · ${escHtml(GOAL_ADMIN_LABELS[p.goal] ?? p.goal)}` : ''}${extra}<br />
      ${link(pageUrl(p.slug))}<br />
      <span style="color: #6B6470; font-size: 13px;">${escHtml(p.owner_name || '—')}${p.owner_email ? ` · ${escHtml(p.owner_email)}` : ''}</span>
    </li>`;
  const n = published.rows.length;
  const html = wrap(`
    <h2 style="margin: 0 0 8px; font-size: 20px;">${n} ${n === 1 ? 'page' : 'pages'} published today</h2>
    <p style="margin: 0 0 20px; color: #6B6470;">${escHtml(nice)} (Pacific time)</p>
    ${n ? `<ol style="padding-left: 20px; margin: 0 0 24px;">${published.rows.map((p) => item(p, p.was_draft ? ' · <em>published from a draft</em>' : p.plan_type === 'paid' ? ' · Live Party' : '')).join('')}</ol>`
      : '<p style="margin: 0 0 24px;">No pages went live today.</p>'}
    <h3 style="margin: 0 0 8px; font-size: 16px;">First guest replies today: ${active.rows.length}</h3>
    ${active.rows.length ? `<ol style="padding-left: 20px; margin: 0 0 24px;">${active.rows.map((p) => item(p)).join('')}</ol>`
      : '<p style="margin: 0 0 24px; color: #6B6470;">None today.</p>'}
    ${button(`${siteUrl()}/admin/activity`, 'Open Activity in admin')}
    <p style="margin: 24px 0 0; font-size: 13px; color: #9A8F8C;">Sent to MyGala super admins every evening. Pages owned by super admins are left out.</p>
  `);
  await sendMailBatch(admins.map((to) => ({ to, subject: `MyGala today: ${n} ${n === 1 ? 'page' : 'pages'} published`, html })));
  return { day, published: n, active: active.rows.length, sent: true };
}

function row(label: string, value: string | null | undefined): string {
  return value ? `
    <tr>
      <td style="padding: 9px 0; border-bottom: 1px solid #EDE8E3; font-weight: 600; width: 110px; vertical-align: top;">${label}</td>
      <td style="padding: 9px 0; border-bottom: 1px solid #EDE8E3;">${value}</td>
    </tr>` : '';
}
