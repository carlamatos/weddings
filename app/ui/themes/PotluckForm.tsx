'use client';

import { useState } from 'react';
import type { Translations } from '@/app/lib/translations';
import { POTLUCK_ITEMS_MAX, POTLUCK_NAME_MAX, POTLUCK_NOTE_MAX, type PotluckProps, type PotluckPublicEntry } from '@/app/lib/potluck';

// The Potluck section's form (Plus): guests say what they're bringing. Uses
// the RSVP form's classes, so each theme styles it like its RSVP card.
// Re-submitting with the same email updates the entry (see /api/potluck).
export default function PotluckForm({
  potluck,
  translations: t,
  disabled = false,
}: {
  potluck: PotluckProps;
  translations: Translations;
  disabled?: boolean;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [items, setItems] = useState('');
  const [note, setNote] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<'added' | 'updated' | null>(null);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState<PotluckPublicEntry[]>(potluck.entries);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    if (!name.trim()) { setError(t.errorName); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError(t.errorEmail); return; }
    if (!items.trim()) { setError(t.potluckItems); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/potluck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: potluck.token, name, email, items, note, honeypot }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t.errorGeneral);
        return;
      }
      setDone(data.updated ? 'updated' : 'added');
      if (potluck.showEntries && data.entry) {
        // Show the guest's own entry straight away (replacing an older one).
        setEntries((prev) => [data.entry as PotluckPublicEntry, ...prev.filter((p) => p.name !== data.entry.name)]);
      }
    } catch {
      setError(t.errorGeneral);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {done ? (
        <div className="rsvp-success">
          <p className="rsvp-headline">{done === 'updated' ? t.potluckUpdated : t.potluckThanks}</p>
          <button type="button" className="btn" style={{ width: 'fit-content', margin: '16px auto 0' }} onClick={() => setDone(null)}>
            {t.potluckAnother}
          </button>
        </div>
      ) : (
        <form className="rsvp-form" onSubmit={submit} noValidate>
          {disabled && (
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6B6470', background: 'rgba(0,0,0,0.05)', border: '1px dashed rgba(0,0,0,0.2)', borderRadius: 6, padding: '10px 14px', margin: 0 }}>
              Preview only — guests can sign up from your live page.
            </p>
          )}
          <fieldset disabled={disabled} style={{ display: 'contents' }}>
            <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
              <label htmlFor="potluck-website">Website</label>
              <input type="text" id="potluck-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="potluck-name">{t.fullName}</label>
              <input type="text" id="potluck-name" value={name} maxLength={POTLUCK_NAME_MAX} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
            </div>
            <div>
              <label className="field-label" htmlFor="potluck-email">{t.email}</label>
              <input type="email" id="potluck-email" value={email} maxLength={254} onChange={(e) => setEmail(e.target.value)} placeholder="jane@email.com" required />
              <p className="check-hint">{t.potluckEmailHint}</p>
            </div>
            <div>
              <label className="field-label" htmlFor="potluck-items">{t.potluckItems}</label>
              <textarea id="potluck-items" value={items} rows={3} maxLength={POTLUCK_ITEMS_MAX} onChange={(e) => setItems(e.target.value)} placeholder={t.potluckItemsPlaceholder} style={{ resize: 'vertical' }} required />
            </div>
            <div>
              <label className="field-label" htmlFor="potluck-note">{t.potluckNote}</label>
              <textarea id="potluck-note" value={note} rows={2} maxLength={POTLUCK_NOTE_MAX} onChange={(e) => setNote(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            {error && <p className="rsvp-error">{error}</p>}
            <button type="submit" className="btn" disabled={submitting} style={{ width: 'fit-content' }}>
              {submitting ? t.sending : t.potluckSend}
            </button>
          </fieldset>
        </form>
      )}

      {potluck.showEntries && (
        <div style={{ marginTop: 28, textAlign: 'left' }}>
          <p className="field-label" style={{ marginBottom: 10 }}>{t.potluckListTitle}</p>
          {entries.length === 0 ? (
            <p className="check-hint">{t.potluckEmpty}</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {entries.map((entry, i) => (
                <li key={`${entry.name}-${i}`} style={{ lineHeight: 1.5, overflowWrap: 'anywhere' }}>
                  <strong>{entry.name}</strong> — <span style={{ whiteSpace: 'pre-line' }}>{entry.items}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
