import { sql as poolSql } from '@vercel/postgres';

// Tagged-template query function: the shared pool by default, or a
// transaction client's .sql (lets the job run inside a rolled-back test).
type Sql = typeof poolSql;
import type { UserPage } from './definitions';
import { sendMailBatch, type MailMessage } from './mail';
import { reminderEmail } from './reminder-email';
import { parseReminderSchedule, reminderSendDate, type ReminderKey } from './reminders';
import { oneClickUnsubscribeUrl, unsubscribeUrl } from './unsubscribe-token';

// Daily job body (app/api/cron/reminders). For each Plus page with reminders
// ticked, sends the reminder whose send date is today — or yesterday, so one
// missed run still catches up. Older missed dates are skipped rather than
// sent late, and at most one reminder goes out per page per run.
//
// Each guest is claimed in event_reminder_deliveries *before* sending, so a
// retry or overlapping run can never email the same guest twice; if the send
// itself fails, the claims are released for the next run.

const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return isoDay(d);
};

type Candidate = UserPage & { reminder_schedule: string; reminder_message: string | null };

export type ReminderRunResult = { page: string; reminder: ReminderKey; sent: number; error?: string };

export function dueReminder(eventDate: string, keys: ReminderKey[], today: string): ReminderKey | null {
  const yesterday = addDays(today, -1);
  const due = keys
    .map((key) => ({ key, on: reminderSendDate(eventDate, key) }))
    .filter(({ on }) => on <= today && on >= yesterday)
    .sort((a, b) => (a.on < b.on ? 1 : -1)); // latest send date = closest to the event
  return due[0]?.key ?? null;
}

export async function sendDueReminders(today = isoDay(new Date()), sql: Sql = poolSql): Promise<ReminderRunResult[]> {
  // The longest lead time is one month, so nothing further out can be due.
  const horizon = addDays(today, 32);
  const pages = await sql<Candidate>`
    SELECT up.*, up.event_date::text AS event_date, up.event_end_date::text AS event_end_date,
           et.slug AS theme_slug, s.setting_value AS reminder_schedule, m.setting_value AS reminder_message
    FROM user_page up
    JOIN user_page_settings s ON s.user_page_id = up.id AND s.setting_name = 'reminder_schedule' AND s.setting_value <> ''
    LEFT JOIN user_page_settings m ON m.user_page_id = up.id AND m.setting_name = 'reminder_message'
    LEFT JOIN event_themes et ON et.theme_id = up.theme_id
    WHERE up.plan_type = 'paid'
      AND (up.plan_expires_at IS NULL OR up.plan_expires_at > NOW())
      AND COALESCE(up.status, 'active') <> 'inactive'
      AND up.event_date > ${today}::date AND up.event_date <= ${horizon}::date
  `;

  const results: ReminderRunResult[] = [];
  for (const page of pages.rows) {
    const key = dueReminder(page.event_date, parseReminderSchedule(page.reminder_schedule), today);
    if (!key) continue;
    results.push(await sendReminderForPage(page, key, sql));
  }
  return results;
}

async function sendReminderForPage(page: Candidate, key: ReminderKey, sql: Sql): Promise<ReminderRunResult> {
  // Subscribed guests who haven't declined and haven't had this reminder for
  // this event date yet; one email per address even if they RSVP'd twice.
  const guests = await sql<{ id: string; name: string; email: string }>`
    SELECT DISTINCT ON (lower(g.email)) g.id, g.name, g.email
    FROM event_guests g
    WHERE g.user_page_id = ${page.id}
      AND g.receive_updates AND g.status <> 'not_attending'
      AND g.email IS NOT NULL AND g.email LIKE '%@%'
      AND NOT EXISTS (
        SELECT 1 FROM event_reminder_deliveries d
        WHERE d.user_page_id = g.user_page_id AND lower(d.email) = lower(g.email)
          AND d.reminder_key = ${key} AND d.event_date = ${page.event_date}::date
      )
    ORDER BY lower(g.email), g.responded_at DESC NULLS LAST
  `;
  if (!guests.rows.length) return { page: page.slug, reminder: key, sent: 0 };

  const claimed = await sql<{ guest_id: string }>`
    INSERT INTO event_reminder_deliveries (user_page_id, guest_id, email, reminder_key, event_date)
    SELECT ${page.id}, g.id, g.email, ${key}, ${page.event_date}::date
    FROM event_guests g WHERE g.id = ANY(string_to_array(${guests.rows.map((g) => g.id).join(',')}, ',')::uuid[])
    ON CONFLICT DO NOTHING
    RETURNING guest_id
  `;
  const claimedIds = new Set(claimed.rows.map((r) => r.guest_id));
  const recipients = guests.rows.filter((g) => claimedIds.has(g.id));

  const messages: MailMessage[] = recipients.map((g) => {
    const unsubscribe = unsubscribeUrl(g.id);
    const { subject, html } = reminderEmail({
      page,
      reminderKey: key,
      message: page.reminder_message ?? undefined,
      guestName: g.name?.trim().split(/\s+/)[0],
      unsubscribeLink: unsubscribe,
    });
    return {
      to: g.email,
      subject,
      html,
      headers: { 'List-Unsubscribe': `<${oneClickUnsubscribeUrl(g.id)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    };
  });

  try {
    await sendMailBatch(messages);
    return { page: page.slug, reminder: key, sent: messages.length };
  } catch (error) {
    await sql`
      DELETE FROM event_reminder_deliveries
      WHERE user_page_id = ${page.id} AND reminder_key = ${key} AND event_date = ${page.event_date}::date
        AND guest_id = ANY(string_to_array(${[...claimedIds].join(',')}, ',')::uuid[])
    `;
    console.error(`Reminder ${key} for page ${page.id} failed:`, error);
    return { page: page.slug, reminder: key, sent: 0, error: error instanceof Error ? error.message : String(error) };
  }
}
