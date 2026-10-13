'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import { deletePage } from '@/app/lib/actions';

export type DeletablePage = { id: number; slug: string; heading?: string | null; isPaid?: boolean };

// "Delete this event page?" — explains what happens, then asks the owner to
// type the page's address before the button unlocks. The page goes to the
// trash for 30 days (restorable by MyGala), see deletePage. Rendered at the
// end of the dashboard root: inside an event card (e.g. a faded past event)
// the overlay would be trapped below the cards after it.
export function DeletePageDialog({ page, onClose }: { page: DeletablePage; onClose: () => void }) {
  const router = useRouter();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = typed.trim().toLowerCase() === page.slug.toLowerCase();
  const name = page.heading?.trim() || 'this event';

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!matches || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await deletePage(page.id, typed);
      if (result.error) {
        setError(result.error);
        setBusy(false);
        return;
      }
      router.push('/dashboard?deleted=1');
      router.refresh();
    } catch {
      setError('Something went wrong — your page was not deleted. Please try again.');
      setBusy(false);
    }
  }

  return createPortal(
    <div className="profile-modal-backdrop" onClick={() => !busy && onClose()}>
      <div className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="delete-page-title" onClick={(e) => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose} aria-label="Close" disabled={busy}>×</button>
        <h2 id="delete-page-title">Delete {name}?</h2>

        <div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65 }}>
          <p style={{ margin: '0 0 10px' }}>This takes your event page down right away:</p>
          <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
            <li>Guests who open the link will see that the page doesn&rsquo;t exist.</li>
            <li>Its guest list, RSVPs, photos, songs and settings are removed from your dashboard.</li>
            {page.isPaid && <li>Any Plus time left on this page is not refunded.</li>}
          </ul>
          <p style={{ margin: '0 0 16px', padding: '10px 12px', background: '#FFF8E7', border: '1px solid #E8D9A8', borderRadius: 8, color: '#6B5200' }}>
            Changed your mind? We keep a copy for <strong>30 days</strong> — contact us within that time and we can restore it.
          </p>
        </div>

        <form onSubmit={handleDelete}>
          <div className="profile-field">
            <label htmlFor="delete-page-confirm" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)' }}>
              To confirm, type the page address <strong style={{ userSelect: 'all', color: 'var(--ink)' }}>{page.slug}</strong>
            </label>
            <input
              id="delete-page-confirm"
              ref={inputRef}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder={page.slug}
              disabled={busy}
            />
          </div>

          {error && <p className="profile-modal-error" role="alert">{error}</p>}

          <div className="profile-modal-actions">
            <button type="button" className="dash-btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
            <button
              type="submit"
              className="dash-btn dash-btn--danger"
              disabled={!matches || busy}
            >
              {busy ? 'Deleting…' : 'Delete page'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    // Inside the dashboard root (its colours and fonts), outside every card.
    document.querySelector('.dash') ?? document.body,
  );
}

// "Delete" on an event card in the Event pages list.
export function DeletePageButton({ page }: { page: DeletablePage }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${page.heading || 'event'} page`}
        className="dash-card-delete"
      >
        <TrashIcon style={{ width: 16, height: 16 }} /> Delete
      </button>
      {open && <DeletePageDialog page={page} onClose={() => setOpen(false)} />}
    </>
  );
}
