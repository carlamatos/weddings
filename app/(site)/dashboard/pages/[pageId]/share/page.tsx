import Link from 'next/link';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';
import { fetchPageSettings, isSectionOn } from '@/app/lib/data';
import { normalizeHashtag } from '@/app/lib/hashtag';
import { isPagePaidAndLive } from '@/app/lib/plans';
import { isCardImage, plainDescription, publicPageUrl, socialImageFor, socialImagePathFor } from '@/app/lib/share';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { HashtagForm } from '@/app/ui/dashboard/hashtag-form';
import { ShareButtons } from '@/app/ui/dashboard/share-buttons';
import { HelpLink } from '@/app/ui/dashboard/help-link';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
import { rich } from '@/app/ui/dashboard/rich';
export const metadata: Metadata = { title: 'Share' };

// Available on every plan. Paid pages with a verified custom domain share
// that domain; everyone else shares their MyGala URL.
export default async function SharePage({ params }: { params: Promise<{ pageId: string }> }) {
  const d = await getDashText();
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);
  const settings = await fetchPageSettings(pageId);
  const isPaid = isPagePaidAndLive(userPage);
  const url = publicPageUrl(userPage);
  // Same-origin path for this preview; the page's Open Graph tags use the
  // absolute version (socialImageFor) for crawlers.
  const image = socialImagePathFor(userPage);
  const title = userPage.heading || 'MyGala';
  const description = plainDescription(userPage);
  const usingBanner = isCardImage(userPage.banner_image);
  const hashtag = normalizeHashtag(settings['share_hashtag']);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 760 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.share.share}</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0 }}>
          {d.share.sendYourEventPageTo}
          {' '}<HelpLink guide="share-your-page" />
        </p>
      </div>

      {userPage.status === 'draft' && (
        <div role="alert" style={{ background: '#F3EFF9', border: '1px solid #D9CFEA', color: '#3F2E63', borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          {d.share.yourPageIsADraft}
        </div>
      )}
      {(userPage.status === 'inactive' || userPage.status === 'suspended') && (
        <div role="alert" style={{ background: '#FFF8E7', border: '1px solid #E8D9A8', color: '#8A6800', borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          {d.share.yourPageIs} {userPage.status === 'suspended' ? 'suspended' : 'deactivated'}{d.share.soAnyoneWhoOpensThe}
        </div>
      )}

      <section style={{ border: '1px solid #EDE8E3', borderRadius: 12, padding: '18px 20px', marginBottom: 28, background: '#fff' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 4px' }}>{d.share.shareSectionOnYourPage}</h2>
        <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 14px', lineHeight: 1.6 }}>
          {d.share.aBandNearTheBottom}
        </p>
        <SectionToggle pageId={pageId} settingName="show_share" initialOn={isSectionOn(settings, 'show_share')} />
        <HashtagForm pageId={pageId} initialHashtag={hashtag} pageUrl={url} />
      </section>

      <section style={{ border: '1px solid #EDE8E3', borderRadius: 12, padding: '18px 20px', marginBottom: 28, background: '#fff' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 4px' }}>{d.share.searchEnginesAiAnswers}</h2>
        <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 14px', lineHeight: 1.6 }}>
          {d.share.whileThisIsOffYour}
        </p>
        <SectionToggle pageId={pageId} settingName="show_in_search" initialOn={isSectionOn(settings, 'show_in_search')} label={d.share.showThisPageInSearch} />
      </section>

      <ShareButtons url={url} title={title} description={description} image={image} shareImage={socialImageFor(userPage)} hashtag={hashtag || undefined} pageId={pageId} />

      <p style={{ fontSize: 13, color: '#6B6470', marginTop: 16, lineHeight: 1.6 }}>
        {usingBanner
          ? d.share.thePreviewUsesYourTop
          : userPage.banner_image
            ? d.share.socialNetworksCanTShow
            : d.share.youHavenTUploadedA}{' '}
        {rich(d.share.changeItFromEditEvent, { t0: (s) => <Link href={pagePath(userPage.id)} style={{ color: '#B6584A' }}>{s}</Link> })}
      </p>

      {!isPaid && (
        <p style={{ fontSize: 13, color: '#6B6470', marginTop: 8, lineHeight: 1.6 }}>
          {rich(d.share.wantToShareYourOwn, { t0: (s) => <Link href={pagePath(userPage.id, '/domain')} style={{ color: '#B6584A' }}>{s}</Link> })}
        </p>
      )}
    </div>
  );
}
