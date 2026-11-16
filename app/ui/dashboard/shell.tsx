import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { after } from 'next/server';
import { auth } from '@/auth';
import { recordDashboardVisit } from '@/app/lib/dashboard-visits';
import { fetchPageSettings, listOwnedPages } from '@/app/lib/data';
import { sectionStatus } from '@/app/lib/section-status';
import { fetchSetupCounts, setupSteps } from '@/app/lib/setup-progress';
import { isPagePaidAndLive, hasExpiredPlan } from '@/app/lib/plans';
import { needsTotpChallenge } from '@/app/lib/require-verified';
import SideNav from '@/app/ui/dashboard/sidenav';
import TopNav from '@/app/ui/dashboard/topnav';
import ExtendButton from '@/app/ui/dashboard/extend-button';
import { PlusProvider } from '@/app/ui/dashboard/plus-gate';
import PublishButton from '@/app/ui/dashboard/publish-button';
import { greatVibes } from '@/app/ui/fonts';
import { siteHref } from '@/app/lib/app-url';
import { PendingPlanBanner } from '@/app/ui/dashboard/pending-plan';
import { DashTextProvider } from '@/app/ui/dashboard/dash-text';

import { getDashText } from '@/app/lib/dash-text/server';
import { rich } from '@/app/ui/dashboard/rich';
// The dashboard chrome (sidebar, top bar, deactivation/lapsed-plan notices).
// pageId: undefined = no page in the URL (setup, page list); a number = that
// page (must belong to the signed-in user, else 404); null = malformed id (404).
export default async function DashboardShell({
  pageId,
  children,
}: {
  pageId?: number | null;
  children: React.ReactNode;
}) {
  const d = await getDashText();
  if (pageId === null) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  if (pageId !== undefined && !userId) redirect('/login');

  // No grace period for 2FA — an account that opted in is never allowed
  // partial access without completing the challenge. Checked ahead of email
  // verification below.
  if (userId && needsTotpChallenge(session)) {
    redirect('/verify-2fa');
  }

  // An unverified account can use the whole dashboard; what reaches other
  // people is locked on the server until it verifies (app/lib/require-verified.ts),
  // and the banner below says so.
  const verifiedEmail = session?.user?.verifiedEmail ?? true;

  // When hosts come back, for the admin's Activity tab.
  if (userId) after(() => recordDashboardVisit(userId));

  const pages = userId && pageId !== undefined ? await listOwnedPages(userId) : [];
  const page = pageId !== undefined ? pages.find((p) => Number(p.id) === pageId) : undefined;
  if (pageId !== undefined && !page) notFound();

  // Always a deliberate choice now (owner or admin) — expireIfPast drops a
  // lapsed paid page to the free tier instead of deactivating it, so it
  // stays live at its URL.
  // On/off state of each section, shown beside it in the sidebar.
  const [settings, counts] = page ? await Promise.all([fetchPageSettings(page.id), fetchSetupCounts(page.id)]) : [];
  const status = page && settings ? sectionStatus(page, settings) : undefined;
  // "Your page is 3/5 ready" at the top of the sidebar.
  const setup = page && counts ? setupSteps(page, counts, d.setupSteps) : undefined;

  const deactivated = page?.status === 'inactive';
  const draft = page?.status === 'draft';
  const suspended = page?.status === 'suspended';
  const expired = !!page && hasExpiredPlan(page);

  return (
    <DashTextProvider text={d}>
    <PlusProvider pageId={page ? Number(page.id) : undefined} paid={page ? isPagePaidAndLive(page) : true} expired={expired}>
    <div className={`dash dash-shell ${greatVibes.variable}`}>
      <SideNav pageId={page ? Number(page.id) : undefined} pageName={page?.heading} isPaid={page ? isPagePaidAndLive(page) : false} status={status} setup={setup} />
      <div className="dash-main">
        <TopNav page={page} status={status} setup={setup} />
        <div className="dash-content">
          {draft && page && verifiedEmail && (
            <div
              role="status"
              style={{
                background: '#F3EFF9', border: '1px solid #D9CFEA', color: '#3F2E63',
                borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.6, marginBottom: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
              }}
            >
              <span>
                {rich(d.shell.yourPageIsADraft, { t0: (s) => <strong>{s}</strong> })}
              </span>
              <PublishButton pageId={Number(page.id)} />
            </div>
          )}
          {deactivated && (
            <div
              role="alert"
              style={{
                background: '#FFF8E7', border: '1px solid #E8D9A8', color: '#8A6800',
                borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.6, marginBottom: 20,
              }}
            >
              {rich(d.shell.yourPageHasBeenDeactivated, { t0: (s) => <strong>{s}</strong>, t1: (s) => <Link href={siteHref('/contact')} style={{ color: 'inherit', textDecoration: 'underline' }}>{s}</Link> })}
            </div>
          )}
          {suspended && (
            <div
              role="alert"
              style={{
                background: '#FDECEC', border: '1px solid #F2C4C4', color: '#8B1D1D',
                borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.6, marginBottom: 20,
              }}
            >
              {rich(d.shell.yourPageHasBeenSuspended, { t0: (s) => <strong>{s}</strong>, t1: (s) => <Link href={siteHref('/contact')} style={{ color: 'inherit', textDecoration: 'underline' }}>{s}</Link> })}
            </div>
          )}
          {expired && page && (
            <div
              role="alert"
              style={{
                background: '#FFF8E7', border: '1px solid #E8D9A8', color: '#8A6800',
                borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.6, marginBottom: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
              }}
            >
              <span>
                {rich(d.shell.yourPlusTermHasEnded, { t0: (s) => <strong>{s}</strong> })}
              </span>
              <ExtendButton pageId={Number(page.id)} />
            </div>
          )}
          {page && <PendingPlanBanner pageId={Number(page.id)} />}
          {children}
        </div>
      </div>
    </div>
    </PlusProvider>
    </DashTextProvider>
  );
}
