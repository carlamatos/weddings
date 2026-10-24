import { forwardRef, type ImgHTMLAttributes } from 'react';
import { INVITATION_FONTS, type InvitationDesign, type InvitationDetails } from '@/app/lib/invitation';
import { findOrnament, ornamentSvg } from '@/app/lib/invitation-ornaments';

// The invitation itself (5×7 portrait). Sized with container query units
// (cqw), so the same markup looks identical in the dashboard preview and
// when printed at 5in wide. bgImage: extra attributes for the background
// photo (srcset, lazy loading) where many cards share a page.
export const InvitationCard = forwardRef<HTMLDivElement, { design: InvitationDesign; details: InvitationDetails; qrSvg?: string; bgImage?: ImgHTMLAttributes<HTMLImageElement> }>(
  function InvitationCard({ design, details, qrSvg, bgImage }, ref) {
    const heading = INVITATION_FONTS[design.headingFont].family;
    const body = INVITATION_FONTS[design.bodyFont].family;
    const bg = design.background;
    const useImage = bg.kind === 'image' && !!bg.imageUrl;
    const divider = findOrnament('divider', design.divider);
    const frame = findOrnament('frame', design.frame);

    return (
      <div ref={ref} className="invitation-card" style={{ containerType: 'inline-size', width: '100%', aspectRatio: '5 / 7', position: 'relative', overflow: 'hidden', borderRadius: 4, background: bg.color, color: design.textColor, fontFamily: body, boxShadow: '0 18px 40px -18px rgba(36,31,43,0.35)' }}>
        {useImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bg.imageUrl} alt="" {...bgImage} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {useImage && bg.overlay && (
          <div style={{ position: 'absolute', inset: 0, background: bg.overlayColor, opacity: bg.overlayOpacity }} />
        )}
        {frame && (
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, color: design.frameColor, pointerEvents: 'none' }} dangerouslySetInnerHTML={{ __html: ornamentSvg('frame', frame) }} />
        )}
        <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: frame ? '15cqw 14cqw' : '9cqw 8cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: frame ? '2.2cqw' : '3cqw' }}>
          {design.eyebrow && <p style={{ margin: 0, fontSize: '3.4cqw', letterSpacing: '0.3cqw', textTransform: 'uppercase' }}>{design.eyebrow}</p>}
          <h2 style={{ margin: 0, fontFamily: heading, fontWeight: 400, fontSize: '10cqw', lineHeight: 1.1, color: design.accentColor, overflowWrap: 'anywhere' }}>{details.name}</h2>
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
          {design.closing && <p style={{ margin: '1cqw 0 0', fontFamily: heading, fontSize: '5.6cqw', color: design.accentColor }}>{design.closing}</p>}
        </div>
      </div>
    );
  },
);
