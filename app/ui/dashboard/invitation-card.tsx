import { forwardRef, type ImgHTMLAttributes } from 'react';
import { COUPLE_SAMPLE_PHOTO, INVITATION_FLOWER_TONES, INVITATION_FONTS, INVITATION_PAPERS, INVITATION_PICTURES, invitationOverlay, isInvitationPicture, readableAccent, type InvitationDesign, type InvitationDetails, type InvitationFont } from '@/app/lib/invitation';
import { findOrnament, ornamentSvg } from '@/app/lib/invitation-ornaments';
import { MONOGRAM_WREATH_SVG, monogramNames } from '@/app/lib/invitation-monogram';
import { mix } from '@/app/lib/invitation-envelope';

// The invitation itself (5×7 portrait). Sized with container query units
// (cqw), so the same markup looks identical in the dashboard preview and
// when printed at 5in wide. bgImage: extra attributes for the background
// photo (srcset, lazy loading) where many cards share a page. fonts: the
// font names to use instead of the Google Fonts ones (the landing pages serve
// the fonts themselves, app/ui/marketing/invitation-landing-fonts.ts).
// nameAs: 'p' where the card is a preview inside a page with its own
// headings (the "design your invitation" pages), so search engines don't
// read the sample names as one.
export const InvitationCard = forwardRef<HTMLDivElement, { design: InvitationDesign; details: InvitationDetails; qrSvg?: string; bgImage?: ImgHTMLAttributes<HTMLImageElement>; fonts?: Partial<Record<InvitationFont, string>>; nameAs?: 'h2' | 'p' }>(
  function InvitationCard({ design, details, qrSvg: rawQr, bgImage, fonts, nameAs: Name = 'h2' }, ref) {
    // The QR code printed straight on the paper in the text colour, no white box.
    const qrSvg = rawQr ? blendQr(rawQr) : undefined;
    const heading = fonts?.[design.headingFont] ?? INVITATION_FONTS[design.headingFont].family;
    const body = fonts?.[design.bodyFont] ?? INVITATION_FONTS[design.bodyFont].family;
    const bg = design.background;
    const useImage = bg.kind === 'image' && !!bg.imageUrl;
    // Dividers belong to the classic layout and frames to classic and
    // monogram; the styles of their own have their own decoration.
    const divider = design.layout === 'classic' ? findOrnament('divider', design.divider) : null;
    const frame = design.layout === 'classic' || design.layout === 'monogram' ? findOrnament('frame', design.frame) : null;
    const picture = isInvitationPicture(design.picture) ? INVITATION_PICTURES[design.picture] : null;
    // Our own papers can move the words right, clear of their artwork, or
    // into the blank area (box) the artwork leaves for them.
    const paper = useImage ? INVITATION_PAPERS[bg.imageUrl] : undefined;
    const textLeft = paper?.textLeft ?? 0;
    const box = paper?.box;
    // On a photo, a colour wash strong enough for the words to read clearly.
    const overlay = invitationOverlay(design);
    // The name and closing in the accent, made readable when it's too faint.
    const accentText = readableAccent(design);

    // The host's own finished invitation, shown as it is.
    if (design.layout === 'own' && useImage) {
      return (
        <div ref={ref} className="invitation-card" style={{ containerType: 'inline-size', width: '100%', aspectRatio: '5 / 7', position: 'relative', overflow: 'hidden', borderRadius: 4, background: bg.color, boxShadow: '0 18px 40px -18px rgba(36,31,43,0.35)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bg.imageUrl} alt={details.name} {...bgImage} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      );
    }

    return (
      <div ref={ref} className="invitation-card" style={{ containerType: 'inline-size', width: '100%', aspectRatio: '5 / 7', position: 'relative', overflow: 'hidden', borderRadius: 4, background: bg.color, color: design.textColor, fontFamily: body, boxShadow: '0 18px 40px -18px rgba(36,31,43,0.35)', overflowWrap: 'normal', wordBreak: 'normal', hyphens: 'manual' }}>
        {useImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bg.imageUrl} alt="" {...bgImage} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {overlay && (
          <div style={{ position: 'absolute', inset: 0, background: overlay.color, opacity: overlay.opacity }} />
        )}
        {frame && (
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, color: design.frameColor, pointerEvents: 'none' }} dangerouslySetInnerHTML={{ __html: ornamentSvg('frame', frame) }} />
        )}
        {picture && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={picture.src} alt="" aria-hidden="true" loading="lazy" decoding="async"
            style={{
              position: 'absolute', width: `${picture.width}cqw`, height: 'auto', pointerEvents: 'none',
              transform: `rotate(${picture.rotate}deg)`, filter: 'drop-shadow(0 1cqw 1.4cqw rgba(0,0,0,0.18))',
              ...(picture.corner === 'top-right' ? { top: '5cqw', right: '5cqw' } : { bottom: '4.5cqw', left: '5.5cqw' }),
            }} />
        )}
        {design.layout === 'embossed' ? (
          <EmbossedWords Name={Name} design={design} details={details} heading={heading} body={body} qrSvg={qrSvg} />
        ) : design.layout === 'gilded' ? (
          <GildedWords Name={Name} design={design} details={details} heading={heading} qrSvg={qrSvg} />
        ) : design.layout === 'blooms' ? (
          <BloomsWords Name={Name} design={design} details={details} heading={heading} accentText={accentText} qrSvg={qrSvg} />
        ) : design.layout === 'portrait' ? (
          <PortraitWords Name={Name} design={design} details={details} heading={heading} accentText={accentText} qrSvg={qrSvg} />
        ) : design.layout === 'monogram' ? (
          <MonogramWords Name={Name} design={design} details={details} heading={heading} body={body} display={fonts?.amatic ?? INVITATION_FONTS.amatic.family} accentText={accentText} framed={!!frame} />
        ) : (
        <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: frame ? '15cqw 14cqw' : '9cqw 8cqw', ...(textLeft ? { paddingLeft: `${textLeft + 8}cqw`, paddingRight: '6cqw' } : {}), ...(box ? { padding: `${box.top}cqw ${box.right}cqw ${box.bottom}cqw ${box.left}cqw` } : {}), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: frame ? '2.2cqw' : '3cqw' }}>
          {design.eyebrow && <p style={{ margin: 0, fontSize: '3.4cqw', letterSpacing: '0.3cqw', textTransform: 'uppercase' }}>{design.eyebrow}</p>}
          <Name style={{ margin: 0, fontFamily: heading, fontWeight: 400, fontSize: `${fitWords(details.name, design.headingFont, 10, frame ? 70 : 82)}cqw`, lineHeight: 1.1, color: accentText }}>{details.name}</Name>
          {divider
            ? <div aria-hidden="true" style={{ width: '50cqw', color: design.dividerColor }} dangerouslySetInnerHTML={{ __html: ornamentSvg('divider', divider) }} />
            : <div style={{ width: '14cqw', height: '0.4cqw', background: design.accentColor, opacity: 0.8 }} />}
          {details.date && <p style={{ margin: 0, fontSize: '4.2cqw', fontWeight: 600 }}>{details.date}</p>}
          {details.time && <p style={{ margin: 0, fontSize: '3.8cqw' }}>{details.time}</p>}
          {(details.venue || details.address) && (
            <p style={{ margin: 0, fontSize: '3.6cqw', lineHeight: 1.45 }}>
              {details.venue && <strong style={{ fontWeight: 600 }}>{details.venue}</strong>}
              {details.venue && details.address && <br />}
              {details.address}
            </p>
          )}
          {details.password && <p style={{ margin: 0, fontSize: '3.4cqw' }}>{details.passwordLabel}: <strong style={{ fontWeight: 700, letterSpacing: '0.2cqw' }}>{details.password}</strong></p>}
          {design.message && <p style={{ margin: '1cqw 0 0', fontSize: '3.6cqw', lineHeight: 1.55, whiteSpace: 'pre-line', maxWidth: '86%' }}>{design.message}</p>}
          {design.showQr && qrSvg && (
            <div style={{ marginTop: '1cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4cqw' }}>
              <div style={{ width: frame ? '16cqw' : '20cqw', height: frame ? '16cqw' : '20cqw', mixBlendMode: 'multiply' }} dangerouslySetInnerHTML={{ __html: qrSvg }} />
              <p style={{ margin: 0, fontSize: '2.8cqw', opacity: 0.85, overflowWrap: 'anywhere' }}>{details.url.replace(/^https?:\/\//, '')}</p>
            </div>
          )}
          {design.closing && <p style={{ margin: '1cqw 0 0', fontFamily: heading, fontSize: '5.6cqw', color: accentText }}>{design.closing}</p>}
        </div>
        </div>
        )}
      </div>
    );
  },
);

// The monogram layout: the initials in a leaf wreath, "the WEDDING of", the
// names in capitals with "and" between rules, then the details and closing.
// display: the tall hand-lettered capitals (Amatic SC).
function MonogramWords({ Name, design, details, heading, body, display, accentText, framed }: {
  Name: 'h2' | 'p'; design: InvitationDesign; details: InvitationDetails; heading: string; body: string; display: string; accentText: string; framed: boolean;
}) {
  const { names, initials } = monogramNames(details.name);
  const caps = { margin: 0, textTransform: 'uppercase', letterSpacing: '0.25cqw' } as const;
  const rule = <span style={{ flex: '0 0 9cqw', height: '0.25cqw', background: accentText, opacity: 0.7 }} />;
  return (
    <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: framed ? '13cqw 13cqw' : '7cqw 8cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.6cqw', fontFamily: body }}>
      <div style={{ position: 'relative', width: '34cqw', color: accentText, marginBottom: '1cqw' }}>
        <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: MONOGRAM_WREATH_SVG }} />
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: display, fontSize: '11cqw', fontWeight: 700, lineHeight: 1 }}>{initials}</span>
      </div>
      {design.eyebrow && <p style={{ ...caps, fontSize: '2.6cqw', letterSpacing: '0.15cqw', fontWeight: 600 }}>{design.eyebrow}</p>}
      <p aria-hidden="true" style={{ margin: '0 0 0.6cqw', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '1.2cqw', color: accentText, lineHeight: 1 }}>
        <span style={{ fontFamily: heading, fontSize: '9cqw' }}>the</span>
        <span style={{ fontFamily: display, fontSize: '17cqw', fontWeight: 700, letterSpacing: '0.3cqw' }}>WEDDING</span>
        <span style={{ fontFamily: heading, fontSize: '9cqw' }}>of</span>
      </p>
      <Name style={{ ...caps, fontSize: `${fitWords(names[0], design.bodyFont, 5.4, 72, 1.2)}cqw`, fontWeight: 600, color: accentText, lineHeight: 1.15 }}>{names[0]}</Name>
      {names[1] && (
        <>
          <p style={{ ...caps, display: 'flex', alignItems: 'center', gap: '2cqw', fontSize: '2.8cqw', fontWeight: 600 }}>{rule}and{rule}</p>
          <Name style={{ ...caps, fontSize: `${fitWords(names[1], design.bodyFont, 5.4, 72, 1.2)}cqw`, fontWeight: 600, color: accentText, lineHeight: 1.15 }}>{names[1]}</Name>
        </>
      )}
      <div style={{ marginTop: '1.4cqw' }}>
        {details.date && <p style={{ ...caps, fontSize: '3.3cqw', fontWeight: 600 }}>{details.date}</p>}
        {details.time && <p style={{ ...caps, fontSize: '3.3cqw', fontWeight: 600 }}>{details.time}</p>}
      </div>
      {(details.venue || details.address) && (
        <div>
          {details.venue && <p style={{ ...caps, fontSize: '3.3cqw', fontWeight: 600 }}>{details.venue}</p>}
          {details.address && <p style={{ ...caps, fontSize: '3.3cqw', fontWeight: 600 }}>{details.address}</p>}
        </div>
      )}
      {details.password && <p style={{ margin: 0, fontSize: '3.2cqw' }}>{details.passwordLabel}: <strong style={{ fontWeight: 700, letterSpacing: '0.2cqw' }}>{details.password}</strong></p>}
      {design.message && <p style={{ margin: 0, fontSize: '3.3cqw', lineHeight: 1.5, whiteSpace: 'pre-line', maxWidth: '86%' }}>{design.message}</p>}
      {design.closing && <p style={{ ...caps, marginTop: '1cqw', fontSize: '3.3cqw', fontWeight: 600, color: accentText }}>{design.closing}</p>}
    </div>
  );
}

// A fine paper grain (SVG noise), laid over the portrait layout's paper.
const PAPER_GRAIN = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.28  0 0 0 0.22 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>')}")`;

// The portrait layout: the couple's photo in a circle inside a fine double
// ring in the accent colour, on paper with a fine grain; the line above the
// name in calligraphy, the names in
// spaced capitals with "and" in calligraphy between, then the details in
// italics. One name (not two people) is set whole.
function PortraitWords({ Name, design, details, heading, accentText, qrSvg }: {
  Name: 'h2' | 'p'; design: InvitationDesign; details: InvitationDetails; heading: string; accentText: string; qrSvg?: string;
}) {
  const { names, joiner } = monogramNames(details.name);
  const longest = Math.max(...names.map((n) => n.length));
  const capsSize = Math.max(5, Math.min(8, 88 / longest));
  // Everything must fit under the photo, which always shows whole: guess the
  // height the words take (lines of each, at their sizes), shrink the photo a
  // little, then the words (k) until it all fits the card.
  const lines = (text: string, size: number, charW: number, width = 84) =>
    text.split('\n').reduce((n, part) => n + Math.max(1, Math.ceil((part.length * size * charW) / width)), 0);
  const items: number[] = [];
  if (design.eyebrow) items.push(lines(design.eyebrow, 7.5, 0.3) * 7.5 * 1.1);
  items.push(names.length === 2 ? capsSize * 1.15 * 2 + 10.8 : lines(names[0], capsSize, 0.8) * capsSize * 1.15);
  const when = [details.date, details.time].filter(Boolean).join(' · ');
  const where = [details.venue, details.address].filter(Boolean).join(', ');
  items.push(((when ? lines(when, 4.1, 0.4) : 0) + (where ? lines(where, 4.1, 0.4) : 0)) * 4.1 * 1.5 + 1.6);
  if (details.password) items.push(4.5);
  if (design.message) items.push(lines(design.message, 3.7, 0.4, 72) * 3.7 * 1.5);
  if (design.showQr && qrSvg) items.push(12.6);
  if (design.closing) items.push(lines(design.closing, 7, 0.3) * 7 * 1.1 + 0.6);
  // (The guess runs a little high, which is the safe side: the photo takes up any room left.)
  const words = items.reduce((a, b) => a + b, 0) + items.length * 1.6;
  const room = 140 - 9; // the card less its top and bottom padding
  // The photo gives way first (down to 34cqw, by flex below), then the words.
  const k = Math.max(0.5, Math.min(1, (room - 11.2 - 34) / words));
  const caps = { margin: 0, textTransform: 'uppercase', letterSpacing: '0.5cqw', fontSize: `${capsSize * k}cqw`, fontWeight: 400, lineHeight: 1.15, color: accentText } as const;
  const italic = { margin: 0, fontStyle: 'italic', fontSize: `${4.1 * k}cqw`, lineHeight: 1.5 } as const;
  const photo = design.photo || COUPLE_SAMPLE_PHOTO;
  return (
    <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: '4cqw 7cqw 7cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.6cqw' }}>
      {/* Fine paper grain over the whole card. */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: PAPER_GRAIN, opacity: 0.3, mixBlendMode: 'multiply', pointerEvents: 'none' }} />
      {/* The photo in a circle inside a fine double ring in the accent. */}
      {/* The photo takes the room the words leave, from 34 to 60cqw: always
          whole, never pushed off the card. */}
      <div style={{ flex: '1 1 60cqw', minHeight: '34cqw', maxHeight: '60cqw', alignSelf: 'stretch', display: 'flex', justifyContent: 'center', margin: '3.6cqw 0 4cqw' }}>
      <div style={{ position: 'relative', height: '100%', aspectRatio: '1' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 1.4cqw 3cqw rgba(60,40,20,0.18)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: '-2.2cqw', borderRadius: '50%', border: `0.35cqw solid ${design.accentColor}` }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: '-3.6cqw', borderRadius: '50%', border: `0.15cqw solid ${design.accentColor}`, opacity: 0.7 }} />
      </div>
      </div>
      {design.eyebrow && <p style={{ margin: 0, fontFamily: heading, fontSize: `${7.5 * k}cqw`, lineHeight: 1.1, color: accentText, maxWidth: '92%' }}>{design.eyebrow}</p>}
      {names.length === 2 ? (
        <Name style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', fontWeight: 400 }}>
          <span style={{ ...caps, display: 'block' }}>{names[0]}</span>
          <span style={{ display: 'block', fontFamily: heading, fontSize: `${10 * k}cqw`, lineHeight: 1, color: accentText, margin: '0.4cqw 0' }}>{joiner}</span>
          <span style={{ ...caps, display: 'block' }}>{names[1]}</span>
        </Name>
      ) : (
        <Name style={caps}>{names[0]}</Name>
      )}
      <div style={{ marginTop: '1.6cqw' }}>
        {(details.date || details.time) && <p style={italic}>{[details.date, details.time].filter(Boolean).join(' · ')}</p>}
        {(details.venue || details.address) && <p style={italic}>{[details.venue, details.address].filter(Boolean).join(', ')}</p>}
      </div>
      {details.password && <p style={{ margin: 0, fontSize: '3cqw' }}>{details.passwordLabel}: <strong style={{ fontWeight: 700, letterSpacing: '0.2cqw' }}>{details.password}</strong></p>}
      {design.message && <p style={{ ...italic, fontSize: `${3.7 * k}cqw`, whiteSpace: 'pre-line', maxWidth: '86%' }}>{design.message}</p>}
      {design.showQr && qrSvg && (
        <div style={{ width: '12cqw', height: '12cqw', mixBlendMode: 'multiply', marginTop: '0.6cqw' }} dangerouslySetInnerHTML={{ __html: qrSvg }} />
      )}
      {design.closing && <p style={{ margin: '0.6cqw 0 0', fontFamily: heading, fontSize: `${7 * k}cqw`, lineHeight: 1.1, color: accentText }}>{design.closing}</p>}
    </div>
  );
}

// The blooms layout's flowers: our cutouts (the Wild Flores theme's), placed
// down the right edge and in the bottom-left corner, sizes and positions in
// cqw (the card is 140cqw tall). Later ones sit on top.
const W = '/images/themes/wild-flores/';
type Bloom = { src: string; top?: number; bottom?: number; left?: number; right?: number; width: number; rotate: number; depth: number; height?: number; mask?: string };
const BLOOMS: Bloom[] = [
  { src: `${W}cosmos-3.webp`, top: 34, right: -15, width: 38, rotate: -24, depth: 0.8 },
  { src: `${W}cosmos-4.webp`, top: 100, right: -14, width: 42, rotate: -6, depth: 1 },
  { src: `${W}cosmos-2.webp`, top: 68, right: -4, width: 30, rotate: 32, depth: 0.9 },
  { src: `${W}cosmos-1.webp`, top: -12, right: -12, width: 52, rotate: 12, depth: 1 },
  { src: `${W}cosmos-2.webp`, top: 3, right: 42, width: 14, rotate: 48, depth: 0.7 },
  { src: `${W}cosmos-4.webp`, bottom: -8, left: -9, width: 30, rotate: 18, depth: 0.9 },
];

// The White Roses designs: The Day's white rose photo down the right edge,
// fading into the paper (no shadow: depth 0).
const ROSES: Bloom[] = [
  { src: '/images/themes/the-day/photo-2.jpeg', top: 0, right: 0, width: 40, height: 140, rotate: 0, depth: 0, mask: 'linear-gradient(to left, rgba(0,0,0,0.9) 30%, transparent 100%)' },
];

// The blooms layout: soft paper flowers raised off the card (layered
// shadows), and the words to the left: the event name large in the heading font, the line
// above it in spaced capitals, the date between two fine rules.
function BloomsWords({ Name, design, details, heading, accentText, qrSvg }: {
  Name: 'h2' | 'p'; design: InvitationDesign; details: InvitationDetails; heading: string; accentText: string; qrSvg?: string;
}) {
  const tone = INVITATION_FLOWER_TONES[design.flowers] ?? INVITATION_FLOWER_TONES.peach;
  const caps = { margin: 0, textTransform: 'uppercase', letterSpacing: '0.35cqw' } as const;
  const rule = <div style={{ width: '100%', height: '0.25cqw', background: design.textColor, opacity: 0.55 }} />;
  const roses = design.flowers === 'roses';
  // The words' column: White Roses' photo fades out, so its words have more room.
  const column = roses ? 64 : 55;
  const size = fitWords(details.name, design.headingFont, Math.max(9, Math.min(15, 150 / Math.max(8, details.name.length))) * (roses ? 0.82 : 1), column);
  return (
    <>
      {/* A soft light from the top left. */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 15% 20%, rgba(255,255,255,0.75), rgba(255,255,255,0) 60%)' }} />
      {(roses ? ROSES : BLOOMS).map((b, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={b.src} alt="" aria-hidden="true" loading="lazy" decoding="async"
          style={{
            position: 'absolute', width: `${b.width}cqw`, height: 'auto', pointerEvents: 'none',
            ...(b.top !== undefined ? { top: `${b.top}cqw` } : { bottom: `${b.bottom}cqw` }),
            ...(b.right !== undefined ? { right: `${b.right}cqw` } : { left: `${b.left}cqw` }),
            transform: `rotate(${b.rotate}deg)`,
            ...(b.height ? { height: `${b.height}cqw`, objectFit: 'cover' as const } : {}),
            ...(b.mask ? { maskImage: b.mask, WebkitMaskImage: b.mask } : {}),
            filter: b.depth === 0 ? tone : `${tone} drop-shadow(${0.5 * b.depth}cqw ${1.2 * b.depth}cqw ${1.2 * b.depth}cqw rgba(90,55,40,0.32)) drop-shadow(0 ${0.35 * b.depth}cqw ${0.35 * b.depth}cqw rgba(90,55,40,0.25))`,
          }} />
      ))}
      <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: roses ? '10cqw 30cqw 12cqw 6cqw' : '10cqw 38cqw 12cqw 7cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '2cqw' }}>
        {design.eyebrow && <p style={{ ...caps, fontSize: '2.7cqw', lineHeight: 1.5 }}>{design.eyebrow}</p>}
        <Name style={{ margin: 0, fontFamily: heading, fontWeight: 400, fontSize: `${size}cqw`, lineHeight: 1.05, color: accentText }}>{details.name}</Name>
        {(details.date || details.time) && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4cqw', marginTop: '1cqw' }}>
            {rule}
            {details.date && <p style={{ ...caps, fontSize: '3.1cqw', fontWeight: 600, color: accentText, lineHeight: 1.35 }}>{details.date}</p>}
            {rule}
            {details.time && <p style={{ ...caps, fontSize: '2.8cqw', fontWeight: 600 }}>{details.time}</p>}
          </div>
        )}
        {(details.venue || details.address) && (
          <p style={{ margin: 0, fontSize: '2.9cqw', lineHeight: 1.5 }}>
            {details.venue && <strong style={{ fontWeight: 600 }}>{details.venue}</strong>}
            {details.venue && details.address && <br />}
            {details.address}
          </p>
        )}
        {details.password && <p style={{ margin: 0, fontSize: '2.8cqw' }}>{details.passwordLabel}: <strong style={{ fontWeight: 700, letterSpacing: '0.2cqw' }}>{details.password}</strong></p>}
        {design.message && <p style={{ margin: 0, fontSize: '2.9cqw', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{design.message}</p>}
        {design.showQr && qrSvg && (
          <div style={{ width: '13cqw', height: '13cqw', mixBlendMode: 'multiply' }} dangerouslySetInnerHTML={{ __html: qrSvg }} />
        )}
        {design.closing && <p style={{ margin: 0, fontFamily: heading, fontSize: '5.4cqw', lineHeight: 1.15, color: accentText }}>{design.closing}</p>}
      </div>
    </>
  );
}

// The gilded layout (White & Gold): a fine frame in a gold sheen, the
// couple's initials in calligraphy at the top (the host's, or the first
// letters of the names), then everything in spaced capitals in the gold:
// the names largest with "and" between, the date a little larger.
function GildedWords({ Name, design, details, heading, qrSvg }: {
  Name: 'h2' | 'p'; design: InvitationDesign; details: InvitationDetails; heading: string; qrSvg?: string;
}) {
  const { names, joiner } = monogramNames(details.name);
  const letters = (design.initials || names.map((n) => n.charAt(0)).join('')).replace(/[^\p{L}]/gu, '').toUpperCase().slice(0, 3).split('');
  const gold = design.accentColor;
  const sheen = `linear-gradient(135deg, ${gold}, ${mix(gold, '#FFFFFF', 0.55)} 35%, ${gold} 55%, ${mix(gold, '#FFFFFF', 0.4)} 80%, ${gold})`;
  const longest = Math.max(...names.map((n) => n.length));
  const caps = { margin: 0, textTransform: 'uppercase', letterSpacing: '0.45cqw', lineHeight: 1.65, fontWeight: 600, color: design.textColor } as const;
  return (
    <>
      <div aria-hidden="true" style={{ position: 'absolute', inset: '6cqw', border: '0.55cqw solid transparent', borderImage: `${sheen} 1`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: '11cqw 11cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.6cqw' }}>
        {letters.length > 0 && (
          // Two initials overlap on a slant, the second lower and to the right.
          <div aria-hidden="true" style={{ position: 'relative', width: letters.length === 2 ? '46cqw' : 'auto', height: '21cqw', marginBottom: '2cqw', fontFamily: heading, fontSize: '17cqw', lineHeight: 1, color: gold }}>
            {letters.length === 2 ? (
              <>
                <span style={{ position: 'absolute', left: '2cqw', top: 0 }}>{letters[0]}</span>
                <span style={{ position: 'absolute', right: '2cqw', top: '6cqw' }}>{letters[1]}</span>
              </>
            ) : (
              <span style={{ letterSpacing: '4cqw', marginRight: '-4cqw' }}>{letters.join('')}</span>
            )}
          </div>
        )}
        {design.eyebrow && <p style={{ ...caps, fontSize: '3.1cqw', maxWidth: '88%' }}>{design.eyebrow}</p>}
        {names.length === 2 ? (
          <Name style={{ margin: '1.4cqw 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4cqw', fontWeight: 600 }}>
            <span style={{ ...caps, fontSize: `${Math.max(4.2, Math.min(5.6, 66 / longest))}cqw`, letterSpacing: '0.6cqw', lineHeight: 1.2 }}>{names[0]}</span>
            <span style={{ ...caps, fontSize: '3.4cqw', lineHeight: 1 }}>{joiner}</span>
            <span style={{ ...caps, fontSize: `${Math.max(4.2, Math.min(5.6, 66 / longest))}cqw`, letterSpacing: '0.6cqw', lineHeight: 1.2 }}>{names[1]}</span>
          </Name>
        ) : (
          <Name style={{ ...caps, margin: '1.4cqw 0', fontSize: `${Math.max(4.2, Math.min(6, 70 / longest))}cqw`, letterSpacing: '0.6cqw', lineHeight: 1.3 }}>{names[0]}</Name>
        )}
        {design.message && <p style={{ ...caps, fontSize: '3cqw', whiteSpace: 'pre-line', maxWidth: '92%' }}>{design.message}</p>}
        {details.date && <p style={{ ...caps, marginTop: '1.4cqw', fontSize: '4.2cqw', letterSpacing: '0.5cqw', lineHeight: 1.3 }}>{details.date}</p>}
        {details.time && <p style={{ ...caps, fontSize: '3cqw' }}>{details.time}</p>}
        {(details.venue || details.address) && (
          <div>
            {details.venue && <p style={{ ...caps, fontSize: '3cqw' }}>{details.venue}</p>}
            {details.address && <p style={{ ...caps, fontSize: '3cqw' }}>{details.address}</p>}
          </div>
        )}
        {details.password && <p style={{ ...caps, fontSize: '2.8cqw' }}>{details.passwordLabel}: {details.password}</p>}
        {design.showQr && qrSvg && (
          <div style={{ width: '12cqw', height: '12cqw', mixBlendMode: 'multiply' }} dangerouslySetInnerHTML={{ __html: qrSvg }} />
        )}
        {design.closing && <p style={{ ...caps, marginTop: '0.6cqw', fontSize: '2.8cqw' }}>{design.closing}</p>}
      </div>
    </>
  );
}

// The Victorian ornaments of the embossed layout, in a 100 x 140 box (the
// card), no ruled frame: a long flourish across the top and bottom (a spear
// and teardrop in the middle, a curl either side sweeping out into an arch,
// a dot at each end). Drawn in the paper's colour and raised by two shadows
// (EmbossedWords), so they read as white on white.
const VICTORIAN_BAR_HALF = (
  <>
    <path className="v-fill" d="M.5 -1.3C2.6 -3.6 4.4 -4.4 6 -4.4C5 -2.8 3.2 -1.4 .5 -1.3Z" />
    <path d="M1.6 5.2C1 1 3.4 -2.4 6.4 -2.3C8.9 -2.2 9.8 .6 8.4 2C7.3 3 5.7 2.4 5.9 1.1" />
    <circle className="v-fill" cx="6.6" cy=".3" r=".85" />
    <path d="M1.6 5.2C3.6 7.6 9 7.6 13.4 4.8C17.6 2.1 20.4 -2.4 26.4 -2.7C31.4 -2.9 34.6 -.4 35.6 1.8" />
    <path className="v-fill" d="M35.6 1.8C35.2 2.9 34 3.2 33.2 2.5C34.2 2.4 34.9 2.1 35.6 1.8Z" />
    <circle className="v-fill" cx="42.4" cy="4.3" r="1" />
  </>
);
const VICTORIAN_BAR = (
  <>
    <path className="v-fill" d="M0 -9C1.3 -5.6 1.7 -3.2 0 0C-1.7 -3.2 -1.3 -5.6 0 -9Z" />
    <path className="v-fill" d="M0 1.2C.7 2.8 .6 3.9 0 4.8C-.6 3.9 -.7 2.8 0 1.2Z" />
    <circle className="v-fill" cy="6.8" r="1.05" />
    {VICTORIAN_BAR_HALF}
    <g transform="scale(-1 1)">{VICTORIAN_BAR_HALF}</g>
  </>
);
// Cotton paper with a sandy tooth for the embossed layout: the noise lit
// from the top left (the little hills and hollows of the paper), a soft
// mottling, and a sprinkle of fine warm flecks. Laid over the paper and the
// frame in multiply, under the ink.
const SANDY_PAPER = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="t" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" stitchTiles="stitch" result="n"/><feDiffuseLighting in="n" surfaceScale="0.8" lighting-color="#ffffff" diffuseConstant="1.02"><feDistantLight azimuth="225" elevation="58"/></feDiffuseLighting></filter><filter id="m"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="9" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0.16 0"/></filter><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="1" seed="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0 0.32  0 0 0 9 -6.1"/></filter><rect width="100%" height="100%" filter="url(#t)"/><rect width="100%" height="100%" filter="url(#m)"/><rect width="100%" height="100%" filter="url(#f)" opacity="0.5"/></svg>')}")`;

// The embossed layout (Victorian Emboss): the frame above raised in the
// paper, the words centred in it in ink: italic lines, the names in large
// light capitals with a small italic "and" between.
function EmbossedWords({ Name, design, details, heading, body, qrSvg }: {
  Name: 'h2' | 'p'; design: InvitationDesign; details: InvitationDetails; heading: string; body: string; qrSvg?: string;
}) {
  const { names, joiner } = monogramNames(details.name);
  const paper = design.background.color;
  const raised = mix(paper, '#FFFFFF', 0.5);
  const longest = Math.max(...names.map((n) => n.length));
  const nameSize = `${Math.max(5.4, Math.min(9, 76 / longest))}cqw`;
  const line = { margin: 0, fontFamily: body, fontStyle: 'italic', fontSize: '3.05cqw', letterSpacing: '0.22cqw', lineHeight: 1.6, color: design.textColor } as const;
  const big = { margin: 0, fontFamily: heading, fontWeight: 400, textTransform: 'uppercase', fontSize: nameSize, letterSpacing: '0.25cqw', lineHeight: 1.05, color: design.textColor } as const;
  return (
    <>
      <svg aria-hidden="true" viewBox="0 0 100 140" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible',
          filter: `drop-shadow(0 0 0.05cqw rgba(0,0,0,0.28)) drop-shadow(-0.12cqw -0.12cqw 0.06cqw rgba(255,255,255,0.9)) drop-shadow(0.18cqw 0.25cqw 0.15cqw rgba(0,0,0,0.3))` }}>
        <style>{`.v-orn{fill:none;stroke:${raised};stroke-width:.75;stroke-linecap:round;stroke-linejoin:round}.v-orn .v-fill{fill:${raised};stroke-width:.25}`}</style>
        <g className="v-orn">
          <g transform="translate(50 18)">{VICTORIAN_BAR}</g>
          <g transform="translate(50 122) scale(1 -1)">{VICTORIAN_BAR}</g>
        </g>
      </svg>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: SANDY_PAPER, backgroundSize: '300px 300px', opacity: 0.3, mixBlendMode: 'multiply', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: '25cqw 21cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.2cqw' }}>
        {design.eyebrow && <p style={{ ...line, marginBottom: '3cqw' }}>{design.eyebrow}</p>}
        {names.length === 2 ? (
          <Name style={{ margin: '0 0 3cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1cqw', fontWeight: 400 }}>
            <span style={big}>{names[0]}</span>
            <span style={{ ...line, fontSize: '2.8cqw' }}>{joiner}</span>
            <span style={big}>{names[1]}</span>
          </Name>
        ) : (
          <Name style={{ ...big, marginBottom: '3cqw' }}>{names[0]}</Name>
        )}
        {design.message && <p style={{ ...line, whiteSpace: 'pre-line' }}>{design.message}</p>}
        {(details.date || details.time) && (
          <div>
            {details.date && <p style={line}>{details.date}</p>}
            {details.time && <p style={line}>{details.time}</p>}
          </div>
        )}
        {(details.venue || details.address) && (
          <div style={{ marginTop: '2cqw' }}>
            {details.venue && <p style={line}>{details.venue}</p>}
            {details.address && <p style={line}>{details.address}</p>}
          </div>
        )}
        {details.password && <p style={{ ...line, fontSize: '2.7cqw' }}>{details.passwordLabel}: {details.password}</p>}
        {design.showQr && qrSvg && (
          <div style={{ width: '12cqw', height: '12cqw', mixBlendMode: 'multiply' }} dangerouslySetInnerHTML={{ __html: qrSvg }} />
        )}
        {design.closing && <p style={{ ...line, marginTop: '2cqw' }}>{design.closing}</p>}
      </div>
    </>
  );
}

// The QR code on the paper itself: the white squares dropped and the dark
// ones in the text colour (currentColor), so it blends into the design.
function blendQr(svg: string): string {
  return svg.replace(/<path fill="#ffffff"[^>]*\/>/i, '').replace(/(stroke|fill)="#241f2b"/gi, '$1="currentColor"');
}

// About how wide a letter is in each font, as a share of the font size, to
// size a line so its longest word fits the width: words are never broken
// across two lines.
const CHAR_WIDTH: Partial<Record<InvitationFont, number>> = {
  'great-vibes': 0.42, 'mrs-saint-delafield': 0.4, parisienne: 0.45, 'dancing-script': 0.5, playfair: 0.56, cormorant: 0.5,
  cinzel: 0.78, 'libre-baskerville': 0.62, montserrat: 0.66, josefin: 0.56, lato: 0.56, poppins: 0.66, 'space-grotesk': 0.62,
  fredoka: 0.6, creepster: 0.6, amatic: 0.36,
};
// The size (cqw) for text in this font, at most max, so its longest word fits
// width (cqw); caps: how much wider capitals (and their spacing) run.
function fitWords(text: string, font: InvitationFont, max: number, width: number, caps = 1): number {
  const longest = Math.max(1, ...text.split(/\s+/).map((w) => w.length));
  return Math.min(max, width / (longest * (CHAR_WIDTH[font] ?? 0.6) * caps));
}
