'use client';

import { useState } from 'react';
import { savePagePassword } from '@/app/lib/actions';
import { PAGE_PASSWORD_MAX, PAGE_PASSWORD_MIN } from '@/app/lib/page-password';

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: '1px solid #EDE8E3', borderRadius: 8, fontSize: 14,
  fontFamily: 'inherit', color: '#241F2B', outline: 'none', width: '100%', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', marginBottom: 6,
};

export function PagePasswordForm({ pageId, initialEnabled, hasPassword: initialHasPassword }: { pageId: number; initialEnabled: boolean; hasPassword: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  async function save(next: { enabled: boolean; password?: string }) {
    setSaving(true);
    setMessage(null);
    const result = await savePagePassword(pageId, next);
    setSaving(false);
    if (!result.ok) {
      setMessage({ kind: 'error', text: result.error });
      return;
    }
    setEnabled(result.value.enabled);
    setHasPassword(result.value.hasPassword);
    setPassword('');
    setMessage({
      kind: 'ok',
      text: next.password
        ? result.value.enabled ? 'Password saved. Guests now need it to open your page.' : 'Password saved.'
        : result.value.enabled ? 'Protection is on.' : 'Protection is off — anyone with the link can open your page.',
    });
  }

  const tooShort = password.length > 0 && password.length < PAGE_PASSWORD_MIN;

  return (
    <div style={{ background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: 22, maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Password protection"
          disabled={saving || (!enabled && !hasPassword && !password)}
          onClick={() => save({ enabled: !enabled, password: !enabled && password ? password : undefined })}
          style={{
            position: 'relative', width: 40, height: 22, borderRadius: 999, border: 'none', padding: 0, flexShrink: 0,
            background: enabled ? '#3D6B46' : '#D9D2CB', cursor: saving ? 'default' : 'pointer',
            opacity: saving || (!enabled && !hasPassword && !password) ? 0.6 : 1,
          }}
        >
          <span style={{ position: 'absolute', top: 2, left: enabled ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 0.15s ease' }} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#241F2B' }}>
          Password protection — <strong>{enabled ? 'On' : 'Off'}</strong>
        </span>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (password && !tooShort) save({ enabled, password }); }}>
        <label style={labelStyle} htmlFor="page-password">{hasPassword ? 'Change the password' : 'Set a password'}</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            id="page-password"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            style={inputStyle}
            value={password}
            minLength={PAGE_PASSWORD_MIN}
            maxLength={PAGE_PASSWORD_MAX}
            placeholder={hasPassword ? 'Enter a new password' : `At least ${PAGE_PASSWORD_MIN} characters`}
            onChange={(e) => { setPassword(e.target.value); setMessage(null); }}
          />
          <button type="button" onClick={() => setShow((v) => !v)} style={{ padding: '0 14px', borderRadius: 8, border: '1px solid #DDD5CE', background: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: tooShort ? '#B91C1C' : '#6B6470', margin: '6px 0 0' }}>
          {tooShort
            ? `Use at least ${PAGE_PASSWORD_MIN} characters.`
            : 'Share it with your guests along with the link. Changing it asks everyone to enter the new password.'}
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end', marginTop: 16 }}>
          {message && <span role="status" style={{ fontSize: 13, color: message.kind === 'ok' ? '#3D6B46' : '#B91C1C' }}>{message.text}</span>}
          <button
            type="submit"
            disabled={!password || tooShort || saving}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#B6584A', color: '#fff', fontWeight: 600, fontSize: 14, fontFamily: 'inherit', cursor: !password || tooShort || saving ? 'default' : 'pointer', opacity: !password || tooShort || saving ? 0.55 : 1 }}
          >
            {saving ? 'Saving…' : 'Save password'}
          </button>
        </div>
      </form>
    </div>
  );
}
