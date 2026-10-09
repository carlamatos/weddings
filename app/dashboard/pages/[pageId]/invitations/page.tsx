import { fetchGuests, fetchPageSettings } from '@/app/lib/data';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';
import { INVITATION_SETTING, normalizeInvitation } from '@/app/lib/invitation';
import { invitationDetails } from '@/app/lib/invitation-details';
import { PlusUpgradePrompt } from '@/app/ui/dashboard/plus-upgrade-prompt';
import { InvitationDesigner } from '@/app/ui/dashboard/invitation-designer';
import { InvitationSender } from '@/app/ui/dashboard/invitation-sender';
import { InvitationPasswordOption } from '@/app/ui/dashboard/invitation-password-option';
import { invitationPassword } from '@/app/lib/page-password';
import { auth } from '@/auth';

export default async function InvitationsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const page = await requireOwnedPage(params);
  const pageId = Number(page.id);

  if (page.plan_type !== 'paid') {
    return (
      <PlusUpgradePrompt
        page={page}
        title="Invitations"
        pitch="Invitations is a Plus feature. Upgrade to design an invitation that matches your theme and send it to your guest list by email, text message or WhatsApp — with a personal note for each guest. Your guest list itself is free, under Guests → Guest List."
      />
    );
  }

  const [settings, guests] = await Promise.all([fetchPageSettings(pageId), fetchGuests(pageId)]);

  let saved: unknown = null;
  try { saved = JSON.parse(settings[INVITATION_SETTING] ?? 'null'); } catch { saved = null; }
  const design = normalizeInvitation(saved, page.theme_slug);

  const pagePassword = invitationPassword(settings, true);
  const details = invitationDetails(page, pagePassword.password);
  const hostName = (await auth())?.user?.name?.trim() || '';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Invitations</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          Design an invitation that matches your page — choose fonts, wording, colours and a background — then print it, save it
          as a PDF, or send it to your guests by email, text message or WhatsApp.
        </p>
      </div>

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
        <InvitationSender pageId={pageId} guests={guests} design={design} details={details} language={page.language} hostName={hostName} guestListHref={pagePath(pageId, '/guest-list')} />
      </div>
    </div>
  );
}
