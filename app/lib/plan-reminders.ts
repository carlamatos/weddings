import { sql } from '@vercel/postgres';
import { sendMail, wrap, button, escHtml } from './mail';
import { siteUrl } from './site-url';
import { COMPANY } from './company';
import { addDays, formatDay } from './marketing/rsvp-deadline';
import { formatMoney } from './marketing/tool-money';
import { STEP_SCREENS, timelineSteps } from './plan-timeline';
import { depositsDue, readBudget, readRsvpTimeline, type BudgetPlan, type RsvpTimelinePlan } from './saved-plans';
import { ensurePlansTable, writePlan } from './saved-plans-data';

// Reminder emails to the host from their saved plans (saved-plans.ts), sent
// by the daily cron (app/api/cron/plan-reminders): each step of the RSVP
// timeline on its day (while "Email me on each date" is on and the step
// isn't ticked off), and each budget payment a week before it's due and on
// the day. One email per event per day; what's been sent is remembered in
// the plan, so a step is never emailed twice. A step missed by a day or two
// (the cron didn't run) still goes out.

const CATCH_UP_DAYS = 2;

type Row = { user_page_id: number; tool: 'rsvp' | 'budget'; data: unknown; email: string; given_name: string | null; heading: string | null };
type Item = { title: string; text: string; link?: { href: string; label: string } };

export async function sendPlanReminders(today = new Date().toISOString().slice(0, 10)): Promise<{ emails: number; failed: number }> {
  await ensurePlansTable();
  const { rows } = await sql<Row>`
    SELECT ep.user_page_id, ep.tool, ep.data, u.email, u.given_name, up.heading
    FROM event_plans ep
    JOIN user_page up ON up.id = ep.user_page_id
    JOIN users u ON u.id = up.user_id
    WHERE ep.tool IN ('rsvp', 'budget') AND COALESCE(up.status, 'active') NOT IN ('suspended')
  `;
  const site = siteUrl();
  const byPage = new Map<number, { email: string; name: string; heading: string; items: Item[]; saves: (() => Promise<void>)[] }>();

  for (const row of rows) {
    const entry = byPage.get(row.user_page_id) ?? { email: row.email, name: (row.given_name ?? '').trim(), heading: row.heading ?? '', items: [], saves: [] };
    const base = `${site}/dashboard/pages/${row.user_page_id}`;
    if (row.tool === 'rsvp') {
      const plan = readRsvpTimeline(row.data);
      if (plan?.reminders) collectTimeline(plan, today, base, row.user_page_id, entry);
    } else {
      const plan = readBudget(row.data);
      if (plan) collectBudget(plan, today, base, row.user_page_id, entry);
    }
    if (entry.items.length) byPage.set(row.user_page_id, entry);
  }

  let emails = 0;
  let failed = 0;
  for (const [pageId, e] of byPage) {
    try {
      await sendMail({
        to: e.email,
        subject: e.items.length === 1 ? `${e.items[0].title}${e.heading ? ` · ${e.heading}` : ''}` : `${e.items.length} things to do for ${e.heading || 'your event'}`,
        html: planReminderHtml(e.name, e.heading, e.items, `${site}/dashboard/pages/${pageId}/timeline`),
      });
      for (const save of e.saves) await save();
      emails++;
    } catch (error) {
      failed++;
      console.error('Failed to send a plan reminder:', error);
    }
  }
  return { emails, failed };
}

function collectTimeline(plan: RsvpTimelinePlan, today: string, base: string, pageId: number, entry: { items: Item[]; saves: (() => Promise<void>)[] }) {
  const due = timelineSteps(plan).steps.filter((s) => s.id !== 'event' && s.date <= today && s.date >= addDays(today, -CATCH_UP_DAYS)
    && !plan.done.includes(s.id) && !plan.sent.includes(`${s.id}:${s.date}`));
  if (!due.length) return;
  for (const s of due) {
    const screen = STEP_SCREENS[s.id];
    entry.items.push({ title: s.title, text: s.text, link: screen ? { href: `${base}${screen.section}`, label: screen.label } : undefined });
  }
  const sent = [...plan.sent, ...due.map((s) => `${s.id}:${s.date}`)];
  entry.saves.push(() => writePlan(pageId, 'rsvp', { ...plan, sent }));
}

function collectBudget(plan: BudgetPlan, today: string, base: string, pageId: number, entry: { items: Item[]; saves: (() => Promise<void>)[] }) {
  const sent = plan.sent ?? [];
  const keys: string[] = [];
  for (const l of depositsDue(plan)) {
    const week = l.due === addDays(today, 7) ? `${l.id}:${l.due}:week` : null;
    const day = l.due <= today && l.due >= addDays(today, -CATCH_UP_DAYS) ? `${l.id}:${l.due}:day` : null;
    const key = day ?? week;
    if (!key || sent.includes(key)) continue;
    keys.push(key);
    entry.items.push({
      title: day ? `Payment due today: ${l.label}` : `Payment due in a week: ${l.label}`,
      text: `${formatMoney(l.deposit, plan.currency)}${day ? '' : ` on ${formatDay(l.due)}`}${l.note ? ` (${l.note})` : ''}. Mark it as paid in your budget once it’s done.`,
      link: { href: `${base}/budget`, label: 'Open your budget' },
    });
  }
  if (keys.length) entry.saves.push(() => writePlan(pageId, 'budget', { ...plan, sent: [...sent, ...keys] }));
}

export function planReminderHtml(name: string, heading: string, items: Item[], timelineUrl: string): string {
  const p = 'margin: 0 0 16px; line-height: 1.6;';
  const list = items.map((i) => `
    <div style="padding: 14px 16px; border: 1px solid #EDE8E3; border-radius: 10px; margin: 0 0 12px;">
      <p style="margin: 0 0 4px; font-weight: 600;">${escHtml(i.title)}</p>
      <p style="margin: 0; line-height: 1.55; color: #6B6470;">${escHtml(i.text)}</p>
      ${i.link ? `<p style="margin: 8px 0 0;"><a href="${i.link.href}" style="color: #B6584A; font-weight: 600; text-decoration: none;">${escHtml(i.link.label)} →</a></p>` : ''}
    </div>`).join('');
  return wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">${items.length === 1 ? 'A reminder for today' : 'Your reminders for today'}</h2>
    <p style="${p}">${name ? `Hi ${escHtml(name)},` : 'Hi there,'}</p>
    <p style="${p}">Here’s what’s next for <strong>${escHtml(heading || 'your event')}</strong>:</p>
    ${list}
    <div style="margin: 24px 0;">${button(timelineUrl, 'See your timeline')}</div>
    <p style="margin: 24px 0 0; font-size: 13px; color: #9A8F8C; line-height: 1.6;">You get these because you saved a plan to your event on MyGala.
    To stop them, untick “Email me on each date” on your Timeline, or mark the payment as paid in your Budget. Questions? <a href="mailto:${COMPANY.email}" style="color: #9A8F8C;">${COMPANY.email}</a></p>
  `);
}
