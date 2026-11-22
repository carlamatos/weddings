'use client';

import { useEffect, useRef, useState } from 'react';
import type { InvitationDesign, InvitationDetails } from '@/app/lib/invitation';
import { INVITATION_FONTS } from '@/app/lib/invitation';
import { envelopeCopy, inkOn, lightness, linerPattern, sealSvgInner, shade } from '@/app/lib/invitation-envelope';
import { InvitationCard } from '@/app/ui/dashboard/invitation-card';

// The invitation arriving in its envelope (app/lib/invitation-envelope.ts):
// the guest taps it, the seal breaks, the flap lifts to show the liner and
// the card slides out, then the card is shown full size with the host's note
// and the RSVP button. Used by the guest's invitation page (/i/…) and the
// designer's "Watch it open" preview. onOpen: when the guest opens it (the
// page records the view). With reduced motion it opens without the movement.

type Phase = 'closed' | 'opening' | 'open';

export function EnvelopeOpening({
  design,
  details,
  language,
  guestName,
  note,
  hostName,
  startOpen = false,
  onOpen,
  compact = false,
  guestToken,
}: {
  design: InvitationDesign;
  details: InvitationDetails;
  language?: string | null;
  guestName?: string;
  note?: string | null;
  hostName?: string;
  startOpen?: boolean;
  onOpen?: () => void;
  compact?: boolean; // inside the designer's preview window
  guestToken?: string | null; // the guest's link token: their RSVP is filled in for them
}) {
  const t = envelopeCopy(language);
  const env = design.envelope;
  const [phase, setPhase] = useState<Phase>(startOpen ? 'open' : 'closed');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const backdrop = lightness(env.color) > 0.4 ? shade(env.color, -0.09) : shade(env.color, 0.16);
  const ink = inkOn(backdrop);
  const heading = INVITATION_FONTS[design.headingFont].family;
  const body = INVITATION_FONTS[design.bodyFont].family;
  const accent = design.accentColor;
  const onAccent = inkOn(accent);
  const withGuest = guestToken ? `${details.url}?g=${encodeURIComponent(guestToken)}` : details.url;
  const rsvpHref = details.rsvpOff ? withGuest : `${withGuest}#rsvp`;
  const linerFill = shade(env.color, -0.1);

  function open() {
    if (phase !== 'closed') return;
    onOpen?.();
    const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (still) { setPhase('open'); return; }
    setPhase('opening');
    timer.current = setTimeout(() => setPhase('open'), 2300);
  }

  const W = compact ? 'min(84vw, 360px, 46vh)' : 'min(90vw, 440px, 50vh)';

  return (
    <div className="mg-env-root" style={{ minHeight: compact ? 0 : '100svh', background: `radial-gradient(120% 80% at 50% 30%, ${shade(backdrop, 0.12)} 0%, ${backdrop} 70%)`, color: ink, fontFamily: body, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: compact ? '24px 16px' : '32px 16px 40px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <style>{CSS}</style>

      {phase !== 'open' ? (
        <div className={`mg-env-stage${phase === 'opening' ? ' is-opening' : ''}`} style={{ ['--w' as string]: W }}>
          <div className="mg-env-words">
            <p style={{ margin: 0, fontFamily: heading, fontSize: 'calc(var(--w) * 0.1)', lineHeight: 1.15 }}>
              {guestName?.trim() ? t.forGuest(guestName.trim()) : t.youreInvited}
            </p>
            <p style={{ margin: '10px 0 0', fontSize: 14, letterSpacing: '0.04em', opacity: 0.75 }}>{t.tapToOpen}</p>
          </div>

          <button type="button" className="mg-env" onClick={open} aria-label={t.openYourInvitation} disabled={phase !== 'closed'}>
            {/* The inside back, lined. */}
            <svg className="mg-env-back" viewBox="0 0 100 71.4" preserveAspectRatio="none" aria-hidden="true">
              <defs dangerouslySetInnerHTML={{ __html: linerPattern('mg-liner-back', env.liner, env.linerColor, 0.22) }} />
              <rect width="100" height="71.4" rx="1.2" fill={linerFill} />
              <path d="M3 0 L50 40 L97 0 Z" fill="url(#mg-liner-back)" />
            </svg>

            {/* The card, waiting inside. Only what rises above the envelope shows. */}
            <div className="mg-env-slot" aria-hidden="true">
              <div className="mg-env-card">
                <InvitationCard design={design} details={details} nameAs="p" />
              </div>
            </div>

            {/* The front pocket: everything but the V the flap closes over. */}
            <svg className="mg-env-pocket" viewBox="0 0 100 71.4" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="mg-pocket" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={shade(env.color, 0.04)} />
                  <stop offset="1" stopColor={shade(env.color, -0.06)} />
                </linearGradient>
              </defs>
              <path d="M0 0 L50 40 L100 0 L100 71.4 L0 71.4 Z" fill="url(#mg-pocket)" />
              <path d="M0 71.4 L50 37 L100 71.4" fill="none" stroke={shade(env.color, -0.14)} strokeWidth="1.2" vectorEffect="non-scaling-stroke" opacity="0.7" />
              <path d="M0 0 L50 40 L100 0" fill="none" stroke={shade(env.color, -0.12)} strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.6" />
            </svg>

            {/* The flap: paper outside, liner inside. */}
            <div className="mg-env-flap" aria-hidden="true">
              <svg className="mg-env-face" viewBox="0 0 100 42.8" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mg-flap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={shade(env.color, 0.08)} />
                    <stop offset="1" stopColor={shade(env.color, -0.02)} />
                  </linearGradient>
                </defs>
                <path d="M0 0 L50 42.8 L100 0 Z" fill="url(#mg-flap)" stroke={shade(env.color, -0.14)} strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
              </svg>
              <svg className="mg-env-face mg-env-inside" viewBox="0 0 100 42.8" preserveAspectRatio="none">
                <defs dangerouslySetInnerHTML={{ __html: linerPattern('mg-liner-flap', env.liner, env.linerColor, 0.22) }} />
                <path d="M0 0 L50 42.8 L100 0 Z" fill={linerFill} />
                <path d="M3 0 L50 39 L97 0 Z" fill="url(#mg-liner-flap)" />
              </svg>
            </div>

            <span className="mg-env-seal" aria-hidden="true">
              <svg viewBox="0 0 100 100" width="100%" height="100%" dangerouslySetInnerHTML={{ __html: sealSvgInner(env.seal, env.sealColor, 'mg') }} />
            </span>
          </button>
        </div>
      ) : (
        <div className="mg-env-opened" style={{ width: compact ? 'min(84vw, 340px)' : 'min(92vw, 440px)' }}>
          <InvitationCard design={design} details={details} nameAs="p" />

          {!!details.events?.length && (
            <div style={{ marginTop: 22, padding: '14px 18px', background: 'rgba(255,255,255,0.88)', color: '#241F2B', borderRadius: 6, textAlign: 'left' }}>
              <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: shade(accent, -0.15) }}>{t.yourEvents}</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
                {details.events.map((e, i) => (
                  <li key={i} style={{ borderTop: i ? '1px solid #EDE8E3' : 'none', paddingTop: i ? 10 : 0 }}>
                    <strong style={{ display: 'block', fontSize: 15 }}>{e.name}</strong>
                    {e.when && <span style={{ display: 'block', fontSize: 14 }}>{e.when}</span>}
                    {e.venue && <span style={{ display: 'block', fontSize: 13, color: '#6B6470' }}>{e.venue}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {note?.trim() && (
            <div style={{ marginTop: 22, padding: '14px 18px', background: 'rgba(255,255,255,0.88)', color: '#241F2B', borderLeft: `3px solid ${accent}`, borderRadius: 6, textAlign: 'left' }}>
              <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: shade(accent, -0.15) }}>{t.personalNote}</p>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{note.trim()}</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 24 }}>
            <a href={rsvpHref} style={{ display: 'inline-block', minWidth: 200, textAlign: 'center', padding: '14px 32px', borderRadius: 999, background: accent, color: onAccent, fontWeight: 700, fontSize: 16, letterSpacing: '0.04em', textDecoration: 'none', boxShadow: '0 10px 24px -12px rgba(0,0,0,0.45)' }}>
              {details.rsvpOff ? t.viewPage : t.rsvp}
            </a>
            {!details.rsvpOff && (
              <a href={withGuest} style={{ color: ink, fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 3 }}>{t.viewPage}</a>
            )}
            <button type="button" onClick={() => setPhase('closed')} style={{ background: 'none', border: 'none', color: ink, opacity: 0.7, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: 4, marginTop: 4 }}>
              ↺ {t.openAgain}
            </button>
            {hostName?.trim() && <p style={{ margin: '6px 0 0', fontSize: 12, opacity: 0.65 }}>{t.fromHost(hostName.trim())}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// Sizes are shares of the envelope's width (--w); the envelope is 7:5 and
// sits at the bottom of a stage tall enough for the card to rise out of it.
const CSS = `
.mg-env-stage { position: relative; width: var(--w); padding-top: calc(var(--w) * 0.8); }
.mg-env-words { position: absolute; top: 0; left: -8%; right: -8%; height: calc(var(--w) * 0.72); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; transition: opacity .35s ease; }
.is-opening .mg-env-words { opacity: 0; }
.mg-env { position: relative; display: block; width: 100%; aspect-ratio: 7 / 5; padding: 0; border: 0; background: none; cursor: pointer; perspective: 1400px; filter: drop-shadow(0 18px 22px rgba(20, 16, 24, 0.28)); -webkit-tap-highlight-color: transparent; font: inherit; color: inherit; }
.mg-env:disabled { cursor: default; }
.mg-env:focus-visible { outline: 3px solid currentColor; outline-offset: 6px; border-radius: 6px; }
.mg-env-back { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; border-radius: 6px; }
.mg-env-slot { position: absolute; inset: 0; z-index: 2; clip-path: inset(-400% -30% 0 -30%); pointer-events: none; }
.mg-env-card { position: absolute; left: 6%; width: 88%; top: 8%; transition: transform 1.1s cubic-bezier(.22,.8,.25,1) 1s; }
.mg-env-card .invitation-card { box-shadow: 0 6px 18px -8px rgba(20,16,24,0.35) !important; }
.is-opening .mg-env-card { transform: translateY(-64%); }
.mg-env-pocket { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 3; }
.mg-env-flap { position: absolute; top: 0; left: 0; width: 100%; height: 60%; z-index: 4; transform-origin: 50% 0; transform-style: preserve-3d; transition: transform .75s cubic-bezier(.45,.05,.3,1) .3s, z-index 0s .68s; }
.is-opening .mg-env-flap { transform: rotateX(180deg); z-index: 1; }
.mg-env-face { position: absolute; inset: 0; width: 100%; height: 100%; backface-visibility: hidden; -webkit-backface-visibility: hidden; overflow: visible; }
.mg-env-inside { transform: rotateY(180deg); }
.mg-env-seal { position: absolute; z-index: 5; width: 19%; aspect-ratio: 1; left: 40.5%; top: calc(60% - 9.5% * 7 / 5 * 1.05); transition: transform .35s ease, opacity .3s ease .1s; }
.mg-env:not(:disabled):hover .mg-env-seal { transform: scale(1.04) rotate(-3deg); }
.is-opening .mg-env-seal { transform: scale(1.25); opacity: 0; }
.mg-env-opened { animation: mg-env-in .7s cubic-bezier(.22,.8,.25,1) both; text-align: center; }
@keyframes mg-env-in { from { opacity: 0; transform: translateY(24px) scale(.94); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .mg-env-card, .mg-env-flap, .mg-env-seal, .mg-env-words { transition: none !important; }
  .mg-env-opened { animation: none; }
}
`;
