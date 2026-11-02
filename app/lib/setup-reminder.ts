import { sql } from '@vercel/postgres';
import { sendMail, wrap, button, escHtml } from './mail';
import { siteUrl } from './site-url';
import { COMPANY } from './company';

// "Your event page is one step away": one email to an account that signed
// up a day or so ago and hasn't made an event page yet, with a link back to
// the create form. Sent once per account (users.setup_reminder_sent_at) by
// the daily cron (app/api/cron/setup-reminders). Only accounts from the
// last few days qualify, so older accounts never get it. The wording says
// "event page", not "wedding page": the account may be for any event.

const LOOKBACK_DAYS = 3; // signed up 1 to 3 days ago (users.date is a day)
const BATCH = 200;

type ReminderUser = { id: string; email: string; given_name: string | null };

// Added on first use, so a new environment needs no setup step (it's also
// in /api/migrate).
let columnReady: Promise<unknown> | null = null;
function ensureReminderColumn(): Promise<unknown> {
  columnReady ??= sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS setup_reminder_sent_at TIMESTAMPTZ`
    .catch((error) => { columnReady = null; throw error; });
  return columnReady;
}

export function setupReminderHtml(user: { given_name: string | null }): string {
  const site = siteUrl();
  const name = (user.given_name ?? '').trim();
  const p = 'margin: 0 0 16px; line-height: 1.6;';
  return wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">Your event page is one step away</h2>
    <p style="${p}">${name ? `Hi ${escHtml(name)},` : 'Hi there,'}</p>
    <p style="${p}">Thanks for creating your MyGala account! You haven’t made your event page yet — and it only takes a minute.</p>
    <p style="${p}">Just give your event a name. Your page is ready straight away, in a design picked for you that you can change any time.
    No date yet? That’s fine — you can add it later, with the place and everything else.</p>
    <div style="margin: 24px 0;">${button(`${site}/dashboard/setup`, 'Create my event page')}</div>
    <p style="${p}">Once it’s made you can add your details, collect RSVPs and share it with your guests by link, QR code or invitation.</p>
    <p style="margin: 24px 0 0; line-height: 1.6;">Questions? Write to us at
    <a href="mailto:${COMPANY.email}" style="color: #B6584A;">${COMPANY.email}</a> — we read every message.</p>
    <p style="margin: 28px 0 0; line-height: 1.6;">Happy planning,<br />The MyGala team</p>
    <p style="margin: 16px 0 0; font-size: 13px; color: #9A8F8C;">You’re receiving this one-time email because you created a MyGala account.</p>
  `);
}

// Sends the email to every account due one. Each account is marked first, so
// a failed or repeated run never sends it twice.
export async function sendSetupReminders(): Promise<{ sent: number; failed: number }> {
  await ensureReminderColumn();
  const { rows } = await sql<ReminderUser>`
    SELECT u.id, u.email, u.given_name FROM users u
    WHERE u.setup_reminder_sent_at IS NULL
      AND u.date >= CURRENT_DATE - ${LOOKBACK_DAYS}::int AND u.date < CURRENT_DATE
      AND NOT EXISTS (SELECT 1 FROM user_page p WHERE p.user_id = u.id)
    ORDER BY u.date
    LIMIT ${BATCH}
  `;
  let sent = 0;
  let failed = 0;
  for (const user of rows) {
    const claimed = await sql`UPDATE users SET setup_reminder_sent_at = NOW() WHERE id = ${user.id} AND setup_reminder_sent_at IS NULL`;
    if (!claimed.rowCount || !user.email) continue;
    try {
      await sendMail({ to: user.email, subject: 'Your event page is one step away', html: setupReminderHtml(user) });
      sent++;
    } catch (error) {
      console.error('Failed to send setup reminder:', error);
      failed++;
    }
  }
  return { sent, failed };
}
