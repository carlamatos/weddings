import { sql } from '@vercel/postgres';
import { sendMailBatch, wrap, button, escHtml } from './mail';
import { siteUrl } from './site-url';

// Lets the super admins (SUPER_ADMIN_EMAILS) know when someone creates a new
// event page. Server-only (no 'use server'), called from createUserPage.

export function superAdminEmails(): string[] {
  return [...new Set((process.env.SUPER_ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean))];
}

type NewPageRow = {
  heading: string | null;
  slug: string;
  event_type: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  theme_name: string | null;
  owner_name: string | null;
  owner_email: string | null;
  owner_provider: string | null;
  owner_since: string | null;
  owner_pages: number;
  total_pages: number;
};

export function newPageAdminHtml(p: NewPageRow, plan: string): string {
  const site = siteUrl();
  const row = (label: string, value: string | null | undefined) => (value ? `
    <tr>
      <td style="padding: 9px 0; border-bottom: 1px solid #EDE8E3; font-weight: 600; width: 130px; vertical-align: top;">${label}</td>
      <td style="padding: 9px 0; border-bottom: 1px solid #EDE8E3;">${value}</td>
    </tr>` : '');
  const when = [p.event_date, p.event_time?.slice(0, 5)].filter(Boolean).join(' at ');
  const pageUrl = `${site}/${encodeURIComponent(p.slug)}`;
  return wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">New event page: ${escHtml(p.heading || p.slug)} 🎉</h2>
    <p style="margin: 0 0 16px; line-height: 1.6;">${escHtml(p.owner_name || 'Someone')} just created a page — that’s page
    <strong>#${p.total_pages}</strong> on MyGala${p.owner_pages > 1 ? ` and their ${ordinal(p.owner_pages)} page` : ''}.</p>
    <table style="border-collapse: collapse; width: 100%; margin: 0 0 24px;">
      ${row('Event', escHtml(p.heading || '—'))}
      ${row('Type', p.event_type ? escHtml(capitalize(p.event_type)) : null)}
      ${row('Date', when ? escHtml(when) : null)}
      ${row('Location', p.location ? escHtml(p.location) : null)}
      ${row('Theme', p.theme_name ? escHtml(p.theme_name) : null)}
      ${row('Plan', escHtml(plan))}
      ${row('Page', `<a href="${pageUrl}" style="color: #B6584A;">${escHtml(pageUrl.replace(/^https?:\/\//, ''))}</a>`)}
      ${row('Owner', `${escHtml(p.owner_name || '—')}${p.owner_email ? `<br /><a href="mailto:${escHtml(p.owner_email)}" style="color: #B6584A;">${escHtml(p.owner_email)}</a>` : ''}`)}
      ${row('Signed up', [p.owner_since, p.owner_provider && p.owner_provider !== 'credentials' ? `with ${capitalize(p.owner_provider)}` : 'with email'].filter(Boolean).map((s) => escHtml(String(s))).join(' '))}
    </table>
    ${button(`${site}/admin/pages?q=${encodeURIComponent(p.slug)}`, 'Open in admin')}
    <p style="margin: 24px 0 0; font-size: 13px; color: #9A8F8C;">Sent to MyGala super admins when a new event page is created.</p>
  `);
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

// Never throws: a mail problem must not break creating the page.
export async function notifyAdminsOfNewPage(pageId: number | string, plan: string): Promise<void> {
  const admins = superAdminEmails();
  if (!admins.length) return;
  try {
    const res = await sql<NewPageRow>`
      SELECT up.heading, up.slug, up.event_type, up.event_date::text AS event_date, up.event_time::text AS event_time,
             COALESCE(NULLIF(up.formatted_address, ''), up.location) AS location, et.name AS theme_name,
             u.name AS owner_name, u.email AS owner_email, u.provider AS owner_provider, u.date::text AS owner_since,
             (SELECT COUNT(*)::int FROM user_page WHERE user_id = up.user_id) AS owner_pages,
             (SELECT COUNT(*)::int FROM user_page) AS total_pages
      FROM user_page up
      LEFT JOIN users u ON u.id = up.user_id
      LEFT JOIN event_themes et ON et.theme_id = up.theme_id
      WHERE up.id = ${pageId}
    `;
    const page = res.rows[0];
    if (!page) return;
    const html = newPageAdminHtml(page, plan);
    const subject = `New event page: ${page.heading || page.slug}${page.owner_name ? ` (by ${page.owner_name})` : ''}`;
    await sendMailBatch(admins.map((to) => ({ to, subject, html, ...(page.owner_email ? { replyTo: page.owner_email } : {}) })));
  } catch (error) {
    console.error('Failed to notify admins of new page:', error);
  }
}
