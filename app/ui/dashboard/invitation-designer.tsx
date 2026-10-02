'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { saveInvitationDesign } from '@/app/lib/actions';
import {
  INVITATION_FONTS,
  INVITATION_TEXT_MAX,
  defaultInvitation,
  googleFontsHref,
  type InvitationDesign,
  type InvitationDetails,
  type InvitationFont,
} from '@/app/lib/invitation';
import { uploadImage } from '@/app/ui/dashboard/upload-image';
import { InvitationCard } from '@/app/ui/dashboard/invitation-card';

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
  initial,
  details,
  editPageHref,
}: {
  pageId: number;
  themeSlug: string | null;
  initial: InvitationDesign;
  details: InvitationDetails;
  editPageHref: string;
}) {
  const [design, setDesign] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [qrSvg, setQrSvg] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(design) !== saved;

  useEffect(() => {
    QRCode.toString(details.url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#241F2B', light: '#FFFFFF' } })
      .then(setQrSvg)
      .catch(() => setQrSvg(''));
  }, [details.url]);

  function set<K extends keyof InvitationDesign>(key: K, value: InvitationDesign[K]) {
    setDesign((d) => ({ ...d, [key]: value }));
    setMessage(null);
  }
  function setBg<K extends keyof InvitationDesign['background']>(key: K, value: InvitationDesign['background'][K]) {
    setDesign((d) => ({ ...d, background: { ...d.background, [key]: value } }));
    setMessage(null);
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    const result = await saveInvitationDesign(pageId, design);
    setSaving(false);
    if (!result.ok) {
      setMessage({ kind: 'error', text: result.error });
      return;
    }
    setDesign(result.value);
    setSaved(JSON.stringify(result.value));
    setMessage({ kind: 'ok', text: 'Invitation saved.' });
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
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Upload failed.' });
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

  const fontSelect = (id: string, value: InvitationFont, onChange: (f: InvitationFont) => void) => (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value as InvitationFont)} style={input}>
      {ALL_FONTS.map((f) => <option key={f} value={f}>{INVITATION_FONTS[f].label}</option>)}
    </select>
  );

  return (
    <div className="invitation-designer" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 420px)', gap: 24, alignItems: 'start' }}>
      <link rel="stylesheet" href={FONTS_HREF} />
      <style>{`@media (max-width: 900px) { .invitation-designer { grid-template-columns: 1fr !important; } .invitation-preview { position: static !important; } }`}</style>

      <div>
        <section style={panel}>
          <h3 style={h3}>Event details</h3>
          <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 10px', lineHeight: 1.6 }}>
            These come from your event page and can only be changed in <Link href={editPageHref} style={{ color: '#B6584A' }}>Edit Page</Link>.
          </p>
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', margin: 0, fontSize: 14 }}>
            {([['Event', details.name], ['Date', details.date], ['Time', details.time], ['Place', [details.venue, details.address].filter(Boolean).join(', ')]] as const).map(([k, v]) => (
              <div key={k} style={{ display: 'contents' }}>
                <dt style={{ color: '#9A8F8C' }}>{k}</dt>
                <dd style={{ margin: 0, color: '#241F2B' }}>{v || '—'}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section style={panel}>
          <h3 style={h3}>Words</h3>
          <label style={label} htmlFor="inv-eyebrow">Line above the event name</label>
          <input id="inv-eyebrow" style={input} value={design.eyebrow} maxLength={INVITATION_TEXT_MAX.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} />
          <label style={label} htmlFor="inv-message">Message</label>
          <textarea id="inv-message" style={{ ...input, minHeight: 90, resize: 'vertical' }} value={design.message} maxLength={INVITATION_TEXT_MAX.message} onChange={(e) => set('message', e.target.value)} />
          <label style={label} htmlFor="inv-closing">Closing line</label>
          <input id="inv-closing" style={input} value={design.closing} maxLength={INVITATION_TEXT_MAX.closing} onChange={(e) => set('closing', e.target.value)} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#241F2B', marginTop: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={design.showQr} onChange={(e) => set('showQr', e.target.checked)} />
            Show a QR code guests can scan to RSVP
          </label>
        </section>

        <section style={panel}>
          <h3 style={h3}>Fonts &amp; colours</h3>
          <label style={label} htmlFor="inv-heading-font">Event name font</label>
          {fontSelect('inv-heading-font', design.headingFont, (f) => set('headingFont', f))}
          <label style={label} htmlFor="inv-body-font">Text font</label>
          {fontSelect('inv-body-font', design.bodyFont, (f) => set('bodyFont', f))}
          <ColorField id="inv-text" text="Text colour" value={design.textColor} onChange={(v) => set('textColor', v)} />
          <ColorField id="inv-accent" text="Event name & accent colour" value={design.accentColor} onChange={(v) => set('accentColor', v)} />
        </section>

        <section style={panel}>
          <h3 style={h3}>Background</h3>
          <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
            {(['color', 'image'] as const).map((k) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="radio" name="inv-bg" checked={design.background.kind === k} disabled={k === 'image' && !design.background.imageUrl && uploading}
                  onChange={() => (k === 'image' && !design.background.imageUrl ? fileRef.current?.click() : setBg('kind', k))} />
                {k === 'color' ? 'Colour' : 'Image'}
              </label>
            ))}
          </div>
          <ColorField id="inv-bg-color" text="Background colour" value={design.background.color} onChange={(v) => setBg('color', v)} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button type="button" style={btn} disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? 'Uploading…' : design.background.imageUrl ? 'Replace image' : 'Upload an image'}
            </button>
            {design.background.imageUrl && (
              <button type="button" style={btn} onClick={() => setDesign((d) => ({ ...d, background: { ...d.background, kind: 'color', imageUrl: '' } }))}>Remove image</button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={onImage} style={{ display: 'none' }} />
          </div>
          {design.background.kind === 'image' && design.background.imageUrl && (
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#241F2B', cursor: 'pointer' }}>
                <input type="checkbox" checked={design.background.overlay} onChange={(e) => setBg('overlay', e.target.checked)} />
                Colour overlay (keeps text easy to read)
              </label>
              {design.background.overlay && (
                <>
                  <ColorField id="inv-overlay" text="Overlay colour" value={design.background.overlayColor} onChange={(v) => setBg('overlayColor', v)} />
                  <label style={label} htmlFor="inv-opacity">Overlay strength — {Math.round(design.background.overlayOpacity * 100)}%</label>
                  <input id="inv-opacity" type="range" min={0} max={0.9} step={0.05} value={design.background.overlayOpacity} onChange={(e) => setBg('overlayOpacity', Number(e.target.value))} style={{ width: '100%' }} />
                </>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="invitation-preview" style={{ position: 'sticky', top: 16 }}>
        <InvitationCard ref={cardRef} design={design} details={details} qrSvg={qrSvg} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16, alignItems: 'center' }}>
          <button type="button" onClick={save} disabled={!dirty || saving} style={{ ...btn, border: 'none', background: '#B6584A', color: '#fff', opacity: !dirty || saving ? 0.55 : 1 }}>
            {saving ? 'Saving…' : 'Save invitation'}
          </button>
          <button type="button" style={btn} onClick={print}>Print / Save as PDF</button>
          <button type="button" style={{ ...btn, border: 'none', background: 'transparent', color: '#6B6470', fontWeight: 500 }} onClick={() => { setDesign(defaultInvitation(themeSlug)); setMessage(null); }}>
            Reset to theme style
          </button>
        </div>
        {message && <p role="status" style={{ fontSize: 13, margin: '10px 0 0', color: message.kind === 'ok' ? '#3D6B46' : '#B91C1C' }}>{message.text}</p>}
        {dirty && !message && <p style={{ fontSize: 12, margin: '10px 0 0', color: '#8A6800' }}>You have unsaved changes.</p>}
        <iframe ref={frameRef} title="Printable invitation" aria-hidden="true" tabIndex={-1} style={{ position: 'fixed', right: 0, bottom: 0, width: 0, height: 0, border: 0 }} />
      </div>
    </div>
  );
}
