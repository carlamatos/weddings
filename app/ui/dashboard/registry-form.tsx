'use client';

import { useState } from 'react';
import { saveRegistry } from '@/app/lib/actions';
import { REGISTRY_BUTTON_TEXT_MAX, REGISTRY_LINK_MAX, REGISTRY_MESSAGE_MAX } from '@/app/lib/registry';

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: '1px solid #EDE8E3', borderRadius: 8, fontSize: 14,
  fontFamily: 'inherit', color: '#241F2B', outline: 'none', width: '100%', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', marginBottom: 6,
};
const hintStyle: React.CSSProperties = { fontSize: 12, color: '#6B6470', margin: '6px 0 0' };

type Values = { link: string; buttonText: string; message: string };

export function RegistryForm({ pageId, initial }: { pageId: number; initial: Values }) {
  const [values, setValues] = useState<Values>(initial);
  const [saved, setSaved] = useState<Values>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const dirty = values.link.trim() !== saved.link || values.buttonText.trim() !== saved.buttonText || values.message.trim() !== saved.message;
  const isEmpty = !saved.link && !saved.message;

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const result = await saveRegistry(pageId, values);
    setSaving(false);
    if (!result.ok) {
      setMessage({ kind: 'error', text: result.error });
      return;
    }
    // The server tidies the input (e.g. adds https://); show what was stored.
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

      <label style={labelStyle} htmlFor="registry-link">Registry link</label>
      <input
        id="registry-link"
        type="text"
        inputMode="url"
        style={inputStyle}
        value={values.link}
        maxLength={REGISTRY_LINK_MAX}
        placeholder="https://www.amazon.ca/baby-reg/…"
        onChange={(e) => set('link', e.target.value)}
      />
      <p style={hintStyle}>Where guests can see your list — Amazon, Babylist, a store, or your own page.</p>

      <label style={{ ...labelStyle, marginTop: 18 }} htmlFor="registry-button">Button label (optional)</label>
      <input
        id="registry-button"
        style={inputStyle}
        value={values.buttonText}
        maxLength={REGISTRY_BUTTON_TEXT_MAX}
        placeholder="View registry"
        onChange={(e) => set('buttonText', e.target.value)}
      />

      <label style={{ ...labelStyle, marginTop: 18 }} htmlFor="registry-message">Message (optional)</label>
      <textarea
        id="registry-message"
        style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
        value={values.message}
        maxLength={REGISTRY_MESSAGE_MAX}
        placeholder="Anything else guests should know — e.g. your presence is the best gift, or we'd love contributions to a college fund."
        onChange={(e) => set('message', e.target.value)}
      />
      <p style={{ ...hintStyle, textAlign: 'right' }}>{values.message.length} / {REGISTRY_MESSAGE_MAX}</p>

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
          {saving ? 'Saving…' : 'Save registry'}
        </button>
      </div>
    </form>
  );
}
