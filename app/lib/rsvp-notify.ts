import { sql } from '@vercel/postgres';
import { sendMail, wrap, button, escHtml } from './mail';
import { siteUrl } from './site-url';
import { COMPANY } from './company';

// Emails the event organizer (the page owner's account address) each time a
// guest sends an RSVP. On by default; turned off on the RSVP screen.
export const RSVP_NOTIFY_SETTING = 'rsvp_notify_owner';

export function isRsvpNotifyOn(settings: Record<string, string>): boolean {
  return settings[RSVP_NOTIFY_SETTING] !== 'false';
}

export type RsvpSubmission = {
  name: string;
  email: string;
  phone: string | null;
  status: 'attending' | 'not_attending';
  guests: number;
  message: string | null;
  updated: boolean; // the guest had already replied or been invited
};

export function rsvpNotificationHtml(pageId: number, heading: string, ownerName: string, r: RsvpSubmission): string {
  const site = siteUrl();
  const attending = r.status === 'attending';
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #EDE8E3; font-weight: 600; width: 120px; vertical-align: top;">${label}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #EDE8E3;">${value}</td>
    </tr>`;
  const reply = attending
    ? `<span style="color: #3D6B46; font-weight: 600;">✓ Attending</span>`
    : `<span style="color: #8B3A2A; font-weight: 600;">✗ Not attending</span>`;
  return wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">${attending ? 'New RSVP: ' : 'RSVP: '}${escHtml(r.name)} ${attending ? 'is coming! 🎉' : 'can’t make it'}</h2>
    <p style="margin: 0 0 16px; line-height: 1.6;">${ownerName ? `Hi ${escHtml(ownerName)},` : 'Hi there,'}</p>
    <p style="margin: 0 0 16px; line-height: 1.6;">${escHtml(r.name)} just ${r.updated ? 'updated their reply' : 'replied'} to
    <strong>${escHtml(heading || 'your event')}</strong>.</p>
    <table style="border-collapse: collapse; width: 100%; margin: 0 0 24px;">
      ${row('Reply', reply)}
      ${attending ? row('Guests', String(r.guests)) : ''}
      ${row('Email', `<a href="mailto:${escHtml(r.email)}" style="color: #B6584A;">${escHtml(r.email)}</a>`)}
      ${r.phone ? row('Phone', escHtml(r.phone)) : ''}
      ${r.message ? row('Message', `<span style="white-space: pre-wrap;">${escHtml(r.message)}</span>`) : ''}
    </table>
    ${button(`${site}/dashboard/pages/${pageId}/rsvp`, 'See all RSVPs')}
    <p style="margin: 24px 0 0; font-size: 13px; color: #9A8F8C; line-height: 1.6;">You get this email because RSVP notifications are on for this page.
    To stop them, untick “Email me when someone RSVPs” on the RSVP screen. Questions? <a href="mailto:${COMPANY.email}" style="color: #9A8F8C;">${COMPANY.email}</a></p>
  `);
}

// Never throws: a mail problem must not fail the guest's RSVP.
export async function notifyOwnerOfRsvp(pageId: number, r: RsvpSubmission): Promise<void> {
  try {
    const res = await sql<{ email: string; given_name: string | null; heading: string | null }>`
      SELECT u.email, u.given_name, up.heading
      FROM user_page up JOIN users u ON u.id = up.user_id
      WHERE up.id = ${pageId}
    `;
    const owner = res.rows[0];
    if (!owner?.email) return;
    const heading = owner.heading ?? '';
    await sendMail({
      to: owner.email,
      subject: `${r.status === 'attending' ? 'New RSVP' : 'RSVP'}: ${r.name} — ${r.status === 'attending' ? `attending${r.guests > 1 ? ` (${r.guests})` : ''}` : 'not attending'}${heading ? ` · ${heading}` : ''}`,
      html: rsvpNotificationHtml(pageId, heading, (owner.given_name ?? '').trim(), r),
    });
  } catch (error) {
    console.error('Failed to send RSVP notification:', error);
  }
}
