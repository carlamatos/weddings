import sharp from 'sharp';
import { envelopeSvg, isEnvelopeSeal } from '@/app/lib/invitation-envelope';

// The sealed envelope as a PNG, for the invitation email (email apps don't
// show inline SVG). /api/invitation-envelope?c=RRGGBB&s=RRGGBB&e=heart:
// the envelope colour, the seal colour and the seal's emblem. Drawn at twice
// the size it's shown. The same URL always gives the same image, so it's
// cached for good.
const HEX = /^[0-9a-fA-F]{6}$/;

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const c = params.get('c') ?? '';
  const s = params.get('s') ?? '';
  const e = params.get('e');
  if (!HEX.test(c) || !HEX.test(s) || !isEnvelopeSeal(e)) return new Response('Not found', { status: 404 });
  const svg = envelopeSvg({ color: `#${c}`, sealColor: `#${s}`, seal: e }, 1040);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
