import { forwardRef, type ImgHTMLAttributes } from 'react';
import { INVITATION_FONTS, INVITATION_PAPERS, INVITATION_PICTURES, invitationOverlay, isInvitationPicture, readableAccent, type InvitationDesign, type InvitationDetails, type InvitationFont } from '@/app/lib/invitation';
import { findOrnament, ornamentSvg } from '@/app/lib/invitation-ornaments';
import { MONOGRAM_WREATH_SVG, monogramNames } from '@/app/lib/invitation-monogram';

// The invitation itself (5×7 portrait). Sized with container query units
// (cqw), so the same markup looks identical in the dashboard preview and
// when printed at 5in wide. bgImage: extra attributes for the background
// photo (srcset, lazy loading) where many cards share a page. fonts: the
// font names to use instead of the Google Fonts ones (the landing pages serve
// the fonts themselves, app/ui/marketing/invitation-landing-fonts.ts).
export const InvitationCard = forwardRef<HTMLDivElement, { design: InvitationDesign; details: InvitationDetails; qrSvg?: string; bgImage?: ImgHTMLAttributes<HTMLImageElement>; fonts?: Partial<Record<InvitationFont, string>> }>(
  function InvitationCard({ design, details, qrSvg, bgImage, fonts }, ref) {
    const heading = fonts?.[design.headingFont] ?? INVITATION_FONTS[design.headingFont].family;
    const body = fonts?.[design.bodyFont] ?? INVITATION_FONTS[design.bodyFont].family;
    const bg = design.background;
    const useImage = bg.kind === 'image' && !!bg.imageUrl;
    const divider = findOrnament('divider', design.divider);
    const frame = findOrnament('frame', design.frame);
    const picture = isInvitationPicture(design.picture) ? INVITATION_PICTURES[design.picture] : null;
    // Our own papers can move the words right, clear of their artwork.
    const textLeft = useImage ? INVITATION_PAPERS[bg.imageUrl]?.textLeft ?? 0 : 0;
    // On a photo, a colour wash strong enough for the words to read clearly.
    const overlay = invitationOverlay(design);
    // The name and closing in the accent, made readable when it's too faint.
    const accentText = readableAccent(design);

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
        {design.layout === 'monogram' ? (
          <MonogramWords design={design} details={details} heading={heading} body={body} display={fonts?.amatic ?? INVITATION_FONTS.amatic.family} accentText={accentText} framed={!!frame} />
        ) : (
        <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: frame ? '15cqw 14cqw' : '9cqw 8cqw', ...(textLeft ? { paddingLeft: `${textLeft + 8}cqw`, paddingRight: '6cqw' } : {}), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: frame ? '2.2cqw' : '3cqw' }}>
          {design.eyebrow && <p style={{ margin: 0, fontSize: '3.4cqw', letterSpacing: '0.3cqw', textTransform: 'uppercase' }}>{design.eyebrow}</p>}
          <h2 style={{ margin: 0, fontFamily: heading, fontWeight: 400, fontSize: '10cqw', lineHeight: 1.1, color: accentText, overflowWrap: 'anywhere' }}>{details.name}</h2>
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
function MonogramWords({ design, details, heading, body, display, accentText, framed }: {
  design: InvitationDesign; details: InvitationDetails; heading: string; body: string; display: string; accentText: string; framed: boolean;
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
      <h2 style={{ ...caps, fontSize: '5.4cqw', fontWeight: 600, color: accentText, lineHeight: 1.15, overflowWrap: 'anywhere' }}>{names[0]}</h2>
      {names[1] && (
        <>
          <p style={{ ...caps, display: 'flex', alignItems: 'center', gap: '2cqw', fontSize: '2.8cqw', fontWeight: 600 }}>{rule}and{rule}</p>
          <h2 style={{ ...caps, fontSize: '5.4cqw', fontWeight: 600, color: accentText, lineHeight: 1.15, overflowWrap: 'anywhere' }}>{names[1]}</h2>
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
