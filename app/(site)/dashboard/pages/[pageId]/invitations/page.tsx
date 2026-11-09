import { fetchGuests, fetchPageSettings } from '@/app/lib/data';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';
import { INVITATION_SETTING, normalizeInvitation } from '@/app/lib/invitation';
import { invitationDetails } from '@/app/lib/invitation-details';
import { InvitationDesigner } from '@/app/ui/dashboard/invitation-designer';
import { InvitationSender } from '@/app/ui/dashboard/invitation-sender';
import { InvitationPasswordOption } from '@/app/ui/dashboard/invitation-password-option';
import { invitationPassword } from '@/app/lib/page-password';
import { auth } from '@/auth';
import { publicPageUrl } from '@/app/lib/share';
import { QuickShare } from '@/app/ui/dashboard/quick-share';
import { HelpLink } from '@/app/ui/dashboard/help-link';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
export const metadata: Metadata = { title: 'Invitations' };

export default async function InvitationsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const d = await getDashText();
  const page = await requireOwnedPage(params);
  const pageId = Number(page.id);


  const [settings, guests] = await Promise.all([fetchPageSettings(pageId), fetchGuests(pageId)]);

  let saved: unknown = null;
  try { saved = JSON.parse(settings[INVITATION_SETTING] ?? 'null'); } catch { saved = null; }
  const design = normalizeInvitation(saved, page.theme_slug);

  const pagePassword = invitationPassword(settings, true);
  const details = invitationDetails(page, pagePassword.password);
  const session = await auth();
  const hostName = session?.user?.name?.trim() || '';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.invitations.invitations}</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          {d.invitations.designAnInvitationThatMatches}
          {' '}<HelpLink guide="send-invitations" />
        </p>
      </div>

      <QuickShare pageId={pageId} url={publicPageUrl(page)} title={page.heading || d.invitations.ourEvent} draft={page.status === 'draft'} />

      {pagePassword.state !== 'none' && (
        <InvitationPasswordOption pageId={pageId} state={pagePassword.state} passwordHref={pagePath(pageId, '/password')} />
      )}

      <InvitationDesigner
        pageId={pageId}
        themeSlug={page.theme_slug ?? null}
        initial={design}
        details={details}
        editPageHref={pagePath(pageId)}
      />

      <div style={{ marginTop: 32 }}>
        <InvitationSender pageId={pageId} guests={guests} design={design} details={details} language={page.language} hostName={hostName} guestListHref={pagePath(pageId, '/guest-list')} locked={!session?.user?.verifiedEmail} />
      </div>
    </div>
  );
}
