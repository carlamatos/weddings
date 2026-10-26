import Link from 'next/link';
import { sql } from '@vercel/postgres';
import { fetchPageSettings } from '@/app/lib/data';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';
import { PlusSetupNote } from '@/app/ui/dashboard/plus-gate';
import { parseReminderSchedule } from '@/app/lib/reminders';
import { reminderEmail } from '@/app/lib/reminder-email';
import { RemindersForm } from '@/app/ui/dashboard/reminders-form';

export default async function RemindersPage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);


  const [settings, subscribers, sent] = await Promise.all([
    fetchPageSettings(pageId),
    sql<{ count: string }>`
      SELECT COUNT(DISTINCT lower(email))::text AS count FROM event_guests
      WHERE user_page_id = ${pageId} AND receive_updates AND status <> 'not_attending' AND email LIKE '%@%'
    `.then((r) => Number(r.rows[0]?.count ?? 0)),
    userPage.event_date
      ? sql<{ reminder_key: string; count: string }>`
          SELECT reminder_key, COUNT(*)::text AS count FROM event_reminder_deliveries
          WHERE user_page_id = ${pageId} AND event_date = ${userPage.event_date}::date
          GROUP BY reminder_key
        `.then((r) => r.rows).catch(() => [])
      : Promise.resolve([]),
  ]);

  const schedule = parseReminderSchedule(settings['reminder_schedule']);
  const message = settings['reminder_message'] ?? '';
  const sentCounts = Object.fromEntries(sent.map((s) => [s.reminder_key, Number(s.count)]));

  const preview = reminderEmail({
    page: userPage,
    reminderKey: schedule[schedule.length - 1] ?? '1w',
    message,
    guestName: 'Alex',
    unsubscribeLink: '#',
  });

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 760 }}>
      <PlusSetupNote section="/reminders" />
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Event Reminders</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, lineHeight: 1.6 }}>
          Automatically email your guests before the event with the date, location, and a personal note from you.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, background: '#faf8f6', border: '1px solid #EDE8E3', marginBottom: 20, fontSize: 14, color: '#241F2B', flexWrap: 'wrap' }}>
        <strong>{subscribers} guest{subscribers === 1 ? '' : 's'}</strong>
        <span style={{ color: '#6B6470' }}>
          {subscribers === 1 ? 'has' : 'have'} asked for event updates when they RSVP&apos;d and will receive reminders.
          {' '}Guests who declined or unsubscribed are left out.
        </span>
        <Link href={pagePath(userPage.id, '/rsvp')} style={{ color: '#B6584A', fontWeight: 600, marginLeft: 'auto' }}>View guests</Link>
      </div>

      <RemindersForm
        pageId={pageId}
        initialSchedule={schedule}
        initialMessage={message}
        eventDate={userPage.event_date || null}
        eventTime={userPage.event_time || null}
        sentCounts={sentCounts}
      />

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 4px' }}>Email preview</h2>
        <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 12px' }}>
          Subject: <strong style={{ color: '#241F2B' }}>{preview.subject}</strong>. Shows your saved note; guests see their own first name.
        </p>
        <iframe
          title="Reminder email preview"
          srcDoc={preview.html}
          sandbox=""
          style={{ width: '100%', height: 860, border: '1px solid #EDE8E3', borderRadius: 12, background: '#F7F4F1' }}
        />
      </section>
    </div>
  );
}
