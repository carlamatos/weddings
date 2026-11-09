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
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
export const metadata: Metadata = { title: 'Photo Slideshow' };

const card: React.CSSProperties = { background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: '20px 22px', marginBottom: 20, maxWidth: 760 };
const h2: React.CSSProperties = { fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 8px' };
const p: React.CSSProperties = { fontSize: 14, color: '#6B6470', margin: '0 0 14px', lineHeight: 1.6 };

// Photo Slideshow (Plus): guests' photos on a TV or projector at the venue,
// at <page>/slideshow. Nothing to set up beyond Guest Photos: the host opens
// the link on the screen. Works for the owner on a free page as a preview.
export default async function SlideshowDashboardPage({ params }: { params: Promise<{ pageId: string }> }) {
  const d = await getDashText();
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
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.slideshow.photoSlideshow}</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          {d.slideshow.putYourGuestsPhotosOn}
          {' '}<HelpLink guide="show-a-photo-slideshow" />
        </p>
      </div>

      {!photosOn && (
        <div role="status" style={{ ...card, background: '#FFF8E7', borderColor: '#E8D9A8', color: '#6B5200', fontSize: 14, lineHeight: 1.6 }}>
          {rich(d.slideshow.guestPhotosIsOffGuests, { t0: (s) => <strong>{s}</strong>, t1: (s) => <Link href={pagePath(pageId, '/guest-photos')} style={{ color: '#B6584A', fontWeight: 600 }}>{s}</Link> })}
        </div>
      )}

      <section style={card}>
        <h2 style={h2}>{d.slideshow.yourSlideshow}</h2>
        <p style={p}>
          {count === 0 ? d.slideshow.noPhotosYetUntilThe
            : fill(d.slideshow.photoSoFar, { count, v1: count === 1 ? '' : 's', v2: paid ? '' : d.slideshow.openItToTry })}
        </p>
        <SlideshowLauncher url={url} />
      </section>

      <section style={card}>
        <h2 style={h2}>{d.slideshow.howToPutItOn}</h2>
        <ol style={{ ...p, margin: 0, paddingLeft: 20 }}>
          <li>{d.slideshow.connectALaptopToThe}</li>
          <li>{rich(d.slideshow.openTheSlideshowLinkAnd, { t0: (s) => <strong>{s}</strong> })}</li>
          <li>{d.slideshow.leaveItRunningItKeeps}</li>
          <li>{d.slideshow.moveTheMouseToPause}</li>
        </ol>
      </section>

      <section style={{ ...card, marginBottom: 0 }}>
        <h2 style={h2}>{d.slideshow.goodToKnow}</h2>
        <ul style={{ ...p, margin: 0, paddingLeft: 20 }}>
          <li>{rich(d.slideshow.deleteAPhotoInGuest, { t0: (s) => <Link href={pagePath(pageId, '/guest-photos')} style={{ color: '#B6584A', fontWeight: 600 }}>{s}</Link> })}</li>
          <li>{d.slideshow.printTheQrCodeFrom}</li>
          <li>{d.slideshow.ifYourPageHasA}</li>
        </ul>
      </section>
    </div>
  );
}
