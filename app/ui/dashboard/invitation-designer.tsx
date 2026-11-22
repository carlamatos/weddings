'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { saveInvitationDesign } from '@/app/lib/actions';
import {
  INVITATION_FONTS,
  INVITATION_TEXT_MAX,
  withInvitationText,
  defaultInvitation,
  googleFontsHref,
  type InvitationDesign,
  type InvitationDetails,
  type InvitationFont,
  INVITATION_PICTURES, THEME_PICTURE, isInvitationPicture,
  INVITATION_STEPS, type InvitationStep,
} from '@/app/lib/invitation';
import { uploadImage } from '@/app/ui/dashboard/upload-image';
import { InvitationCard } from '@/app/ui/dashboard/invitation-card';
import { autoInitials, monogramNames } from '@/app/lib/invitation-monogram';
import { InvitationGallery } from '@/app/ui/dashboard/invitation-gallery';
import { applyLook, lookOf } from '@/app/lib/invitation-designs';
import { FontPicker } from '@/app/ui/dashboard/font-picker';
import { OrnamentField } from '@/app/ui/dashboard/ornament-picker';
import { ornamentOccasion, ornamentPalette } from '@/app/lib/invitation-ornaments';
import { ENVELOPE_LINERS, ENVELOPE_SEALS, envelopeSvg, linerPattern, sealSvgInner, type InvitationEnvelope } from '@/app/lib/invitation-envelope';
import { EnvelopeOpening } from '@/app/ui/invitation-envelope-opening';

import { useDashText } from '@/app/ui/dashboard/dash-text';
const ALL_FONTS = Object.keys(INVITATION_FONTS) as InvitationFont[];

const FONTS_HREF = googleFontsHref(ALL_FONTS);

const panel: React.CSSProperties = { background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: 18, marginBottom: 14 };
const h3: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#241F2B', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' };
const label: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6470', margin: '10px 0 5px' };
const input: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1px solid #EDE8E3', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', color: '#241F2B' };
const btn: React.CSSProperties = { padding: '9px 16px', borderRadius: 8, border: '1px solid #DDD5CE', background: '#fff', color: '#241F2B', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };

function ColorField({ id, text, value, onChange }: { id: string; text: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
      <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 40, height: 32, border: '1px solid #EDE8E3', borderRadius: 6, padding: 2, background: '#fff', cursor: 'pointer' }} />
      <label htmlFor={id} style={{ fontSize: 13, color: '#241F2B' }}>{text}</label>
    </div>
  );
}

export function InvitationDesigner({
  pageId,
  themeSlug,
  language,
  initial,
  details: eventDetails,
  sendStep,
  initialStep = 'design',
}: {
  pageId: number;
  themeSlug: string | null;
  // The page's language: "Reset" goes back to the starting wording in it.
  language?: string | null;
  initial: InvitationDesign;
  // The event page's facts; the invitation can word them its own way (Words).
  details: InvitationDetails;
  editPageHref: string;
  // The last step: the guest list and the Send button (InvitationSender).
  sendStep: ReactNode;
  initialStep?: InvitationStep;
}) {
  const d = useDashText();
  const [design, setDesign] = useState(initial);
  const details = withInvitationText(eventDetails, design);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [qrSvg, setQrSvg] = useState('');
  // The "Watch it open" preview; the key restarts it each time.
  const [watching, setWatching] = useState(0);
  const [step, setStep] = useState<InvitationStep>(initialStep);
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  // On a phone the step bar is one scrolling row: keep the current step in it.
  useEffect(() => {
    const row = stepsRef.current;
    const on = row?.querySelector<HTMLElement>('[aria-current="step"]');
    if (row && on && row.scrollWidth > row.clientWidth) row.scrollTo({ left: on.offsetLeft - row.offsetLeft - 16, behavior: 'smooth' });
  }, [step]);
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ownRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const own = design.layout === 'own';
  const t = d.invitationDesigner;
  const linerLabel = { plain: t.linerPlain, stripes: t.linerStripes, dots: t.linerDots, confetti: t.linerConfetti, leaves: t.linerLeaves };
  const sealLabel = { heart: t.sealHeart, star: t.sealStar, flower: t.sealFlower, balloon: t.sealBalloon, plain: t.sealPlain };
  const dirty = JSON.stringify(design) !== saved;
  const occasion = ornamentOccasion(themeSlug);
  const palette = ornamentPalette(themeSlug, design);

  useEffect(() => {
    QRCode.toString(details.url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#241F2B', light: '#FFFFFF' } })
      .then(setQrSvg)
      .catch(() => setQrSvg(''));
  }, [details.url]);

  function set<K extends keyof InvitationDesign>(key: K, value: InvitationDesign[K]) {
    setDesign((d) => ({ ...d, [key]: value }));
    setMessage(null);
  }
  function setEnv<K extends keyof InvitationEnvelope>(key: K, value: InvitationEnvelope[K]) {
    setDesign((d) => ({ ...d, envelope: { ...d.envelope, [key]: value } }));
    setMessage(null);
  }
  function setBg<K extends keyof InvitationDesign['background']>(key: K, value: InvitationDesign['background'][K]) {
    setDesign((d) => ({ ...d, background: { ...d.background, [key]: value } }));
    setMessage(null);
  }

  async function save(): Promise<boolean> {
    setSaving(true);
    setMessage(null);
    const result = await saveInvitationDesign(pageId, design);
    setSaving(false);
    if (!result.ok) {
      setMessage({ kind: 'error', text: result.error });
      return false;
    }
    setDesign(result.value);
    setSaved(JSON.stringify(result.value));
    setMessage({ kind: 'ok', text: d.invitationDesigner.invitationSaved });
    return true;
  }

  // The steps this design has, and moving between them. Going on to Send
  // saves the design first, since that's what the guests are sent.
  const steps = INVITATION_STEPS.filter((s) => !(own && (s === 'words' || s === 'style')));
  const current = steps.includes(step) ? step : 'design';
  const at = steps.indexOf(current);
  const stepName: Record<InvitationStep, string> = { design: t.stepDesign, words: t.stepWords, style: t.stepStyle, envelope: t.stepEnvelope, send: t.stepSend };
  async function go(next: InvitationStep) {
    if (next === current) return;
    if (next === 'send' && dirty) {
      if (!(await save())) return;
      router.refresh();
    }
    setStep(next);
    setMessage(null);
    const top = topRef.current;
    if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const url = await uploadImage(file);
      setDesign((d) => ({ ...d, background: { ...d.background, kind: 'image', imageUrl: url } }));
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : d.invitationDesigner.uploadFailed });
    } finally {
      setUploading(false);
    }
  }

  // The portrait layout's photo: theirs in place of our sample couple.
  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const url = await uploadImage(file);
      setDesign((d) => ({ ...d, photo: url }));
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : d.invitationDesigner.uploadFailed });
    } finally {
      setUploading(false);
    }
  }

  // "Upload your own": their finished invitation becomes the whole card.
  async function onOwnDesign(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const url = await uploadImage(file);
      setDesign((d) => ({
        ...d, layout: 'own', divider: '', frame: '', picture: '',
        background: { kind: 'image', color: '#FFFFFF', imageUrl: url, overlay: false, overlayColor: '#000000', overlayOpacity: 0 },
      }));
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : d.invitationDesigner.uploadFailed });
    } finally {
      setUploading(false);
    }
  }

  // Prints just the card, 5×7in, from a hidden frame (or "Save as PDF").
  function print() {
    const frame = frameRef.current;
    const card = cardRef.current;
    if (!frame || !card) return;
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>Invitation</title>
      <link rel="stylesheet" href="${FONTS_HREF}">
      <style>@page { size: 5in 7in; margin: 0; } html, body { margin: 0; padding: 0; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .wrap { width: 5in; } .invitation-card { box-shadow: none !important; border-radius: 0 !important; }</style>
      </head><body><div class="wrap">${card.outerHTML}</div></body></html>`;
    frame.onload = () => {
      frame.onload = null;
      // Give the web fonts a moment to load before printing.
      const w = frame.contentWindow;
      const go = () => { w?.focus(); w?.print(); };
      if (w?.document.fonts?.ready) w.document.fonts.ready.then(() => setTimeout(go, 100));
      else setTimeout(go, 600);
    };
    frame.srcdoc = doc;
  }


  const nav = (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
      {at > 0 ? <button type="button" style={btn} onClick={() => go(steps[at - 1])}>← {t.back}</button> : <span />}
      {at < steps.length - 1 && (
        <button type="button" disabled={saving} onClick={() => go(steps[at + 1])} style={{ ...btn, border: 'none', background: '#B6584A', color: '#fff', opacity: saving ? 0.6 : 1 }}>
          {saving ? t.saving : `${t.next}: ${stepName[steps[at + 1]]} →`}
        </button>
      )}
    </div>
  );

  return (
    <div ref={topRef} style={{ scrollMarginTop: 80 }}>
      <link rel="stylesheet" href={FONTS_HREF} />
      {/* On a phone the invitation comes first, at the top, then the steps
          and their settings below it (the preview column is hidden there). */}
      {current !== 'send' && (
        <div className="invitation-phone-card" style={{ display: 'none' }}>
          <div style={{ width: 'min(72vw, 300px)', margin: '0 auto 18px' }}>
            <InvitationCard design={design} details={details} qrSvg={qrSvg} nameAs="p" />
          </div>
        </div>
      )}
      {/* The steps: numbered, each one clickable. */}
      <nav aria-label={t.stepsLabel} style={{ marginBottom: 18 }}>
        <style>{`@media (max-width: 900px) { .invitation-steps { flex-wrap: nowrap !important; overflow-x: auto; padding-bottom: 4px !important; scrollbar-width: none; } .invitation-steps li { flex-shrink: 0; } }`}</style>
        <ol ref={stepsRef} className="invitation-steps" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {steps.map((s, i) => {
            const on = s === current;
            const done = i < at;
            return (
              <li key={s}>
                <button type="button" aria-current={on ? 'step' : undefined} onClick={() => go(s)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px 7px 8px', borderRadius: 999, border: `1px solid ${on ? '#B6584A' : '#E2DAD3'}`, background: on ? '#B6584A' : '#fff', color: on ? '#fff' : '#241F2B', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, background: on ? '#fff' : done ? '#3D6B46' : '#F3EEE9', color: on ? '#B6584A' : done ? '#fff' : '#6B6470' }}>
                    {done ? '✓' : i + 1}
                  </span>
                  {stepName[s]}
                </button>
              </li>
            );
          })}
        </ol>
        <p style={{ fontSize: 12, color: '#9A8F8C', margin: '8px 0 0' }}>{t.stepOf.replace('{n}', String(at + 1)).replace('{total}', String(steps.length))}</p>
      </nav>

      {current === 'send' ? (
        <div>
          {/* The invitation being sent, small, with a way back to change it. */}
          <div style={{ ...panel, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 92, flexShrink: 0 }}><InvitationCard design={design} details={details} qrSvg={qrSvg} nameAs="p" /></div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#241F2B' }}>{t.whatYoureSending}</p>
              <p style={{ margin: '4px 0 10px', fontSize: 13, color: '#6B6470', lineHeight: 1.5 }}>{t.whatYoureSendingHint}</p>
              <button type="button" style={{ ...btn, padding: '7px 12px', fontSize: 13 }} onClick={() => go('design')}>{t.changeDesign}</button>
            </div>
          </div>
          {sendStep}
          <div style={{ marginTop: 14 }}>{nav}</div>
        </div>
      ) : (
    <div className="invitation-designer" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 420px)', gap: 24, alignItems: 'start' }}>
      {/* On a phone: the invitation is shown at the top, above the steps
          (invitation-phone-card), so this column's copy is hidden, and the
          Save and Print buttons come after the settings. */}
      <style>{`@media (max-width: 900px) {
        .invitation-designer { grid-template-columns: 1fr !important; gap: 14px !important; }
        .invitation-preview { position: static !important; }
        .invitation-preview-card { display: none; }
        .invitation-phone-card { display: block !important; }
        .invitation-preview-actions > div:first-child { margin-top: 0 !important; }
      }`}</style>

      <div>
        {current === 'design' && (<>
        <section style={panel}>
          {/* The design list is long: Next is offered here too, beside the title. */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            <h3 style={{ ...h3, margin: 0 }}>{d.invitationDesigner.chooseADesign}</h3>
            {at < steps.length - 1 && (
              <button type="button" disabled={saving} onClick={() => go(steps[at + 1])} style={{ ...btn, padding: '7px 14px', fontSize: 13, border: 'none', background: '#B6584A', color: '#fff', opacity: saving ? 0.6 : 1 }}>
                {saving ? t.saving : `${t.next}: ${stepName[steps[at + 1]]} →`}
              </button>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 14px', lineHeight: 1.6 }}>{d.invitationDesigner.chooseADesignHint}</p>
          <InvitationGallery design={design} details={details} themeSlug={themeSlug} uploading={uploading}
            onPick={(look) => { setDesign((cur) => applyLook(cur, look)); setMessage(null); }}
            onUploadOwn={() => ownRef.current?.click()} />
          <input ref={ownRef} type="file" accept="image/png,image/jpeg,image/webp,.heic,.heif" onChange={onOwnDesign} style={{ display: 'none' }} />
        </section>

        {own && (
          <section style={panel}>
            <h3 style={h3}>{d.invitationDesigner.ownDesign}</h3>
            <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 12px', lineHeight: 1.6 }}>{d.invitationDesigner.ownDesignHint}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" style={btn} disabled={uploading} onClick={() => ownRef.current?.click()}>{uploading ? d.invitationDesigner.uploading : d.invitationDesigner.replaceDesign}</button>
              <button type="button" style={btn} onClick={() => { setDesign((cur) => applyLook(cur, lookOf(defaultInvitation(themeSlug, language)))); setMessage(null); }}>{d.invitationDesigner.useAMyGalaDesign}</button>
            </div>
            <ColorField id="inv-button" text={d.invitationDesigner.buttonColour} value={design.accentColor} onChange={(v) => set('accentColor', v)} />
          </section>
        )}

        {design.layout === 'portrait' && (
          <section style={panel}>
            <h3 style={h3}>{t.yourPhoto}</h3>
            <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 12px', lineHeight: 1.6 }}>{design.photo ? t.yourPhotoHint : t.samplePhotoHint}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" style={btn} disabled={uploading} onClick={() => photoRef.current?.click()}>{uploading ? t.uploading : design.photo ? t.replacePhoto : t.uploadYourPhoto}</button>
              {design.photo && <button type="button" style={btn} onClick={() => set('photo', '')}>{t.useSamplePhoto}</button>}
            </div>
            <input ref={photoRef} type="file" accept="image/*,.heic,.heif" onChange={onPhoto} style={{ display: 'none' }} />
          </section>
        )}
        </>)}

        {current === 'words' && (
        <section style={panel}>
          <h3 style={h3}>{d.invitationDesigner.words}</h3>
          {/* The event's facts, worded for the invitation only: the event
              page keeps its own. Empty: the page's (shown as the hint). */}
          <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 4px', lineHeight: 1.6 }}>{t.invitationWordingHint}</p>
          {([
            ['eventName', t.eventNameLabel, eventDetails.name],
            ['eventDate', d.invitationDesigner.date, eventDetails.date],
            ['eventTime', d.invitationDesigner.time, eventDetails.time],
            ['eventVenue', t.venueLabel, eventDetails.venue],
            ['eventAddress', t.addressLabel, eventDetails.address],
          ] as const).map(([key, text, fromPage]) => (
            <div key={key}>
              <label style={label} htmlFor={`inv-${key}`}>{text}</label>
              {/* Empty: the page's, shown greyed; clicking in fills it in to edit. */}
              <input id={`inv-${key}`} style={input} value={design[key]} placeholder={fromPage} maxLength={INVITATION_TEXT_MAX[key]}
                onFocus={() => { if (!design[key] && fromPage) set(key, fromPage); }}
                onChange={(e) => set(key, e.target.value)} />
            </div>
          ))}
          <label style={label} htmlFor="inv-eyebrow">{d.invitationDesigner.lineAboveTheEventName}</label>
          <input id="inv-eyebrow" style={input} value={design.eyebrow} maxLength={INVITATION_TEXT_MAX.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} />
          <label style={label} htmlFor="inv-message">{d.invitationDesigner.message}</label>
          <textarea id="inv-message" style={{ ...input, minHeight: 90, resize: 'vertical' }} value={design.message} maxLength={INVITATION_TEXT_MAX.message} onChange={(e) => set('message', e.target.value)} />
          <label style={label} htmlFor="inv-closing">{d.invitationDesigner.closingLine}</label>
          <input id="inv-closing" style={input} value={design.closing} maxLength={INVITATION_TEXT_MAX.closing} onChange={(e) => set('closing', e.target.value)} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#241F2B', marginTop: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={design.showQr} onChange={(e) => set('showQr', e.target.checked)} />
            {d.invitationDesigner.showAQrCodeGuests}
          </label>
          {design.layout === 'gilded' && (
            <>
              <label style={label} htmlFor="inv-initials">{t.initials}</label>
              <input id="inv-initials" style={{ ...input, maxWidth: 140, fontSize: 16, letterSpacing: '0.08em' }} value={design.initials} maxLength={INVITATION_TEXT_MAX.initials}
                placeholder={autoInitials(monogramNames(details.name).names).toUpperCase()}
                onChange={(e) => set('initials', e.target.value)} />
              <p style={{ fontSize: 12, color: '#6B6470', margin: '6px 0 0', lineHeight: 1.5 }}>{t.initialsHint}</p>
            </>
          )}
        </section>
        )}

        {current === 'style' && (<>
        <section style={panel}>
          <h3 style={h3}>{d.invitationDesigner.fontsColours}</h3>
          <label style={label} id="inv-heading-font-label" htmlFor="inv-heading-font">{
            // What the first font is used for depends on the layout.
            design.layout === 'portrait' ? d.invitationDesigner.openingClosingFont
              : design.layout === 'gilded' ? d.invitationDesigner.initialsFont
              : d.invitationDesigner.eventNameFont}</label>
          <FontPicker id="inv-heading-font" labelledBy="inv-heading-font-label" value={design.headingFont} onChange={(f) => set('headingFont', f)} />
          <label style={label} id="inv-body-font-label" htmlFor="inv-body-font">{d.invitationDesigner.textFont}</label>
          <FontPicker id="inv-body-font" labelledBy="inv-body-font-label" value={design.bodyFont} onChange={(f) => set('bodyFont', f)} />
          <ColorField id="inv-text" text={d.invitationDesigner.textColour} value={design.textColor} onChange={(v) => set('textColor', v)} />
          <ColorField id="inv-accent" text={design.layout === 'portrait' || design.layout === 'gilded' ? d.invitationDesigner.accentColour : d.invitationDesigner.eventNameAccentColour} value={design.accentColor} onChange={(v) => set('accentColor', v)} />
        </section>

        {(design.layout === 'classic' || design.layout === 'monogram' || (themeSlug && THEME_PICTURE[themeSlug]) || isInvitationPicture(design.picture)) && (
        <section style={panel}>
          <h3 style={h3}>{d.invitationDesigner.decorations}</h3>
          {/* Only the layouts that draw them: the divider in the classic
              layout, the frame in classic and monogram (the styles of their
              own have their own decoration). */}
          {(['divider', 'frame'] as const).filter((kind) => design.layout === 'classic' || (kind === 'frame' && design.layout === 'monogram')).map((kind) => (
            <OrnamentField
              key={kind}
              kind={kind}
              value={design[kind]}
              color={kind === 'divider' ? design.dividerColor : design.frameColor}
              palette={palette}
              occasion={occasion}
              background={design.background.kind === 'image' && design.background.overlay ? design.background.overlayColor : design.background.color}
              onChange={(id) => set(kind, id)}
              onColor={(c) => set(kind === 'divider' ? 'dividerColor' : 'frameColor', c)}
            />
          ))}
          {/* The theme's own picture in a corner (Balloons, Gnomes). */}
          {(() => {
            const pic = (themeSlug && THEME_PICTURE[themeSlug]) || (isInvitationPicture(design.picture) ? design.picture : null);
            if (!pic) return null;
            return (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#241F2B', marginTop: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={design.picture === pic} onChange={(e) => set('picture', e.target.checked ? pic : '')} />
                {d.invitationDesigner.showThe} {INVITATION_PICTURES[pic].label.toLowerCase()} {d.invitationDesigner.pictureInTheCorner}
              </label>
            );
          })()}
        </section>
        )}

        <section style={panel}>
          <h3 style={h3}>{d.invitationDesigner.background}</h3>
          <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
            {(['color', 'image'] as const).map((k) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="radio" name="inv-bg" checked={design.background.kind === k} disabled={k === 'image' && !design.background.imageUrl && uploading}
                  onChange={() => (k === 'image' && !design.background.imageUrl ? fileRef.current?.click() : setBg('kind', k))} />
                {k === 'color' ? d.invitationDesigner.colour : d.invitationDesigner.image}
              </label>
            ))}
          </div>
          <ColorField id="inv-bg-color" text={d.invitationDesigner.backgroundColour} value={design.background.color} onChange={(v) => setBg('color', v)} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button type="button" style={btn} disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? d.invitationDesigner.uploading : design.background.imageUrl ? d.invitationDesigner.replaceImage : d.invitationDesigner.uploadAnImage}
            </button>
            {design.background.imageUrl && (
              <button type="button" style={btn} onClick={() => setDesign((d) => ({ ...d, background: { ...d.background, kind: 'color', imageUrl: '' } }))}>{d.invitationDesigner.removeImage}</button>
            )}
            <input ref={fileRef} type="file" accept="image/*,.heic,.heif" onChange={onImage} style={{ display: 'none' }} />
          </div>
          {design.background.kind === 'image' && design.background.imageUrl && (
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#241F2B', cursor: 'pointer' }}>
                <input type="checkbox" checked={design.background.overlay} onChange={(e) => setBg('overlay', e.target.checked)} />
                {d.invitationDesigner.colourOverlayKeepsTextEasy}
              </label>
              {design.background.overlay && (
                <>
                  <ColorField id="inv-overlay" text={d.invitationDesigner.overlayColour} value={design.background.overlayColor} onChange={(v) => setBg('overlayColor', v)} />
                  <label style={label} htmlFor="inv-opacity">{d.invitationDesigner.overlayStrength} {Math.round(design.background.overlayOpacity * 100)}%</label>
                  <input id="inv-opacity" type="range" min={0} max={0.9} step={0.05} value={design.background.overlayOpacity} onChange={(e) => setBg('overlayOpacity', Number(e.target.value))} style={{ width: '100%' }} />
                </>
              )}
            </div>
          )}
        </section>
        </>)}

        {current === 'envelope' && (
        <section style={panel}>
          <h3 style={h3}>{t.envelope}</h3>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: '#241F2B', cursor: 'pointer', lineHeight: 1.45 }}>
            <input type="checkbox" checked={design.envelope.on} onChange={(e) => setEnv('on', e.target.checked)} style={{ marginTop: 3 }} />
            {t.envelopeOn}
          </label>
          <p style={{ fontSize: 13, color: '#6B6470', margin: '8px 0 0', lineHeight: 1.6 }}>{t.envelopeHint}</p>
          {design.envelope.on && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', margin: '14px 0 4px' }}>
                <div aria-hidden="true" style={{ width: 200, lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: envelopeSvg(design.envelope, 200) }} />
                <button type="button" style={btn} onClick={() => setWatching((n) => n + 1)}>▶ {t.watchItOpen}</button>
              </div>
              <ColorField id="inv-env-color" text={t.envelopeColour} value={design.envelope.color} onChange={(v) => setEnv('color', v)} />

              <p style={label} id="inv-liner-label">{t.liner}</p>
              <div role="radiogroup" aria-labelledby="inv-liner-label" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ENVELOPE_LINERS.map((l) => (
                  <button key={l} type="button" role="radio" aria-checked={design.envelope.liner === l} onClick={() => setEnv('liner', l)} title={linerLabel[l]}
                    style={{ padding: 3, borderRadius: 8, border: `2px solid ${design.envelope.liner === l ? '#B6584A' : '#EDE8E3'}`, background: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'inherit', fontSize: 11, color: '#6B6470' }}>
                    <svg width="52" height="34" aria-hidden="true" dangerouslySetInnerHTML={{ __html: `<defs>${linerPattern(`inv-liner-${l}`, l, design.envelope.linerColor, 0.5)}</defs><rect width="52" height="34" rx="4" fill="url(#inv-liner-${l})"/>` }} />
                    {linerLabel[l]}
                  </button>
                ))}
              </div>
              <ColorField id="inv-liner-color" text={t.linerColour} value={design.envelope.linerColor} onChange={(v) => setEnv('linerColor', v)} />

              <p style={label} id="inv-seal-label">{t.seal}</p>
              <div role="radiogroup" aria-labelledby="inv-seal-label" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ENVELOPE_SEALS.map((x) => (
                  <button key={x} type="button" role="radio" aria-checked={design.envelope.seal === x} onClick={() => setEnv('seal', x)} title={sealLabel[x]}
                    style={{ padding: '4px 6px', borderRadius: 8, border: `2px solid ${design.envelope.seal === x ? '#B6584A' : '#EDE8E3'}`, background: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontFamily: 'inherit', fontSize: 11, color: '#6B6470', minWidth: 52 }}>
                    <svg width="36" height="36" viewBox="0 0 100 100" aria-hidden="true" dangerouslySetInnerHTML={{ __html: sealSvgInner(x, design.envelope.sealColor, `inv-seal-${x}`) }} />
                    {sealLabel[x]}
                  </button>
                ))}
              </div>
              <ColorField id="inv-seal-color" text={t.sealColour} value={design.envelope.sealColor} onChange={(v) => setEnv('sealColor', v)} />
            </>
          )}
        </section>
        )}

        {nav}

        {watching > 0 && (
          <div role="dialog" aria-modal="true" aria-label={t.watchItOpen} onClick={(e) => { if (e.target === e.currentTarget) setWatching(0); }}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(36,31,43,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 460, maxHeight: '100%', overflow: 'auto', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <button type="button" onClick={() => setWatching(0)} style={{ ...btn, position: 'absolute', top: 10, right: 10, zIndex: 10, padding: '5px 11px', fontSize: 13 }}>{t.closePreview}</button>
              <EnvelopeOpening key={watching} compact design={design} details={details} language={language} guestName={t.sampleGuest} />
            </div>
          </div>
        )}
      </div>

      <div className="invitation-preview" style={{ position: 'sticky', top: 16 }}>
        <div className="invitation-preview-card">
          <div><InvitationCard ref={cardRef} design={design} details={details} qrSvg={qrSvg} /></div>
        </div>
        <div className="invitation-preview-actions">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16, alignItems: 'center' }}>
          <button type="button" onClick={() => { void save(); }} disabled={!dirty || saving} style={{ ...btn, border: 'none', background: '#B6584A', color: '#fff', opacity: !dirty || saving ? 0.55 : 1 }}>
            {saving ? d.invitationDesigner.saving : d.invitationDesigner.saveInvitation}
          </button>
          <button type="button" style={btn} onClick={print}>{d.invitationDesigner.printSaveAsPdf}</button>
          <button type="button" style={{ ...btn, border: 'none', background: 'transparent', color: '#6B6470', fontWeight: 500 }} onClick={() => { setDesign(defaultInvitation(themeSlug, language)); setMessage(null); }}>
            {d.invitationDesigner.resetToThemeStyle}
          </button>
        </div>
        {message && <p role="status" style={{ fontSize: 13, margin: '10px 0 0', color: message.kind === 'ok' ? '#3D6B46' : '#B91C1C' }}>{message.text}</p>}
        {dirty && !message && <p style={{ fontSize: 12, margin: '10px 0 0', color: '#8A6800' }}>{d.invitationDesigner.youHaveUnsavedChanges}</p>}
        <iframe ref={frameRef} title={d.invitationDesigner.printableInvitation} aria-hidden="true" tabIndex={-1} style={{ position: 'fixed', right: 0, bottom: 0, width: 0, height: 0, border: 0 }} />
        </div>
      </div>
    </div>
      )}
    </div>
  );
}
