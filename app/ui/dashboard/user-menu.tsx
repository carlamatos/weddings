'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { signOut } from 'next-auth/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { setPageStatus } from '@/app/lib/actions';

interface Profile {
  given_name: string;
  family_name: string;
  phone: string;
}

function ProfileModal({ onClose, onSaved }: { onClose: () => void; onSaved: (name: string) => void }) {
  const [form, setForm] = useState<Profile>({ given_name: '', family_name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        setForm({
          given_name: data.given_name ?? '',
          family_name: data.family_name ?? '',
          phone: data.phone ?? '',
        });
        setLoading(false);
      })
      .catch(() => { setError('Failed to load profile.'); setLoading(false); });
  }, []);

  const handleChange = (field: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); }
      else { setSuccess('Profile updated!'); onSaved(data.name); }
    } catch {
      setError('Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose} aria-label="Close">×</button>
        <h2>Edit Profile</h2>

        {loading ? (
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Loading…</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="profile-field">
                <label>Given name</label>
                <input value={form.given_name} onChange={handleChange('given_name')} required autoComplete="given-name" />
              </div>
              <div className="profile-field">
                <label>Family name</label>
                <input value={form.family_name} onChange={handleChange('family_name')} required autoComplete="family-name" />
              </div>
            </div>
            <div className="profile-field">
              <label>Phone</label>
              <input type="tel" value={form.phone} onChange={handleChange('phone')} autoComplete="tel" placeholder="Optional" />
            </div>

            {error && <p className="profile-modal-error">{error}</p>}
            {success && <p className="profile-modal-success">{success}</p>}

            <div className="profile-modal-actions">
              <button type="button" className="dash-btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="dash-btn" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

type SecurityStep = 'status' | 'confirm-password' | 'scan-qr' | 'backup-codes' | 'disable';

function SecurityModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [hasPassword, setHasPassword] = useState(true);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [step, setStep] = useState<SecurityStep>('status');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [password, setPassword] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disableCode, setDisableCode] = useState('');

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        setHasPassword(!!data.has_password);
        setTotpEnabled(!!data.totp_enabled);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load account status.'); setLoading(false); });
  }, []);

  async function startSetup() {
    setError('');
    if (hasPassword) {
      setStep('confirm-password');
      return;
    }
    await runSetup();
  }

  async function runSetup(pwd?: string) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/user/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pwd ? { password: pwd } : {}),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep('scan-qr');
    } catch {
      setError('Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmPassword(e: React.FormEvent) {
    e.preventDefault();
    await runSetup(password);
    setPassword('');
  }

  async function enable(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/user/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
      setBackupCodes(data.backupCodes);
      setTotpEnabled(true);
      setStep('backup-codes');
    } catch {
      setError('Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function disable(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/user/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: disableCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
      setTotpEnabled(false);
      setDisableCode('');
      setStep('status');
    } catch {
      setError('Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose} aria-label="Close">×</button>
        <h2>Security</h2>

        {loading ? (
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Loading…</p>
        ) : (
          <>
            {error && <p className="profile-modal-error">{error}</p>}

            {step === 'status' && (
              <>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 16px' }}>
                  Two-factor authentication is currently{' '}
                  <strong style={{ color: totpEnabled ? '#2E7D4F' : 'var(--ink)' }}>
                    {totpEnabled ? 'on' : 'off'}
                  </strong>.
                  {!totpEnabled && ' Add an authenticator app for an extra layer of protection on your account.'}
                </p>
                <div className="profile-modal-actions">
                  <button type="button" className="dash-btn-secondary" onClick={onClose}>Close</button>
                  {totpEnabled ? (
                    <button type="button" className="dash-btn" onClick={() => setStep('disable')}>
                      Disable 2FA
                    </button>
                  ) : (
                    <button type="button" className="dash-btn" onClick={startSetup} disabled={busy}>
                      {busy ? 'Starting…' : 'Enable 2FA'}
                    </button>
                  )}
                </div>
              </>
            )}

            {step === 'confirm-password' && (
              <form onSubmit={confirmPassword}>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 12px' }}>
                  Confirm your password to continue.
                </p>
                <div className="profile-field">
                  <label>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" autoFocus />
                </div>
                <div className="profile-modal-actions">
                  <button type="button" className="dash-btn-secondary" onClick={() => setStep('status')}>Cancel</button>
                  <button type="submit" className="dash-btn" disabled={busy}>{busy ? 'Checking…' : 'Continue'}</button>
                </div>
              </form>
            )}

            {step === 'scan-qr' && (
              <form onSubmit={enable}>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 12px' }}>
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.), then enter the 6-digit code it shows.
                </p>
                {qrCode && (
                  // eslint-disable-next-line @next/next/no-img-element -- data: URI, not a servable/optimizable asset
                  <img src={qrCode} alt="Scan with your authenticator app" style={{ display: 'block', margin: '0 auto 12px', width: 180, height: 180 }} />
                )}
                <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0 0 16px', textAlign: 'center', wordBreak: 'break-all' }}>
                  Can&apos;t scan it? Enter this code manually: <code>{secret}</code>
                </p>
                <div className="profile-field">
                  <label>6-digit code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    autoFocus
                    placeholder="123456"
                  />
                </div>
                <div className="profile-modal-actions">
                  <button type="button" className="dash-btn-secondary" onClick={() => setStep('status')}>Cancel</button>
                  <button type="submit" className="dash-btn" disabled={busy}>{busy ? 'Verifying…' : 'Enable'}</button>
                </div>
              </form>
            )}

            {step === 'backup-codes' && (
              <>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 12px' }}>
                  Two-factor authentication is on. Save these backup codes somewhere safe — each one can be used
                  once to sign in if you lose access to your authenticator app. They won&apos;t be shown again.
                </p>
                <div style={{ background: '#F7F4F1', borderRadius: 8, padding: '12px 16px', margin: '0 0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontFamily: 'monospace', fontSize: 13 }}>
                  {backupCodes.map((c) => <span key={c}>{c}</span>)}
                </div>
                <div className="profile-modal-actions">
                  <button type="button" className="dash-btn" onClick={onClose}>Done</button>
                </div>
              </>
            )}

            {step === 'disable' && (
              <form onSubmit={disable}>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 12px' }}>
                  Enter a code from your authenticator app, or one of your backup codes, to turn off two-factor authentication.
                </p>
                <div className="profile-field">
                  <label>Code</label>
                  <input
                    type="text"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value)}
                    required
                    autoFocus
                    placeholder="123456 or xxxxx-xxxxx"
                  />
                </div>
                <div className="profile-modal-actions">
                  <button type="button" className="dash-btn-secondary" onClick={() => setStep('status')}>Cancel</button>
                  <button type="submit" className="dash-btn" disabled={busy}>{busy ? 'Checking…' : 'Disable'}</button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function UserMenu({
  name,
  pageId,
  pageStatus,
}: {
  name: string;
  // Deactivate/reactivate applies to the page currently open in the
  // dashboard, so this is undefined outside a page context (setup, page list).
  pageId?: number;
  pageStatus?: string;
}) {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [displayName, setDisplayName] = useState(name);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const pageInactive = pageStatus === 'inactive';
  // Only an admin can lift a suspension, so the owner gets no toggle.
  const pageSuspended = pageStatus === 'suspended';

  function handleToggleStatus() {
    if (pageId === undefined || pageSuspended) return;
    const next = pageInactive ? 'active' : 'inactive';
    if (
      next === 'inactive' &&
      !window.confirm('Deactivate your page?\n\nGuests will see a "page unavailable" message until you reactivate it. You can turn it back on any time.')
    ) {
      return;
    }
    setOpen(false);
    setStatusError(null);
    startTransition(async () => {
      const result = await setPageStatus(pageId, next);
      if (result.error) setStatusError(result.error);
    });
  }

  return (
    <>
      <div ref={ref} style={{ position: 'relative' }}>
        <button onClick={() => setOpen((o) => !o)} className="dash-user dash-user--btn">
          <UserCircleIcon />
          <span>{displayName}</span>
        </button>

        {open && (
          <div className="dash-user-menu">
            <button
              onClick={() => { setOpen(false); setShowProfile(true); }}
              className="dash-user-menu-item"
            >
              Edit Profile
            </button>
            <button
              onClick={() => { setOpen(false); setShowSecurity(true); }}
              className="dash-user-menu-item"
            >
              Security
            </button>
            {pageId !== undefined && (
              <button
                onClick={handleToggleStatus}
                disabled={isPending || pageSuspended}
                className="dash-user-menu-item dash-user-menu-item--danger"
                title={pageSuspended ? 'Suspended by MyGala — contact us to have it reviewed' : undefined}
                style={pageSuspended ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                {pageSuspended ? 'Page suspended' : isPending ? 'Saving…' : pageInactive ? 'Reactivate my page' : 'Deactivate my page'}
              </button>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="dash-user-menu-item"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      {statusError && (
        <div role="alert" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#fff', border: '1px solid #E0D5D0', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#8B3A2A', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 20, whiteSpace: 'nowrap' }}>
          {statusError}
        </div>
      )}

      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
          onSaved={(newName) => setDisplayName(newName)}
        />
      )}

      {showSecurity && <SecurityModal onClose={() => setShowSecurity(false)} />}
    </>
  );
}
