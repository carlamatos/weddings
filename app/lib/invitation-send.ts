import { sql } from '@vercel/postgres';
import type { UserPage } from './definitions';
import { fetchPageById, fetchPageSettings, isSectionOn } from './data';
import { INVITATION_SETTING, normalizeInvitation, type InvitationDesign, type InvitationDetails } from './invitation';
import { invitationDetails } from './invitation-details';
import { invitationPassword } from './page-password';
import { invitationEmail, saveTheDateEmail } from './invitation-email';
import { ensureInviteColumns, inviteToken, inviteUrl } from './invite-tracking';
import { sendMailBatch, fromName, type MailMessage } from './mail';
import { oneClickUnsubscribeUrl, unsubscribeUrl } from './unsubscribe-token';
import { siteUrl } from './site-url';
import { SUB_EVENTS_SETTING, eventsForGuest, localeOf, parseInvitedEvents, parseSubEvents, subEventWhen, type SubEvent } from './sub-events';
import { isPageOffline } from './page-status';

// Emailing invitations and save-the-dates to the guest list, now (the Send
// button, app/lib/actions.ts) or at a time the host chose (scheduled_sends,
// sent by the hourly cron /api/cron/scheduled-sends). Server only.

export type SendKind = 'invitation' | 'save_the_date';
export const isSendKind = (v: unknown): v is SendKind => v === 'invitation' || v === 'save_the_date';

export const MAX_INVITATION_RECIPIENTS = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type InvitationContext = {
  page: UserPage;
  design: InvitationDesign;
  hostName: string;
  hostEmail: string | null;
  details: InvitationDetails;
  subEvents: SubEvent[];
};

// The page's saved invitation, the host's name and email (for the From name
// and Reply-To), the event details and its sub-events. hostName: the signed-in
// host's name when there is one.
export async function loadInvitationContext(pageOrId: UserPage | number, host?: { name?: string | null; email?: string | null }): Promise<InvitationContext | null> {
  const page = typeof pageOrId === 'number' ? await fetchPageById(pageOrId) : pageOrId;
  if (!page) return null;
  const [settings, user] = await Promise.all([
    fetchPageSettings(Number(page.id)),
    sql<{ name: string | null; email: string | null }>`SELECT name, email FROM users WHERE id = ${page.user_id}`,
  ]);
  let saved: unknown = null;
  try { saved = JSON.parse(settings[INVITATION_SETTING] ?? 'null'); } catch { saved = null; }
  return {
    page,
    design: normalizeInvitation(saved, page.theme_slug, page.language),
    hostName: user.rows[0]?.name?.trim() || host?.name?.trim() || page.heading || 'Your host',
    hostEmail: user.rows[0]?.email ?? host?.email ?? null,
    details: invitationDetails(page, invitationPassword(settings, true).password, isSectionOn(settings, 'show_rsvp')),
    subEvents: parseSubEvents(settings[SUB_EVENTS_SETTING]),
  };
}

// The guest's own events, ready to show (empty when the page has none).
export function guestEventLines(ctx: InvitationContext, invited: unknown) {
  const locale = localeOf(ctx.page.language);
  return eventsForGuest(ctx.subEvents, parseInvitedEvents(invited)).map((e) => ({ name: e.name, when: subEventWhen(e, locale), venue: e.venue }));
}

type Recipient = { id: string; name: string; email: string; invitation_note: string | null; invited_events: unknown };

// One email for one guest (or, without a guest, the generic one).
export function buildEmail(ctx: InvitationContext, kind: SendKind, guest?: Pick<Recipient, 'id' | 'name' | 'invitation_note' | 'invited_events'>, opts: { inviteLink?: string; withTracking?: boolean } = {}) {
  const { page, design, hostName, details } = ctx;
  const withEvents = { ...details, events: guest ? guestEventLines(ctx, guest.invited_events) : guestEventLines(ctx, null) };
  const common = {
    design,
    details: withEvents,
    language: page.language,
    hostName,
    guestName: guest ? guest.name?.trim() || '' : opts.inviteLink ? hostName : '',
    siteBase: siteUrl(),
    ...(guest && opts.withTracking ? { unsubscribeLink: unsubscribeUrl(guest.id) } : {}),
  };
  if (kind === 'save_the_date') return saveTheDateEmail(common);
  return invitationEmail({
    ...common,
    note: guest?.invitation_note,
    inviteLink: opts.inviteLink ?? (guest && opts.withTracking ? inviteUrl(guest.id) : undefined),
    openPixel: guest && opts.withTracking ? `${siteUrl()}/api/i/open?t=${inviteToken(guest.id)}` : undefined,
  });
}

// Emails the chosen guests. Guests without an email, or who unsubscribed
// from this event, are skipped; each address gets one email even if it's on
// the list twice. Records invited_at (or save_the_date_at) for those sent,
// batch by batch (Resend takes 100 at a time), so a failure part-way never
// re-sends to earlier batches.
export async function deliver(ctx: InvitationContext, guestIds: string[], kind: SendKind): Promise<{ sent: number; skipped: number }> {
  await ensureInviteColumns();
  const pageId = Number(ctx.page.id);
  const guests = await sql<Recipient>`
    SELECT DISTINCT ON (lower(g.email)) g.id, g.name, g.email, g.invitation_note, g.invited_events
    FROM event_guests g
    WHERE g.user_page_id = ${pageId}
      AND g.id = ANY(string_to_array(${guestIds.join(',')}, ',')::uuid[])
      AND g.email IS NOT NULL AND NOT g.email_opt_out
    ORDER BY lower(g.email), g.created_at
  `;
  const recipients = guests.rows.filter((g) => EMAIL_RE.test(g.email.trim()));
  const messages: MailMessage[] = recipients.map((g) => {
    const { subject, html } = buildEmail(ctx, kind, g, { withTracking: true });
    return {
      to: g.email.trim(),
      subject,
      html,
      from: fromName(ctx.hostName),
      ...(ctx.hostEmail ? { replyTo: ctx.hostEmail } : {}),
      headers: { 'List-Unsubscribe': `<${oneClickUnsubscribeUrl(g.id)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    };
  });
  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    await sendMailBatch(messages.slice(i, i + 100));
    const batchIds = recipients.slice(i, i + 100).map((g) => g.id).join(',');
    if (kind === 'save_the_date') {
      await sql`UPDATE event_guests SET save_the_date_at = NOW() WHERE user_page_id = ${pageId} AND id = ANY(string_to_array(${batchIds}, ',')::uuid[])`;
    } else {
      await sql`UPDATE event_guests SET invited_at = NOW() WHERE user_page_id = ${pageId} AND id = ANY(string_to_array(${batchIds}, ',')::uuid[])`;
    }
    sent += Math.min(100, recipients.length - i);
  }
  return { sent, skipped: guestIds.length - recipients.length };
}

// ─── Scheduled sends ─────────────────────────────────────

export type ScheduledSend = { id: number; kind: SendKind; guest_count: number; send_at: string; status: string; sent_count: number | null };

export async function fetchScheduledSends(pageId: number): Promise<ScheduledSend[]> {
  await ensureInviteColumns();
  const res = await sql<ScheduledSend>`
    SELECT id, kind, array_length(string_to_array(guest_ids, ','), 1) AS guest_count, send_at, status, sent_count
    FROM scheduled_sends
    WHERE user_page_id = ${pageId} AND (status IN ('pending', 'sending') OR send_at > NOW() - INTERVAL '14 days')
    ORDER BY send_at
  `;
  return res.rows;
}

// Sends what's due (the hourly cron). Each row is claimed first, so two runs
// never send the same one.
export async function sendDueScheduled(): Promise<{ id: number; sent?: number; error?: string }[]> {
  await ensureInviteColumns();
  const due = await sql<{ id: number; user_page_id: number; kind: string; guest_ids: string }>`
    UPDATE scheduled_sends SET status = 'sending'
    WHERE id IN (
      SELECT id FROM scheduled_sends WHERE status = 'pending' AND send_at <= NOW()
      ORDER BY send_at LIMIT 20 FOR UPDATE SKIP LOCKED
    )
    RETURNING id, user_page_id, kind, guest_ids
  `;
  const results: { id: number; sent?: number; error?: string }[] = [];
  for (const row of due.rows) {
    try {
      const ctx = await loadInvitationContext(Number(row.user_page_id));
      if (!ctx || isPageOffline(ctx.page.status)) throw new Error('The page is not published.');
      const ids = row.guest_ids.split(',').filter(Boolean);
      const { sent } = await deliver(ctx, ids, isSendKind(row.kind) ? row.kind : 'invitation');
      await sql`UPDATE scheduled_sends SET status = 'sent', sent_count = ${sent} WHERE id = ${row.id}`;
      results.push({ id: row.id, sent });
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 300) : 'Failed';
      console.error('Scheduled send failed:', row.id, error);
      await sql`UPDATE scheduled_sends SET status = 'failed', error = ${message} WHERE id = ${row.id}`;
      results.push({ id: row.id, error: message });
    }
  }
  return results;
}
