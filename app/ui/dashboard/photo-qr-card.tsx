'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: '1px solid #EDE8E3', borderRadius: 8, fontSize: 14,
  fontFamily: 'inherit', color: '#241F2B', outline: 'none', width: '100%', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', marginBottom: 6,
};
const btn: React.CSSProperties = {
  padding: '9px 18px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
};

type Layout = 'four' | 'one';

const TITLE_MAX = 80;
const MESSAGE_MAX = 160;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

// A printable QR code that opens the page's Guest Photos section, for hosts
// to put on the tables. Printing renders the cards into a hidden iframe so
// the dashboard itself never ends up on paper.
export function PhotoQrCard({ uploadUrl, heading, sectionOn }: { uploadUrl: string; heading: string; sectionOn: boolean }) {
  const [title, setTitle] = useState(heading);
  const [message, setMessage] = useState('Share your photos with us!');
  const [layout, setLayout] = useState<Layout>('four');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    QRCode.toString(uploadUrl, { type: 'svg', errorCorrectionLevel: 'M', margin: 1, color: { dark: '#241F2B', light: '#FFFFFF' } })
      .then(setSvg)
      .catch(() => setError(true));
  }, [uploadUrl]);

  // Shown under the code for anyone whose camera won't scan it.
  const displayUrl = uploadUrl.replace(/^https?:\/\//, '').replace(/#.*$/, '');

  function print() {
    const frame = frameRef.current;
    if (!frame || !svg) return;
    const card = `
      <div class="card">
        ${title.trim() ? `<h1>${escapeHtml(title.trim())}</h1>` : ''}
        ${message.trim() ? `<p class="msg">${escapeHtml(message.trim())}</p>` : ''}
        <div class="qr">${svg}</div>
        <p class="how">Scan with your phone camera to upload your photos</p>
        <p class="url">${escapeHtml(displayUrl)}</p>
      </div>`;
    const cards = layout === 'four' ? card.repeat(4) : card;
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title || 'Photo QR code')}</title>
      <style>
        @page { margin: 0.4in; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Georgia, 'Times New Roman', serif; color: #241F2B; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .sheet { display: grid; justify-content: center; align-content: start; }
        .sheet.four { grid-template-columns: repeat(2, 3.6in); grid-auto-rows: 4.9in; }
        .sheet.one { grid-template-columns: 7in; grid-auto-rows: 9.6in; }
        .card { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
                padding: 0.3in; border: 1px dashed #BDB5AE; }
        h1 { font-weight: 400; margin: 0 0 0.08in; line-height: 1.15; }
        .msg { margin: 0 0 0.18in; color: #4A4350; }
        .qr svg { display: block; width: 100%; height: 100%; }
        .how { font-family: system-ui, sans-serif; margin: 0.16in 0 0.05in; color: #4A4350; }
        .url { font-family: system-ui, sans-serif; margin: 0; color: #6B6470; word-break: break-all; }
        .four h1 { font-size: 22pt; } .four .msg { font-size: 12pt; } .four .qr { width: 2.3in; height: 2.3in; }
        .four .how { font-size: 9pt; } .four .url { font-size: 8pt; }
        .one h1 { font-size: 40pt; } .one .msg { font-size: 20pt; } .one .qr { width: 5in; height: 5in; }
        .one .how { font-size: 14pt; } .one .url { font-size: 11pt; }
      </style></head><body><div class="sheet ${layout}">${cards}</div></body></html>`;
    frame.onload = () => {
      frame.onload = null;
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    };
    frame.srcdoc = doc;
  }

  async function download() {
    try {
      const png = await QRCode.toDataURL(uploadUrl, { errorCorrectionLevel: 'M', margin: 2, width: 1200 });
      const a = document.createElement('a');
      a.href = png;
      a.download = 'photo-upload-qr-code.png';
      a.click();
    } catch {
      setError(true);
    }
  }

  return (
    <section style={{ background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: 22, marginBottom: 28, maxWidth: 760 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 4px' }}>QR code for your tables</h2>
      <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 16px', lineHeight: 1.6 }}>
        Print this and place it on the tables at your event. Guests scan it with their phone camera and land right on the photo
        upload section of your page.
      </p>

      {!sectionOn && (
        <p role="alert" style={{ fontSize: 13, color: '#8A6800', background: '#FFF8E7', border: '1px solid #E8D9A8', borderRadius: 8, padding: '8px 12px', margin: '0 0 16px' }}>
          The Guest Photos section is hidden, so guests who scan the code won&rsquo;t find a place to upload. Switch it on above.
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        <div
          style={{ width: 200, flexShrink: 0, border: '1px solid #EDE8E3', borderRadius: 10, padding: 16, textAlign: 'center', background: '#fff', fontFamily: 'Georgia, serif', color: '#241F2B' }}
        >
          {title.trim() && <p style={{ fontSize: 15, margin: '0 0 2px', lineHeight: 1.2, overflowWrap: 'anywhere' }}>{title.trim()}</p>}
          {message.trim() && <p style={{ fontSize: 11, color: '#4A4350', margin: '0 0 10px', overflowWrap: 'anywhere' }}>{message.trim()}</p>}
          {error ? (
            <p style={{ fontSize: 12, color: '#B91C1C' }}>Couldn&rsquo;t create the QR code.</p>
          ) : svg ? (
            <div aria-label={`QR code for ${uploadUrl}`} role="img" style={{ width: 150, height: 150, margin: '0 auto' }} dangerouslySetInnerHTML={{ __html: svg }} />
          ) : (
            <div style={{ width: 150, height: 150, margin: '0 auto', background: '#F4F0EC', borderRadius: 6 }} />
          )}
          <p style={{ fontSize: 9, color: '#6B6470', margin: '8px 0 0', fontFamily: 'system-ui, sans-serif', overflowWrap: 'anywhere' }}>{displayUrl}</p>
        </div>

        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <label style={labelStyle} htmlFor="qr-title">Title</label>
          <input id="qr-title" style={inputStyle} value={title} maxLength={TITLE_MAX} onChange={(e) => setTitle(e.target.value)} />

          <label style={{ ...labelStyle, marginTop: 14 }} htmlFor="qr-message">Message</label>
          <input id="qr-message" style={inputStyle} value={message} maxLength={MESSAGE_MAX} onChange={(e) => setMessage(e.target.value)} />

          <fieldset style={{ border: 'none', padding: 0, margin: '14px 0 0' }}>
            <legend style={labelStyle}>Print layout</legend>
            {([
              ['four', '4 table cards per page', 'cut along the dashed lines'],
              ['one', '1 large sign per page', 'for an entrance or a photo booth'],
            ] as const).map(([value, name, sub]) => (
              <label key={value} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#241F2B', marginBottom: 6, cursor: 'pointer' }}>
                <input type="radio" name="qr-layout" value={value} checked={layout === value} onChange={() => setLayout(value)} style={{ marginTop: 3 }} />
                <span>{name} <span style={{ color: '#6B6470' }}>— {sub}</span></span>
              </label>
            ))}
          </fieldset>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
            <button type="button" onClick={print} disabled={!svg} style={{ ...btn, border: 'none', background: '#B6584A', color: '#fff', opacity: svg ? 1 : 0.55 }}>
              Print QR code
            </button>
            <button type="button" onClick={download} disabled={!svg} style={{ ...btn, border: '1px solid #DDD5CE', background: '#fff', color: '#241F2B' }}>
              Download PNG
            </button>
          </div>
        </div>
      </div>

      <iframe ref={frameRef} title="Printable QR code" aria-hidden="true" tabIndex={-1} style={{ position: 'fixed', right: 0, bottom: 0, width: 0, height: 0, border: 0 }} />
    </section>
  );
}
