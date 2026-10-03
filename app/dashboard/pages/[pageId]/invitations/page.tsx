import { fetchGuests, fetchPageSettings } from '@/app/lib/data';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';
import { INVITATION_SETTING, normalizeInvitation } from '@/app/lib/invitation';
import { invitationDetails } from '@/app/lib/invitation-details';
import { PlusUpgradePrompt } from '@/app/ui/dashboard/plus-upgrade-prompt';
import { InvitationDesigner } from '@/app/ui/dashboard/invitation-designer';
import { GuestListManager } from '@/app/ui/dashboard/guest-list-manager';
import { auth } from '@/auth';

export default async function InvitationsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const page = await requireOwnedPage(params);
  const pageId = Number(page.id);

  if (page.plan_type !== 'paid') {
    return (
      <PlusUpgradePrompt
        page={page}
        title="Invitations"
        pitch="Invitations is a Plus feature. Upgrade to design invitations that match your theme and build your guest list from a spreadsheet or your phone's contacts."
      />
    );
  }

  const [settings, guests] = await Promise.all([fetchPageSettings(pageId), fetchGuests(pageId)]);

  let saved: unknown = null;
  try { saved = JSON.parse(settings[INVITATION_SETTING] ?? 'null'); } catch { saved = null; }
  const design = normalizeInvitation(saved, page.theme_slug);

  const details = invitationDetails(page);
  const hostName = (await auth())?.user?.name?.trim() || '';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Invitations</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          Design an invitation that matches your page — choose fonts, wording, colours and a background — then print it or save it
          as a PDF. Below, build the guest list you&rsquo;re inviting.
        </p>
      </div>

      <InvitationDesigner
        pageId={pageId}
        themeSlug={page.theme_slug ?? null}
        initial={design}
        details={details}
        editPageHref={pagePath(pageId)}
      />

      <div style={{ marginTop: 32 }}>
        <GuestListManager pageId={pageId} guests={guests} design={design} details={details} language={page.language} hostName={hostName} />
      </div>
    </div>
  );
}
