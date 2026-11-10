import Link from 'next/link';
import { fetchGuests, fetchPageSettings, isSectionOn } from '@/app/lib/data';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';
import { INVITATION_SETTING, normalizeInvitation } from '@/app/lib/invitation';
import { invitationDetails } from '@/app/lib/invitation-details';
import { InvitationDesigner } from '@/app/ui/dashboard/invitation-designer';
import { InvitationSender } from '@/app/ui/dashboard/invitation-sender';
import { InvitationPasswordOption } from '@/app/ui/dashboard/invitation-password-option';
import { invitationPassword } from '@/app/lib/page-password';
import { auth } from '@/auth';
import { normalizeHashtag } from '@/app/lib/hashtag';
import { isPagePaidAndLive } from '@/app/lib/plans';
import { isCardImage, plainDescription, publicPageUrl, socialImageFor, socialImagePathFor } from '@/app/lib/share';
import { QuickShare } from '@/app/ui/dashboard/quick-share';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { HashtagForm } from '@/app/ui/dashboard/hashtag-form';
import { ShareButtons } from '@/app/ui/dashboard/share-buttons';
import { HelpLink } from '@/app/ui/dashboard/help-link';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
import { rich } from '@/app/ui/dashboard/rich';
export const metadata: Metadata = { title: 'Invite' };

// Guests → Invite, on every plan: every way to get the page to guests, on
// one screen (it used to be two, Invitations and Share; /share now opens
// this one). The quickest first: the link for a group chat. Then the other
// apps and the link preview, then personal invitations by email or text
// (designed here, sent to the guest list), and last the switches for what
// the event page shows: its Share section and search engines. Paid pages
// with a verified custom domain share that domain.
export default async function InvitationsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const d = await getDashText();
  const page = await requireOwnedPage(params);
  const pageId = Number(page.id);

  const [settings, guests, session] = await Promise.all([fetchPageSettings(pageId), fetchGuests(pageId), auth()]);

  let saved: unknown = null;
  try { saved = JSON.parse(settings[INVITATION_SETTING] ?? 'null'); } catch { saved = null; }
  const design = normalizeInvitation(saved, page.theme_slug);

  const pagePassword = invitationPassword(settings, true);
  const details = invitationDetails(page, pagePassword.password);
  const hostName = session?.user?.name?.trim() || '';

  const isPaid = isPagePaidAndLive(page);
  const url = publicPageUrl(page);
  const title = page.heading || d.invitations.ourEvent;
  const hashtag = normalizeHashtag(settings['share_hashtag']);
  const usingBanner = isCardImage(page.banner_image);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.invitations.inviteYourGuests}</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          {d.invitations.shareYourLinkOrSend}
          {' '}<HelpLink guide="send-invitations" />
        </p>
      </div>

      {(page.status === 'inactive' || page.status === 'suspended') && (
        <div role="alert" style={{ background: '#FFF8E7', border: '1px solid #E8D9A8', color: '#8A6800', borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          {d.share.yourPageIs} {page.status === 'suspended' ? 'suspended' : 'deactivated'}{d.share.soAnyoneWhoOpensThe}
        </div>
      )}

      <QuickShare pageId={pageId} url={url} title={title} draft={page.status === 'draft'} />

      <details style={{ border: '1px solid #EDE8E3', borderRadius: 12, padding: '14px 20px', marginBottom: 28, background: '#fff' }}>
        <summary style={{ cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#241F2B' }}>{d.invitations.moreWaysToShare}</summary>
        <p style={{ fontSize: 13, color: '#6B6470', margin: '10px 0 16px', lineHeight: 1.6 }}>{d.share.sendYourEventPageTo}</p>
        <ShareButtons url={url} title={title} description={plainDescription(page)} image={socialImagePathFor(page)} shareImage={socialImageFor(page)} hashtag={hashtag || undefined} pageId={pageId} />
        <p style={{ fontSize: 13, color: '#6B6470', marginTop: 16, lineHeight: 1.6 }}>
          {usingBanner
            ? d.share.thePreviewUsesYourTop
            : page.banner_image
              ? d.share.socialNetworksCanTShow
              : d.share.youHavenTUploadedA}{' '}
          {rich(d.share.changeItFromEditEvent, { t0: (s) => <Link href={pagePath(pageId)} style={{ color: '#B6584A' }}>{s}</Link> })}
        </p>
        {!isPaid && (
          <p style={{ fontSize: 13, color: '#6B6470', margin: '8px 0 4px', lineHeight: 1.6 }}>
            {rich(d.share.wantToShareYourOwn, { t0: (s) => <Link href={pagePath(pageId, '/domain')} style={{ color: '#B6584A' }}>{s}</Link> })}
          </p>
        )}
      </details>

      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', margin: '0 0 4px' }}>{d.invitations.sendPersonalInvitations}</h2>
      <p style={{ fontSize: 14, color: '#6B6470', margin: '0 0 18px', maxWidth: 680, lineHeight: 1.6 }}>{d.invitations.designAnInvitationThatMatches}</p>

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

      <section id="page-settings" style={{ border: '1px solid #EDE8E3', borderRadius: 12, padding: '18px 20px', marginTop: 32, background: '#fff', scrollMarginTop: 80 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 4px' }}>{d.share.shareSectionOnYourPage}</h2>
        <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 14px', lineHeight: 1.6 }}>{d.share.aBandNearTheBottom}</p>
        <SectionToggle pageId={pageId} settingName="show_share" initialOn={isSectionOn(settings, 'show_share')} />
        <HashtagForm pageId={pageId} initialHashtag={hashtag} pageUrl={url} />

        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '24px 0 4px', paddingTop: 20, borderTop: '1px solid #F0ECE8' }}>{d.share.searchEnginesAiAnswers}</h2>
        <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 14px', lineHeight: 1.6 }}>{d.share.whileThisIsOffYour}</p>
        <SectionToggle pageId={pageId} settingName="show_in_search" initialOn={isSectionOn(settings, 'show_in_search')} label={d.share.showThisPageInSearch} />
      </section>
    </div>
  );
}
