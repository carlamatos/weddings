'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

interface Profile {
  given_name: string;
  family_name: string;
  phone: string;
}

function ProfileModal({ onClose, onSaved }: { onClose: () => void; onSaved: (name: string) => void }) {
  const [form, setForm] = useState<Profile>({ given_name: '', family_name: '', email: '', phone: '' });
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

export default function UserMenu({ name, isPaid }: { name: string; isPaid: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [displayName, setDisplayName] = useState(name);
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

  async function handleCancelSubscription() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
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
            {isPaid && (
              <button
                onClick={handleCancelSubscription}
                disabled={loading}
                className="dash-user-menu-item dash-user-menu-item--danger"
              >
                {loading ? 'Redirecting…' : 'Cancel Subscription'}
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

      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
          onSaved={(newName) => setDisplayName(newName)}
        />
      )}
    </>
  );
}
