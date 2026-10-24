import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { fetchPageSettings, listOwnedPages } from '@/app/lib/data';
import { sectionStatus } from '@/app/lib/section-status';
import { fetchSetupCounts, setupSteps } from '@/app/lib/setup-progress';
import { isPagePaidAndLive, hasExpiredPlan } from '@/app/lib/plans';
import { needsTotpChallenge, UNVERIFIED_UPLOADS_PER_DAY } from '@/app/lib/require-verified';
import SideNav from '@/app/ui/dashboard/sidenav';
import TopNav from '@/app/ui/dashboard/topnav';
import ExtendButton from '@/app/ui/dashboard/extend-button';
import { PlusProvider } from '@/app/ui/dashboard/plus-gate';
import ResendVerificationButton from '@/app/ui/dashboard/resend-verification-button';
import PublishButton from '@/app/ui/dashboard/publish-button';
import { greatVibes } from '@/app/ui/fonts';
import { siteHref } from '@/app/lib/app-url';

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
  const setup = page && counts ? setupSteps(page, counts) : undefined;

  const deactivated = page?.status === 'inactive';
  const draft = page?.status === 'draft';
  const suspended = page?.status === 'suspended';
  const expired = !!page && hasExpiredPlan(page);

  return (
    <PlusProvider pageId={page ? Number(page.id) : undefined} paid={page ? isPagePaidAndLive(page) : true} expired={expired}>
    <div className={`dash dash-shell ${greatVibes.variable}`}>
      <SideNav pageId={page ? Number(page.id) : undefined} pageName={page?.heading} isPaid={page ? isPagePaidAndLive(page) : false} status={status} setup={setup} />
      <div className="dash-main">
        <TopNav page={page} status={status} setup={setup} />
        <div className="dash-content">
          {userId && !verifiedEmail && (
            <div
              role="alert"
              style={{
                background: '#FFF8E7', border: '1px solid #E8D9A8', color: '#8A6800',
                borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.6, marginBottom: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
              }}
            >
              <span>
                <strong>Verify your email to unlock everything.</strong> We sent a link to {session?.user?.email ?? 'your email address'}.
                Until you click it, your page stays a draft only you can see, and sending invitations, texting links to guests,
                connecting a domain and uploading more than {UNVERIFIED_UPLOADS_PER_DAY} photos a day are locked. Everything else — your page, your
                invitation, your guest list — you can build right now.
              </span>
              <ResendVerificationButton />
            </div>
          )}
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
                <strong>Your page is a draft.</strong> Only you can see it. Publish it when you&rsquo;re ready for guests to open it and RSVP.
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
              <strong>Your page has been deactivated.</strong> Guests currently see a &ldquo;page
              unavailable&rdquo; message. Reactivate it from the account menu, or{' '}
              <Link href={siteHref('/contact')} style={{ color: 'inherit', textDecoration: 'underline' }}>
                contact us
              </Link>{' '}
              with questions.
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
              <strong>Your page has been suspended by MyGala.</strong> Guests currently see a &ldquo;page unavailable&rdquo;
              message, and only MyGala can reactivate it. If you think this is a mistake, please{' '}
              <Link href={siteHref('/contact')} style={{ color: 'inherit', textDecoration: 'underline' }}>
                contact us
              </Link>{' '}
              to have it reviewed.
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
                <strong>Your Plus term has ended.</strong> Your page is still live, but Plus features like your custom domain, song requests and event reminders are off, and guest photos are back to the free limit of 50. Extend to restore them.
              </span>
              <ExtendButton pageId={Number(page.id)} />
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
    </PlusProvider>
  );
}
