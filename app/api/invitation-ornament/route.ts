import sharp from 'sharp';
import { findOrnament, ornamentSvg, type OrnamentKind } from '@/app/lib/invitation-ornaments';

// An invitation decoration as a PNG, for the invitation email (email apps
// don't show inline SVG). /api/invitation-ornament?kind=divider&id=…&color=RRGGBB
// Drawn at twice the size it's shown, for sharp screens. The same URL always
// gives the same image, so it's cached for good.

const WIDTH: Record<OrnamentKind, number> = { divider: 480, frame: 1000 };

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const kind = params.get('kind');
  const color = params.get('color') ?? '';
  if ((kind !== 'divider' && kind !== 'frame') || !/^[0-9a-fA-F]{6}$/.test(color)) {
    return new Response('Not found', { status: 404 });
  }
  const ornament = findOrnament(kind, params.get('id'));
  if (!ornament) return new Response('Not found', { status: 404 });

  const png = await sharp(Buffer.from(ornamentSvg(kind, ornament, `#${color}`, WIDTH[kind]))).png().toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
