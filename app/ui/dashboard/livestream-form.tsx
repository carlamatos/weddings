'use client';

import { useState } from 'react';
import { saveLivestream } from '@/app/lib/actions';
import {
  isLivestreamLink,
  livestreamEmbedUrl,
  normalizeLivestreamInput,
  LIVESTREAM_BUTTON_TEXT_MAX,
  LIVESTREAM_MESSAGE_MAX,
  LIVESTREAM_URL_MAX,
  type LivestreamDisplay,
} from '@/app/lib/livestream';

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: '1px solid #EDE8E3', borderRadius: 8, fontSize: 14,
  fontFamily: 'inherit', color: '#241F2B', outline: 'none', width: '100%', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', marginBottom: 6,
};
const hintStyle: React.CSSProperties = { fontSize: 12, color: '#6B6470', margin: '6px 0 0' };

type Values = { url: string; display: LivestreamDisplay; buttonText: string; message: string };

export function LivestreamForm({ pageId, initial }: { pageId: number; initial: Values }) {
  const [values, setValues] = useState<Values>(initial);
  const [saved, setSaved] = useState<Values>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const dirty =
    values.url.trim() !== saved.url || values.display !== saved.display ||
    values.buttonText.trim() !== saved.buttonText || values.message.trim() !== saved.message;
  const isEmpty = !saved.url;

  // What guests will get, worked out from the link as it is typed.
  const link = normalizeLivestreamInput(values.url);
  const validLink = !!link && isLivestreamLink(link);
  const embeddable = validLink && !!livestreamEmbedUrl(link);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const result = await saveLivestream(pageId, values);
    setSaving(false);
    if (!result.ok) {
      setMessage({ kind: 'error', text: result.error });
      return;
    }
    // The server tidies the input (e.g. keeps only an iframe's src); show what was stored.
    setValues(result.value);
    setSaved(result.value);
    setMessage({ kind: 'ok', text: 'Saved.' });
  }

  return (
    <form onSubmit={save} style={{ background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: 22, maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: isEmpty ? '#6B6470' : '#3D6B46' }}>
          {isEmpty ? 'Empty — not shown on your page' : 'Shown on your page'}
        </span>
      </div>

      <label style={labelStyle} htmlFor="livestream-url">Live stream link or embed code</label>
      <textarea
        id="livestream-url"
        style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }}
        value={values.url}
        maxLength={LIVESTREAM_URL_MAX * 2}
        placeholder="https://www.youtube.com/live/…  or paste an <iframe> embed code"
        onChange={(e) => set('url', e.target.value)}
      />
      <p style={hintStyle}>
        YouTube, Vimeo, Twitch and Facebook videos can play right on your page. Any other link (Zoom, Google Meet, Instagram…) shows as a button.
      </p>

      <fieldset style={{ border: 'none', padding: 0, margin: '18px 0 0' }}>
        <legend style={labelStyle}>Show it as</legend>
        {([
          ['embed', 'Video player on the page', 'Guests watch without leaving your page.'],
          ['link', 'A “Watch live” button', 'Opens the stream in a new tab.'],
        ] as const).map(([value, title, sub]) => (
          <label key={value} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#241F2B', marginBottom: 8, cursor: 'pointer' }}>
            <input type="radio" name="livestream-display" value={value} checked={values.display === value} onChange={() => set('display', value)} style={{ marginTop: 3 }} />
            <span><strong style={{ fontWeight: 600 }}>{title}</strong> <span style={{ color: '#6B6470' }}>— {sub}</span></span>
          </label>
        ))}
      </fieldset>
      {validLink && values.display === 'embed' && !embeddable && (
        <p role="note" style={{ fontSize: 13, color: '#8A6800', background: '#FFF8E7', border: '1px solid #E8D9A8', borderRadius: 8, padding: '8px 12px', margin: '4px 0 0' }}>
          This link can’t be played inside your page, so guests will see a “Watch live” button instead.
        </p>
      )}

      <label style={{ ...labelStyle, marginTop: 18 }} htmlFor="livestream-button">Button label (optional)</label>
      <input
        id="livestream-button"
        style={inputStyle}
        value={values.buttonText}
        maxLength={LIVESTREAM_BUTTON_TEXT_MAX}
        placeholder={values.display === 'embed' && embeddable ? 'Open the stream in a new tab' : 'Watch live'}
        onChange={(e) => set('buttonText', e.target.value)}
      />

      <label style={{ ...labelStyle, marginTop: 18 }} htmlFor="livestream-message">Message (optional)</label>
      <textarea
        id="livestream-message"
        style={{ ...inputStyle, minHeight: 96, resize: 'vertical' }}
        value={values.message}
        maxLength={LIVESTREAM_MESSAGE_MAX}
        placeholder="e.g. Can’t be there in person? The ceremony streams live from 3:30 PM."
        onChange={(e) => set('message', e.target.value)}
      />
      <p style={{ ...hintStyle, textAlign: 'right' }}>{values.message.length} / {LIVESTREAM_MESSAGE_MAX}</p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end', marginTop: 14 }}>
        {message && (
          <span role="status" style={{ fontSize: 13, color: message.kind === 'ok' ? '#3D6B46' : '#B91C1C' }}>{message.text}</span>
        )}
        <button
          type="submit"
          disabled={!dirty || saving}
          style={{
            padding: '9px 20px', borderRadius: 8, border: 'none', background: '#B6584A', color: '#fff',
            fontWeight: 600, fontSize: 14, cursor: !dirty || saving ? 'default' : 'pointer', fontFamily: 'inherit',
            opacity: !dirty || saving ? 0.55 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save live stream'}
        </button>
      </div>
    </form>
  );
}
