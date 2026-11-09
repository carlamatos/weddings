'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { setPageStatus } from '@/app/lib/actions';
import { DeletePageDialog, type DeletablePage } from './delete-page-dialog';
import { ShareSheet, type ShareChoice } from './share-menu';
import ThemeSwitcher from './theme-switcher';
import LanguageSwitcher from './language-switcher';
import { DashLanguagePicker } from './dash-language-picker';
import type { EventTheme } from '@/app/lib/definitions';
import { PHONE_MAX_LENGTH } from '@/app/lib/phone';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
// On phones and tablets: the top bar's buttons, listed at the top of this
// menu instead (see .dash-topnav-actions in dashboard.css).
export type PhoneActions = {
  pageId: number;
  themes: EventTheme[];
  currentThemeId: string | null;
  language: string;
  previewHref?: string;
  shareChoices: ShareChoice[];
};

// The setup checklist's "Add your name" step opens the profile from here
// (the user menu is in the top bar on every dashboard screen; the checklist
// can sit in the phone menu, which closes on any click).
const OPEN_PROFILE_EVENT = 'mygala:open-profile';
export function openProfile() {
  window.dispatchEvent(new Event(OPEN_PROFILE_EVENT));
}

interface Profile {
  given_name: string;
  family_name: string;
  phone: string;
}

function ProfileModal({ onClose, onSaved }: { onClose: () => void; onSaved: (name: string) => void }) {
  const d = useDashText();
  const [form, setForm] = useState<Profile>({ given_name: '', family_name: '', phone: '' });
  const [email, setEmail] = useState(''); // shown for reference only; not editable
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
        setEmail(data.email ?? '');
        setLoading(false);
      })
      .catch(() => { setError(d.userMenu.failedToLoadProfile); setLoading(false); });
  }, [d.userMenu.failedToLoadProfile]);

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
      if (!res.ok) { setError(data.error ?? d.userMenu.somethingWentWrong); }
      else { setSuccess(d.userMenu.profileUpdated); onSaved(data.name); }
    } catch {
      setError(d.userMenu.somethingWentWrong);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose} aria-label={d.userMenu.close}>×</button>
        <h2>{d.userMenu.yourProfile}</h2>

        {loading ? (
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>{d.userMenu.loading}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="profile-field">
                <label htmlFor="profile-given">{d.userMenu.firstName}</label>
                <input id="profile-given" value={form.given_name} onChange={handleChange('given_name')} required autoComplete="given-name" />
              </div>
              <div className="profile-field">
                <label htmlFor="profile-family">{d.userMenu.lastName}</label>
                <input id="profile-family" value={form.family_name} onChange={handleChange('family_name')} required autoComplete="family-name" />
              </div>
            </div>
            <div className="profile-field">
              <label htmlFor="profile-email">{d.userMenu.email}</label>
              <input id="profile-email" type="email" value={email} disabled readOnly aria-describedby="profile-email-note" />
              <p id="profile-email-note" className="profile-field-note">{d.userMenu.thisIsTheEmailYou}</p>
            </div>
            <div className="profile-field">
              <label htmlFor="profile-phone">{rich(d.userMenu.phoneOptional, { t0: (s) => <span className="profile-field-optional">{s}</span> })}</label>
              <input id="profile-phone" type="tel" value={form.phone} onChange={handleChange('phone')} autoComplete="tel" inputMode="tel" maxLength={PHONE_MAX_LENGTH} placeholder="+1 (555) 000-0000" />
            </div>

            {error && <p className="profile-modal-error">{error}</p>}
            {success && <p className="profile-modal-success">{success}</p>}

            <div className="profile-modal-actions">
              <button type="button" className="dash-btn-secondary" onClick={onClose}>{d.userMenu.cancel}</button>
              <button type="submit" className="dash-btn" disabled={saving}>
                {saving ? d.userMenu.saving : d.userMenu.save}
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
  const d = useDashText();
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
      .catch(() => { setError(d.userMenu.failedToLoadAccountStatus); setLoading(false); });
  }, [d.userMenu.failedToLoadAccountStatus]);

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
      if (!res.ok) { setError(data.error ?? d.userMenu.somethingWentWrong); return; }
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep('scan-qr');
    } catch {
      setError(d.userMenu.somethingWentWrong);
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
      if (!res.ok) { setError(data.error ?? d.userMenu.somethingWentWrong); return; }
      setBackupCodes(data.backupCodes);
      setTotpEnabled(true);
      setStep('backup-codes');
    } catch {
      setError(d.userMenu.somethingWentWrong);
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
      if (!res.ok) { setError(data.error ?? d.userMenu.somethingWentWrong); return; }
      setTotpEnabled(false);
      setDisableCode('');
      setStep('status');
    } catch {
      setError(d.userMenu.somethingWentWrong);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose} aria-label={d.userMenu.close}>×</button>
        <h2>{d.userMenu.security}</h2>

        {loading ? (
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>{d.userMenu.loading}</p>
        ) : (
          <>
            {error && <p className="profile-modal-error">{error}</p>}

            {step === 'status' && (
              <>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 16px' }}>
                  {d.userMenu.twoFactorAuthenticationIsCurrently}{' '}
                  <strong style={{ color: totpEnabled ? '#2E7D4F' : 'var(--ink)' }}>
                    {totpEnabled ? d.userMenu.on : d.userMenu.off}
                  </strong>.
                  {!totpEnabled && d.userMenu.addAnAuthenticatorAppFor}
                </p>
                <div className="profile-modal-actions">
                  <button type="button" className="dash-btn-secondary" onClick={onClose}>{d.userMenu.close}</button>
                  {totpEnabled ? (
                    <button type="button" className="dash-btn" onClick={() => setStep('disable')}>
                      {d.userMenu.disable2fa}
                    </button>
                  ) : (
                    <button type="button" className="dash-btn" onClick={startSetup} disabled={busy}>
                      {busy ? d.userMenu.starting : d.userMenu.enable2fa}
                    </button>
                  )}
                </div>
              </>
            )}

            {step === 'confirm-password' && (
              <form onSubmit={confirmPassword}>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 12px' }}>
                  {d.userMenu.confirmYourPasswordToContinue}
                </p>
                <div className="profile-field">
                  <label>{d.userMenu.password}</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" autoFocus />
                </div>
                <div className="profile-modal-actions">
                  <button type="button" className="dash-btn-secondary" onClick={() => setStep('status')}>{d.userMenu.cancel}</button>
                  <button type="submit" className="dash-btn" disabled={busy}>{busy ? d.userMenu.checking : d.userMenu.continue}</button>
                </div>
              </form>
            )}

            {step === 'scan-qr' && (
              <form onSubmit={enable}>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 12px' }}>
                  {d.userMenu.scanThisQrCodeWith}
                </p>
                {qrCode && (
                  // eslint-disable-next-line @next/next/no-img-element -- data: URI, not a servable/optimizable asset
                  <img src={qrCode} alt={d.userMenu.scanWithYourAuthenticatorApp} style={{ display: 'block', margin: '0 auto 12px', width: 180, height: 180 }} />
                )}
                <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0 0 16px', textAlign: 'center', wordBreak: 'break-all' }}>
                  {rich(fill(d.userMenu.canTScanItEnter, { secret }), { t0: (s) => <code>{s}</code> })}
                </p>
                <div className="profile-field">
                  <label>{d.userMenu.n6DigitCode}</label>
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
                  <button type="button" className="dash-btn-secondary" onClick={() => setStep('status')}>{d.userMenu.cancel}</button>
                  <button type="submit" className="dash-btn" disabled={busy}>{busy ? d.userMenu.verifying : d.userMenu.enable}</button>
                </div>
              </form>
            )}

            {step === 'backup-codes' && (
              <>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 12px' }}>
                  {d.userMenu.twoFactorAuthenticationIsOn}
                </p>
                <div style={{ background: '#F7F4F1', borderRadius: 8, padding: '12px 16px', margin: '0 0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontFamily: 'monospace', fontSize: 13 }}>
                  {backupCodes.map((c) => <span key={c}>{c}</span>)}
                </div>
                <div className="profile-modal-actions">
                  <button type="button" className="dash-btn" onClick={onClose}>{d.userMenu.done}</button>
                </div>
              </>
            )}

            {step === 'disable' && (
              <form onSubmit={disable}>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 12px' }}>
                  {d.userMenu.enterACodeFromYour}
                </p>
                <div className="profile-field">
                  <label>{d.userMenu.code}</label>
                  <input
                    type="text"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value)}
                    required
                    autoFocus
                    placeholder={d.userMenu.n123456OrXxxxxXxxxx}
                  />
                </div>
                <div className="profile-modal-actions">
                  <button type="button" className="dash-btn-secondary" onClick={() => setStep('status')}>{d.userMenu.cancel}</button>
                  <button type="submit" className="dash-btn" disabled={busy}>{busy ? d.userMenu.checking : d.userMenu.disable}</button>
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
  page,
  phoneActions,
}: {
  name: string;
  // Deactivate/reactivate applies to the page currently open in the
  // dashboard, so this is undefined outside a page context (setup, page list).
  pageId?: number;
  pageStatus?: string;
  // The open page, for "Delete this page…".
  page?: DeletablePage;
  phoneActions?: PhoneActions;
}) {
  const d = useDashText();
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [displayName, setDisplayName] = useState(name);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const show = () => { setOpen(false); setShowProfile(true); };
    window.addEventListener(OPEN_PROFILE_EVENT, show);
    return () => window.removeEventListener(OPEN_PROFILE_EVENT, show);
  }, []);

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
      !window.confirm(d.userMenu.deactivateYourPageGuestsWill)
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
            {phoneActions && (
              <div className="dash-user-menu-phone">
                <button onClick={() => { setOpen(false); setSharing(true); }} className="dash-user-menu-item">
                  {d.userMenu.share}
                </button>
                {phoneActions.previewHref && (
                  <a href={phoneActions.previewHref} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="dash-user-menu-item">
                    {d.userMenu.viewYourPage}
                  </a>
                )}
                {phoneActions.themes.length > 0 && (
                  <div className="dash-user-menu-picker">
                    <p className="mobile-menu-theme-label">{d.userMenu.theme}</p>
                    <ThemeSwitcher pageId={phoneActions.pageId} currentThemeId={phoneActions.currentThemeId} themes={phoneActions.themes} />
                  </div>
                )}
                <div className="dash-user-menu-picker">
                  <p className="mobile-menu-theme-label">{d.userMenu.language}</p>
                  <LanguageSwitcher pageId={phoneActions.pageId} currentLanguage={phoneActions.language} />
                </div>
              </div>
            )}
            <button
              onClick={() => { setOpen(false); setShowProfile(true); }}
              className="dash-user-menu-item"
            >
              {d.userMenu.editProfile}
            </button>
            <button
              onClick={() => { setOpen(false); setShowSecurity(true); }}
              className="dash-user-menu-item"
            >
              {d.userMenu.security}
            </button>
            <DashLanguagePicker />
            {pageId !== undefined && pageStatus !== 'draft' && (
              <button
                onClick={handleToggleStatus}
                disabled={isPending || pageSuspended}
                className="dash-user-menu-item dash-user-menu-item--danger"
                title={pageSuspended ? d.userMenu.suspendedByMygalaContactUs : undefined}
                style={pageSuspended ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                {pageSuspended ? d.userMenu.pageSuspended : isPending ? d.userMenu.saving : pageInactive ? d.userMenu.reactivateMyPage : d.userMenu.deactivateMyPage}
              </button>
            )}
            {page && !pageSuspended && (
              <button
                onClick={() => { setOpen(false); setShowDelete(true); }}
                className="dash-user-menu-item dash-user-menu-item--danger"
              >
                {d.userMenu.deleteThisPage}
              </button>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="dash-user-menu-item"
            >
              {d.userMenu.signOut}
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
          // refresh: the setup checklist's "Add your name" step is now done.
          onSaved={(newName) => { setDisplayName(newName); router.refresh(); }}
        />
      )}

      {showSecurity && <SecurityModal onClose={() => setShowSecurity(false)} />}

      {showDelete && page && <DeletePageDialog page={page} onClose={() => setShowDelete(false)} />}

      {sharing && phoneActions && <ShareSheet choices={phoneActions.shareChoices} onClose={() => setSharing(false)} />}
    </>
  );
}
