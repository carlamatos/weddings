import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { listOwnedPages } from '@/app/lib/data';
import { isPagePaidAndLive, hasExpiredPlan } from '@/app/lib/plans';
import { verificationGracePeriodOver, needsTotpChallenge } from '@/app/lib/require-verified';
import SideNav from '@/app/ui/dashboard/sidenav';
import TopNav from '@/app/ui/dashboard/topnav';
import ExtendButton from '@/app/ui/dashboard/extend-button';
import ResendVerificationButton from '@/app/ui/dashboard/resend-verification-button';
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

  // Soft at first (banner below), hard block after a grace period — this is
  // a UX nudge, not the security boundary. Sensitive API routes must call
  // requireEmailVerified() themselves (app/lib/require-verified.ts).
  const verifiedEmail = session?.user?.verifiedEmail ?? true;
  if (userId && !verifiedEmail && (await verificationGracePeriodOver(userId))) {
    redirect('/verify-email-pending');
  }

  const pages = userId && pageId !== undefined ? await listOwnedPages(userId) : [];
  const page = pageId !== undefined ? pages.find((p) => Number(p.id) === pageId) : undefined;
  if (pageId !== undefined && !page) notFound();

  // Always a deliberate choice now (owner or admin) — expireIfPast drops a
  // lapsed paid page to the free tier instead of deactivating it, so it
  // stays live at its URL.
  const deactivated = page?.status === 'inactive';
  const expired = !!page && hasExpiredPlan(page);

  return (
    <div className={`dash dash-shell ${greatVibes.variable}`}>
      <SideNav pageId={page ? Number(page.id) : undefined} pageName={page?.heading} isPaid={page ? isPagePaidAndLive(page) : false} />
      <div className="dash-main">
        <TopNav page={page} />
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
                <strong>Please verify your email address.</strong> Check your inbox for the link we sent when you signed up.
              </span>
              <ResendVerificationButton />
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
                <strong>Your Plus term has ended.</strong> Your page is still live, but Domain, Guest Photos, Song Requests, and Event Reminders are back on the free tier. Extend to restore them.
              </span>
              <ExtendButton pageId={Number(page.id)} />
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
