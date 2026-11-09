import Link from 'next/link';
import { sql } from '@vercel/postgres';
import { fetchPageSettings } from '@/app/lib/data';
import { requireOwnedPage, pagePath } from '@/app/lib/dashboard';
import { publicPageUrl } from '@/app/lib/share';
import { areGuestPhotosOn } from '@/app/lib/guest-photos';
import { isPagePaidAndLive } from '@/app/lib/plans';
import { SLIDESHOW_PATH } from '@/app/lib/slideshow';
import { PlusSetupNote } from '@/app/ui/dashboard/plus-gate';
import { SlideshowLauncher } from '@/app/ui/dashboard/slideshow-launcher';
import { HelpLink } from '@/app/ui/dashboard/help-link';

const card: React.CSSProperties = { background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: '20px 22px', marginBottom: 20, maxWidth: 760 };
const h2: React.CSSProperties = { fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 8px' };
const p: React.CSSProperties = { fontSize: 14, color: '#6B6470', margin: '0 0 14px', lineHeight: 1.6 };

// Photo Slideshow (Plus): guests' photos on a TV or projector at the venue,
// at <page>/slideshow. Nothing to set up beyond Guest Photos: the host opens
// the link on the screen. Works for the owner on a free page as a preview.
export default async function SlideshowDashboardPage({ params }: { params: Promise<{ pageId: string }> }) {
  const page = await requireOwnedPage(params);
  const pageId = Number(page.id);
  const paid = isPagePaidAndLive(page);
  const [settings, count] = await Promise.all([
    fetchPageSettings(pageId),
    sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM guests_photos WHERE user_page_id = ${pageId}`
      .then((r) => Number(r.rows[0]?.count ?? 0))
      .catch(() => 0),
  ]);
  const photosOn = areGuestPhotosOn(settings, paid);
  const url = `${publicPageUrl(page)}${SLIDESHOW_PATH}`;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <PlusSetupNote section="/slideshow" />
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Photo Slideshow</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          Put your guests&rsquo; photos on a TV or projector at your event. New photos appear on the screen as guests share
          them, and a QR code in the corner invites everyone else to add theirs.
          {' '}<HelpLink guide="show-a-photo-slideshow" />
        </p>
      </div>

      {!photosOn && (
        <div role="status" style={{ ...card, background: '#FFF8E7', borderColor: '#E8D9A8', color: '#6B5200', fontSize: 14, lineHeight: 1.6 }}>
          <strong>Guest Photos is off.</strong> Guests can&rsquo;t share photos yet, so the slideshow has nothing to show.{' '}
          <Link href={pagePath(pageId, '/guest-photos')} style={{ color: '#B6584A', fontWeight: 600 }}>Switch on Guest Photos</Link>
        </div>
      )}

      <section style={card}>
        <h2 style={h2}>Your slideshow</h2>
        <p style={p}>
          {count === 0 ? 'No photos yet: until the first one arrives, the screen shows a big QR code for guests to scan.'
            : `${count} photo${count === 1 ? '' : 's'} so far. ${paid ? '' : 'Open it to try it out: only you can see it until this event is on Plus.'}`}
        </p>
        <SlideshowLauncher url={url} />
      </section>

      <section style={card}>
        <h2 style={h2}>How to put it on the screen</h2>
        <ol style={{ ...p, margin: 0, paddingLeft: 20 }}>
          <li>Connect a laptop to the TV or projector with an HDMI cable, or open the link in your smart TV&rsquo;s web browser.</li>
          <li>Open the slideshow link and press <strong>F</strong> (or the full-screen button) to fill the screen.</li>
          <li>Leave it running. It keeps the screen awake, checks for new photos every few seconds and loops through all of them.</li>
          <li>Move the mouse to pause, go back or change how long each photo stays on screen.</li>
        </ol>
      </section>

      <section style={{ ...card, marginBottom: 0 }}>
        <h2 style={h2}>Good to know</h2>
        <ul style={{ ...p, margin: 0, paddingLeft: 20 }}>
          <li>Delete a photo in <Link href={pagePath(pageId, '/guest-photos')} style={{ color: '#B6584A', fontWeight: 600 }}>Guest Photos</Link> and it leaves the slideshow within a few seconds.</li>
          <li>Print the QR code from Guest Photos for the tables too, so more guests share their photos.</li>
          <li>If your page has a password, enter it once on the screen&rsquo;s browser.</li>
        </ul>
      </section>
    </div>
  );
}
