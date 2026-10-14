import sharp from 'sharp';
import { fetchPageSettings, fetchUserPage } from '@/app/lib/data';
import { isPageLocked } from '@/app/lib/page-password';
import { isPageOffline } from '@/app/lib/page-status';
import { OG_HEIGHT, OG_WIDTH, socialImageFor } from '@/app/lib/share';
import { siteUrl } from '@/app/lib/site-url';

// The link-preview image for an event page (its og:image): the page's top
// banner, cropped to the 1.91:1 card every network draws and saved as a
// small JPEG. Owners upload multi-megabyte photos, and WhatsApp, iMessage
// and others silently drop a preview whose image is too large, leaving
// just the bare link.

const MAX_SOURCE_BYTES = 30 * 1024 * 1024;

// Only images on this site or in our upload storage are fetched: an owner
// sets the banner URL, so anything else is just linked to, never fetched.
function isFetchable(src: string): boolean {
  try {
    const url = new URL(src);
    return url.origin === new URL(siteUrl()).origin
      || (url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com'));
  } catch {
    return false;
  }
}

const fallback = () => Response.redirect(`${siteUrl()}/opengraph-image.png`, 302);

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const page = await fetchUserPage(slug);
  if (!page || isPageOffline(page.status)) return fallback();
  // A password-protected page shows nothing of the event, its banner included.
  const settings = await fetchPageSettings(page.id);
  if (isPageLocked(settings, page.plan_type === 'paid')) return fallback();

  const src = socialImageFor(page);
  if (!isFetchable(src)) return Response.redirect(src, 302);

  try {
    const res = await fetch(src, { signal: AbortSignal.timeout(8000) });
    const size = Number(res.headers.get('content-length') ?? 0);
    if (!res.ok || size > MAX_SOURCE_BYTES) return Response.redirect(src, 302);
    const input = Buffer.from(await res.arrayBuffer());
    if (input.byteLength > MAX_SOURCE_BYTES) return Response.redirect(src, 302);
    const jpeg = await sharp(input, { limitInputPixels: 120_000_000 })
      .rotate()
      .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'centre' })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 80, mozjpeg: true, progressive: true })
      .toBuffer();
    return new Response(new Uint8Array(jpeg), {
      headers: {
        'Content-Type': 'image/jpeg',
        // The URL carries a version of the banner (?v=), so a new banner
        // gets a new URL and this one can be cached for a long time.
        'Cache-Control': 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to build link-preview image:', error);
    return Response.redirect(src, 302);
  }
}
