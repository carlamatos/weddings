import { auth } from '@/auth';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';
import { siteHref } from '@/app/lib/app-url';
import { readRsvpTimeline } from '@/app/lib/saved-plans';
import { fetchPlan } from '@/app/lib/saved-plans-data';
import { rsvpCalculatorHref } from '@/app/ui/dashboard/planning-tool-tip';
import { PlanTimeline } from '@/app/ui/dashboard/plan-timeline';
import { SavedPlanNotice } from '@/app/ui/dashboard/saved-plan-notice';
import { HelpLink } from '@/app/ui/dashboard/help-link';

// Planning → Timeline: the RSVP plan from the free calculator, with
// reminder emails to the host (saved-plans.ts, app/api/cron/plan-reminders).
export default async function TimelinePage({ params, searchParams }: { params: Promise<{ pageId: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [page, { saved }, session] = await Promise.all([requireOwnedPage(params), searchParams, auth()]);
  const pageId = Number(page.id);
  const plan = readRsvpTimeline((await fetchPlan(pageId, 'rsvp'))?.data);
  const raw = page.event_date as unknown;
  const pageDate = raw instanceof Date ? raw.toISOString().slice(0, 10) : /^\d{4}-\d{2}-\d{2}/.test(String(raw ?? '')) ? String(raw).slice(0, 10) : null;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <SavedPlanNotice saved={saved} />
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Timeline</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          Every date that matters before your event: when to send invitations, your RSVP deadline, and when the caterer needs your
          final numbers. Tick each one off, and we&rsquo;ll email you on the day.
          {' '}<HelpLink guide="plan-your-rsvp-timeline" />
        </p>
      </div>
      {plan ? (
        <PlanTimeline
          pageId={pageId}
          initial={plan}
          pageDate={pageDate}
          base={pagePath(pageId)}
          today={new Date().toISOString().slice(0, 10)}
          email={session?.user?.email ?? undefined}
          calculatorHref={siteHref(`/rsvp-deadline-calculator${plan.hash}`)}
        />
      ) : (
        <section style={{ background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: 22, maxWidth: 640 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Make your timeline</h2>
          <p style={{ fontSize: 14, color: '#6B6470', margin: '0 0 16px', lineHeight: 1.6 }}>
            Our free RSVP deadline calculator works out every date from your event day. Click <strong>Save to my MyGala</strong> there
            and your timeline appears here, with a reminder email on each date.
          </p>
          <a href={siteHref(rsvpCalculatorHref(page))} style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 8, background: '#B6584A', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Open the RSVP deadline calculator
          </a>
        </section>
      )}
    </div>
  );
}
