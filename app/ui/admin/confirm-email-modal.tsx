'use client';

import { useState } from 'react';
import { alertError, alertOk, buttonBase, c } from './styles';

export type ConfirmResult = { error: string } | { success: string };

// Destructive-action confirmation: the button stays disabled until the admin
// types the account's email exactly. The server re-checks it too. Failures
// (e.g. "active subscription") are shown here as a red alert.
export default function ConfirmEmailModal({
  title,
  description,
  email,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  email: string;
  confirmLabel: string;
  onConfirm: (typedEmail: string) => Promise<ConfirmResult>;
  onClose: () => void;
}) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ConfirmResult | null>(null);

  const matches = typed.trim().toLowerCase() === email.toLowerCase();
  const done = result !== null && 'success' in result;

  async function submit() {
    setBusy(true);
    setResult(null);
    try {
      setResult(await onConfirm(typed));
    } catch {
      setResult({ error: 'Network error. Nothing was changed — please try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={busy ? undefined : onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(36,31,43,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 14, padding: 24, width: '100%', maxWidth: 460, color: c.ink }}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>{title}</h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: c.soft, lineHeight: 1.6 }}>{description}</p>

        {done ? (
          <div style={alertOk}>{(result as { success: string }).success}</div>
        ) : (
          <>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
              Type <strong>{email}</strong> to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoFocus
              autoComplete="off"
              disabled={busy}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${c.line}`,
                fontSize: 14,
              }}
            />
            {result && 'error' in result && (
              <div role="alert" style={{ ...alertError, marginTop: 12 }}>
                {result.error}
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button type="button" onClick={onClose} disabled={busy} style={buttonBase}>
            {done ? 'Close' : 'Cancel'}
          </button>
          {!done && (
            <button
              type="button"
              onClick={submit}
              disabled={!matches || busy}
              style={{
                ...buttonBase,
                background: c.red,
                borderColor: c.red,
                color: '#fff',
                opacity: !matches || busy ? 0.45 : 1,
                cursor: !matches || busy ? 'not-allowed' : 'pointer',
              }}
            >
              {busy ? 'Working…' : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
