import { sql } from '@vercel/postgres';
import { fromName, sendMailBatch, type MailMessage } from './mail';
import { giftExchangeDetails, GIFT_SETTINGS, isGiftDay } from './gift-exchange';
import { giftReminderEmail } from './gift-exchange-email';
import { giftLang } from './gift-exchange-copy';
import { giftRevealUrl } from './gift-token';

// Gift Exchange reminders: once names are drawn and the host has set the
// exchange date (gift_exchange_day), everyone with an email gets a reminder
// a week before and the day before. Run once a day by the plan-reminders
// cron. Each reminder is recorded with the date it was for
// (gift_reminder_week / gift_reminder_eve), so a moved date sends again but
// the same date never sends twice.

const ZONE = 'America/Toronto';
const MARK = { week: 'gift_reminder_week', eve: 'gift_reminder_eve' } as const;
const LOCALE = { en: 'en-CA', fr: 'fr-CA', es: 'es-MX' } as const;

// Today's date where most hosts are, as YYYY-MM-DD.
function todayIn(zone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);

export async function sendGiftExchangeReminders(today = todayIn(ZONE)): Promise<{ pages: number; emails: number; failed: number }> {
  const pages = await sql<{ id: number; heading: string | null; language: string | null; host_name: string | null; host_email: string | null }>`
    SELECT up.id, up.heading, up.language, u.name AS host_name, u.email AS host_email
    FROM user_page up
    JOIN users u ON u.id = up.user_id
    JOIN user_page_settings on_s ON on_s.user_page_id = up.id AND on_s.setting_name = 'show_gift_exchange' AND on_s.setting_value = 'true'
    JOIN user_page_settings day_s ON day_s.user_page_id = up.id AND day_s.setting_name = ${GIFT_SETTINGS.day} AND day_s.setting_value <> ''
    WHERE COALESCE(up.status, 'active') NOT IN ('inactive', 'suspended', 'draft')
      AND EXISTS (SELECT 1 FROM page_gift_exchange g WHERE g.user_page_id = up.id AND g.giftee_id IS NOT NULL)
  `;

  let emails = 0, failed = 0, done = 0;
  for (const page of pages.rows) {
    try {
      const settingsRes = await sql<{ setting_name: string; setting_value: string }>`
        SELECT setting_name, setting_value FROM user_page_settings WHERE user_page_id = ${page.id}`;
      const settings = Object.fromEntries(settingsRes.rows.map((r) => [r.setting_name, r.setting_value]));
      const details = giftExchangeDetails(settings);
      if (!isGiftDay(details.day)) continue;
      const left = daysBetween(today, details.day);
      const kind = left === 7 ? 'week' : left === 1 ? 'eve' : null;
      if (!kind || settings[MARK[kind]] === details.day) continue;

      const people = await sql<{ id: number; name: string; email: string | null }>`
        SELECT id, name, email FROM page_gift_exchange
        WHERE user_page_id = ${page.id} AND giftee_id IS NOT NULL AND email IS NOT NULL`;
      const lang = giftLang(page.language);
      const when = new Intl.DateTimeFormat(LOCALE[lang], { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(`${details.day}T12:00:00Z`));
      const eventName = page.heading || 'the event';
      const host = page.host_name?.trim() || eventName;
      const messages: MailMessage[] = people.rows
        .filter((p) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email ?? ''))
        .map((p) => {
          const { subject, html } = giftReminderEmail({ language: page.language, kind, eventName, when, participantName: p.name, details, revealLink: giftRevealUrl(p.id) });
          return { to: p.email!, subject, html, from: fromName(host), ...(page.host_email ? { replyTo: page.host_email } : {}) };
        });
      for (let i = 0; i < messages.length; i += 100) await sendMailBatch(messages.slice(i, i + 100));
      await sql`
        INSERT INTO user_page_settings (user_page_id, setting_name, setting_value)
        VALUES (${page.id}, ${MARK[kind]}, ${details.day})
        ON CONFLICT (user_page_id, setting_name) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()`;
      emails += messages.length;
      done++;
    } catch (error) {
      failed++;
      console.error(`Gift exchange reminders failed for page ${page.id}:`, error);
    }
  }
  return { pages: done, emails, failed };
}
