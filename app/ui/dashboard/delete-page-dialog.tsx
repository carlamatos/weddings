'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import { deletePage } from '@/app/lib/actions';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
export type DeletablePage = { id: number; slug: string; heading?: string | null; isPaid?: boolean };

// "Delete this event page?" — explains what happens, then asks the owner to
// type the page's address before the button unlocks. The page goes to the
// trash for 30 days (restorable by MyGala), see deletePage. Rendered at the
// end of the dashboard root: inside an event card (e.g. a faded past event)
// the overlay would be trapped below the cards after it.
export function DeletePageDialog({ page, onClose }: { page: DeletablePage; onClose: () => void }) {
  const d = useDashText();
  const router = useRouter();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = typed.trim().toLowerCase() === page.slug.toLowerCase();
  const name = page.heading?.trim() || d.deletePageDialog.thisEvent;

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
      setError(d.deletePageDialog.somethingWentWrongYourPage);
      setBusy(false);
    }
  }

  return createPortal(
    <div className="profile-modal-backdrop" onClick={() => !busy && onClose()}>
      <div className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="delete-page-title" onClick={(e) => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose} aria-label={d.deletePageDialog.close} disabled={busy}>×</button>
        <h2 id="delete-page-title">{fill(d.deletePageDialog.delete, { name })}</h2>

        <div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65 }}>
          <p style={{ margin: '0 0 10px' }}>{d.deletePageDialog.thisTakesYourEventPage}</p>
          <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
            <li>{d.deletePageDialog.guestsWhoOpenTheLink}</li>
            <li>{d.deletePageDialog.itsGuestListRsvpsPhotos}</li>
            {page.isPaid && <li>{d.deletePageDialog.anyPlusTimeLeftOn}</li>}
          </ul>
          <p style={{ margin: '0 0 16px', padding: '10px 12px', background: '#FFF8E7', border: '1px solid #E8D9A8', borderRadius: 8, color: '#6B5200' }}>
            {rich(d.deletePageDialog.changedYourMindWeKeep, { t0: (s) => <strong>{s}</strong> })}
          </p>
        </div>

        <form onSubmit={handleDelete}>
          <div className="profile-field">
            <label htmlFor="delete-page-confirm" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)' }}>
              {rich(fill(d.deletePageDialog.toConfirmTypeThePage, { slug: page.slug }), { t0: (s) => <strong style={{ userSelect: 'all', color: 'var(--ink)' }}>{s}</strong> })}
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
            <button type="button" className="dash-btn-secondary" onClick={onClose} disabled={busy}>{d.deletePageDialog.cancel}</button>
            <button
              type="submit"
              className="dash-btn dash-btn--danger"
              disabled={!matches || busy}
            >
              {busy ? d.deletePageDialog.deleting : d.deletePageDialog.deletePage}
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
  const d = useDashText();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={fill(d.deletePageDialog.deletePage2, { v1: page.heading || d.deletePageDialog.event })}
        className="dash-card-delete"
      >
        <TrashIcon style={{ width: 16, height: 16 }} /> {d.deletePageDialog.delete2}
      </button>
      {open && <DeletePageDialog page={page} onClose={() => setOpen(false)} />}
    </>
  );
}
