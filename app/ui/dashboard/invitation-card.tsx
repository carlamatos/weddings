import { forwardRef, type ImgHTMLAttributes } from 'react';
import { COUPLE_SAMPLE_PHOTO, INVITATION_FLOWER_TONES, INVITATION_FONTS, INVITATION_PAPERS, INVITATION_PICTURES, invitationOverlay, isInvitationPicture, readableAccent, type InvitationDesign, type InvitationDetails, type InvitationFont } from '@/app/lib/invitation';
import { findOrnament, ornamentSvg } from '@/app/lib/invitation-ornaments';
import { MONOGRAM_WREATH_SVG, monogramNames } from '@/app/lib/invitation-monogram';

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
  function InvitationCard({ design, details, qrSvg, bgImage, fonts, nameAs: Name = 'h2' }, ref) {
    const heading = fonts?.[design.headingFont] ?? INVITATION_FONTS[design.headingFont].family;
    const body = fonts?.[design.bodyFont] ?? INVITATION_FONTS[design.bodyFont].family;
    const bg = design.background;
    const useImage = bg.kind === 'image' && !!bg.imageUrl;
    const divider = findOrnament('divider', design.divider);
    const frame = findOrnament('frame', design.frame);
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
      <div ref={ref} className="invitation-card" style={{ containerType: 'inline-size', width: '100%', aspectRatio: '5 / 7', position: 'relative', overflow: 'hidden', borderRadius: 4, background: bg.color, color: design.textColor, fontFamily: body, boxShadow: '0 18px 40px -18px rgba(36,31,43,0.35)' }}>
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
        {design.layout === 'blooms' ? (
          <BloomsWords Name={Name} design={design} details={details} heading={heading} accentText={accentText} qrSvg={qrSvg} />
        ) : design.layout === 'portrait' ? (
          <PortraitWords Name={Name} design={design} details={details} heading={heading} accentText={accentText} qrSvg={qrSvg} />
        ) : design.layout === 'monogram' ? (
          <MonogramWords Name={Name} design={design} details={details} heading={heading} body={body} display={fonts?.amatic ?? INVITATION_FONTS.amatic.family} accentText={accentText} framed={!!frame} />
        ) : (
        <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: frame ? '15cqw 14cqw' : '9cqw 8cqw', ...(textLeft ? { paddingLeft: `${textLeft + 8}cqw`, paddingRight: '6cqw' } : {}), ...(box ? { padding: `${box.top}cqw ${box.right}cqw ${box.bottom}cqw ${box.left}cqw` } : {}), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: frame ? '2.2cqw' : '3cqw' }}>
          {design.eyebrow && <p style={{ margin: 0, fontSize: '3.4cqw', letterSpacing: '0.3cqw', textTransform: 'uppercase' }}>{design.eyebrow}</p>}
          <Name style={{ margin: 0, fontFamily: heading, fontWeight: 400, fontSize: '10cqw', lineHeight: 1.1, color: accentText, overflowWrap: 'anywhere' }}>{details.name}</Name>
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
              <div style={{ width: frame ? '16cqw' : '20cqw', height: frame ? '16cqw' : '20cqw', background: '#fff', padding: '1.2cqw', borderRadius: '1cqw' }} dangerouslySetInnerHTML={{ __html: qrSvg }} />
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
      <Name style={{ ...caps, fontSize: '5.4cqw', fontWeight: 600, color: accentText, lineHeight: 1.15, overflowWrap: 'anywhere' }}>{names[0]}</Name>
      {names[1] && (
        <>
          <p style={{ ...caps, display: 'flex', alignItems: 'center', gap: '2cqw', fontSize: '2.8cqw', fontWeight: 600 }}>{rule}and{rule}</p>
          <Name style={{ ...caps, fontSize: '5.4cqw', fontWeight: 600, color: accentText, lineHeight: 1.15, overflowWrap: 'anywhere' }}>{names[1]}</Name>
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
  const caps = { margin: 0, textTransform: 'uppercase', letterSpacing: '0.5cqw', fontSize: `${capsSize}cqw`, fontWeight: 400, lineHeight: 1.15, color: accentText, overflowWrap: 'anywhere' } as const;
  const italic = { margin: 0, fontStyle: 'italic', fontSize: '4.1cqw', lineHeight: 1.5 } as const;
  const photo = design.photo || COUPLE_SAMPLE_PHOTO;
  const crowded = (design.message ? 1 : 0) + (design.closing ? 1 : 0) + (design.showQr && qrSvg ? 1 : 0) > 1;
  return (
    <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: '4cqw 7cqw 7cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.6cqw' }}>
      {/* Fine paper grain over the whole card. */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: PAPER_GRAIN, opacity: 0.3, mixBlendMode: 'multiply', pointerEvents: 'none' }} />
      {/* The photo in a circle inside a fine double ring in the accent. */}
      <div style={{ position: 'relative', width: crowded ? '50cqw' : '60cqw', aspectRatio: '1', flexShrink: 0, marginBottom: '4cqw' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 1.4cqw 3cqw rgba(60,40,20,0.18)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: '-2.2cqw', borderRadius: '50%', border: `0.35cqw solid ${design.accentColor}` }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: '-3.6cqw', borderRadius: '50%', border: `0.15cqw solid ${design.accentColor}`, opacity: 0.7 }} />
      </div>
      {design.eyebrow && <p style={{ margin: 0, fontFamily: heading, fontSize: '7.5cqw', lineHeight: 1.1, color: accentText, maxWidth: '92%' }}>{design.eyebrow}</p>}
      {names.length === 2 ? (
        <Name style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', fontWeight: 400 }}>
          <span style={{ ...caps, display: 'block' }}>{names[0]}</span>
          <span style={{ display: 'block', fontFamily: heading, fontSize: '10cqw', lineHeight: 1, color: accentText, margin: '0.4cqw 0' }}>{joiner}</span>
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
      {design.message && <p style={{ ...italic, fontSize: '3.7cqw', whiteSpace: 'pre-line', maxWidth: '86%' }}>{design.message}</p>}
      {design.showQr && qrSvg && (
        <div style={{ width: '12cqw', height: '12cqw', background: '#fff', padding: '0.9cqw', borderRadius: '0.8cqw', marginTop: '0.6cqw' }} dangerouslySetInnerHTML={{ __html: qrSvg }} />
      )}
      {design.closing && <p style={{ margin: '0.6cqw 0 0', fontFamily: heading, fontSize: '7cqw', lineHeight: 1.1, color: accentText }}>{design.closing}</p>}
    </div>
  );
}

// The blooms layout's flowers: our cutouts (the Wild Flores theme's), placed
// down the right edge and in the bottom-left corner, sizes and positions in
// cqw (the card is 140cqw tall). Later ones sit on top.
const W = '/images/themes/wild-flores/';
const BLOOMS: { src: string; top?: number; bottom?: number; left?: number; right?: number; width: number; rotate: number; depth: number }[] = [
  { src: `${W}cosmos-3.webp`, top: 34, right: -15, width: 38, rotate: -24, depth: 0.8 },
  { src: `${W}cosmos-4.webp`, top: 100, right: -14, width: 42, rotate: -6, depth: 1 },
  { src: `${W}cosmos-2.webp`, top: 68, right: -4, width: 30, rotate: 32, depth: 0.9 },
  { src: `${W}cosmos-1.webp`, top: -12, right: -12, width: 52, rotate: 12, depth: 1 },
  { src: `${W}cosmos-2.webp`, top: 3, right: 42, width: 14, rotate: 48, depth: 0.7 },
  { src: `${W}cosmos-4.webp`, bottom: -8, left: -9, width: 30, rotate: 18, depth: 0.9 },
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
  const size = Math.max(9, Math.min(15, 150 / Math.max(8, details.name.length)));
  return (
    <>
      {/* A soft light from the top left. */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 15% 20%, rgba(255,255,255,0.75), rgba(255,255,255,0) 60%)' }} />
      {BLOOMS.map((b, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={b.src} alt="" aria-hidden="true" loading="lazy" decoding="async"
          style={{
            position: 'absolute', width: `${b.width}cqw`, height: 'auto', pointerEvents: 'none',
            ...(b.top !== undefined ? { top: `${b.top}cqw` } : { bottom: `${b.bottom}cqw` }),
            ...(b.right !== undefined ? { right: `${b.right}cqw` } : { left: `${b.left}cqw` }),
            transform: `rotate(${b.rotate}deg)`,
            filter: `${tone} drop-shadow(${0.5 * b.depth}cqw ${1.2 * b.depth}cqw ${1.2 * b.depth}cqw rgba(90,55,40,0.32)) drop-shadow(0 ${0.35 * b.depth}cqw ${0.35 * b.depth}cqw rgba(90,55,40,0.25))`,
          }} />
      ))}
      <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: '10cqw 38cqw 12cqw 7cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '2cqw' }}>
        {design.eyebrow && <p style={{ ...caps, fontSize: '2.7cqw', lineHeight: 1.5 }}>{design.eyebrow}</p>}
        <Name style={{ margin: 0, fontFamily: heading, fontWeight: 400, fontSize: `${size}cqw`, lineHeight: 1.05, color: accentText, overflowWrap: 'anywhere' }}>{details.name}</Name>
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
          <div style={{ width: '13cqw', height: '13cqw', background: '#fff', padding: '0.9cqw', borderRadius: '0.8cqw' }} dangerouslySetInnerHTML={{ __html: qrSvg }} />
        )}
        {design.closing && <p style={{ margin: 0, fontFamily: heading, fontSize: '5.4cqw', lineHeight: 1.15, color: accentText }}>{design.closing}</p>}
      </div>
    </>
  );
}
