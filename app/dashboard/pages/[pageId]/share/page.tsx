import Link from 'next/link';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';
import { isPagePaidAndLive } from '@/app/lib/plans';
import { isCardImage, plainDescription, publicPageUrl, socialImageFor } from '@/app/lib/share';
import { ShareButtons } from '@/app/ui/dashboard/share-buttons';

// Available on every plan. Paid pages with a verified custom domain share
// that domain; everyone else shares their MyGala URL.
export default async function SharePage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const isPaid = isPagePaidAndLive(userPage);
  const url = publicPageUrl(userPage);
  const image = socialImageFor(userPage);
  const title = userPage.heading || 'MyGala';
  const description = plainDescription(userPage);
  const usingBanner = isCardImage(userPage.banner_image);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 760 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Share</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0 }}>
          Send your event page to guests on social media, messaging apps, or email. Links show your top banner image as the preview.
        </p>
      </div>

      {userPage.status === 'inactive' && (
        <div role="alert" style={{ background: '#FFF8E7', border: '1px solid #E8D9A8', color: '#8A6800', borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          Your page is deactivated, so anyone who opens the link will see a &ldquo;page unavailable&rdquo; message.
        </div>
      )}

      <ShareButtons url={url} title={title} description={description} image={image} />

      <p style={{ fontSize: 13, color: '#6B6470', marginTop: 16, lineHeight: 1.6 }}>
        {usingBanner
          ? 'The preview uses your top banner image.'
          : userPage.banner_image
            ? 'Social networks can’t show a video or SVG banner as a preview, so a fallback image is used instead.'
            : 'You haven’t uploaded a top banner yet, so a fallback image is used.'}{' '}
        Change it from{' '}
        <Link href={pagePath(userPage.id)} style={{ color: '#B6584A' }}>Edit Page</Link>.
        {' '}Networks cache previews, so a new banner can take a while to show up on links already shared.
      </p>

      {!isPaid && (
        <p style={{ fontSize: 13, color: '#6B6470', marginTop: 8, lineHeight: 1.6 }}>
          Want to share your own domain instead?{' '}
          <Link href={pagePath(userPage.id, '/domain')} style={{ color: '#B6584A' }}>Upgrade to Plus</Link>.
        </p>
      )}
    </div>
  );
}
