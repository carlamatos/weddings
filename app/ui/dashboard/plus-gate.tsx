'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckIcon, LockClosedIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PLUS_FEATURES } from '@/app/lib/plus-features';
import { PLAN_PRICE_PLUS_TAX, PLAN_TERM_MONTHS } from '@/app/lib/plans';
import { startPlusCheckout } from './upgrade-button';

// Plus on a free page: hosts set every Plus feature up fully, and only the
// step that reaches guests (turning a section on, sending, connecting a
// domain) asks them to upgrade — by then the upgrade finishes their work
// instead of selling them something. usePlus().ask(section) opens that ask.

type Ask = { section: string; turnOn?: boolean };
type PlusContext = { paid: boolean; expired: boolean; pageId?: number; ask: (a: Ask) => void };

const Ctx = createContext<PlusContext>({ paid: true, expired: false, ask: () => {} });

export function usePlus() {
  return useContext(Ctx);
}

export function PlusProvider({ pageId, paid, expired, children }: { pageId?: number; paid: boolean; expired: boolean; children: React.ReactNode }) {
  const [asking, setAsking] = useState<Ask | null>(null);
  const ask = useCallback((a: Ask) => setAsking(a), []);
  const value = useMemo(() => ({ paid, expired, pageId, ask }), [paid, expired, pageId, ask]);
  return (
    <Ctx.Provider value={value}>
      {children}
      {asking && pageId !== undefined && <UpgradeDialog pageId={pageId} expired={expired} {...asking} onClose={() => setAsking(null)} />}
    </Ctx.Provider>
  );
}

function UpgradeDialog({ pageId, section, turnOn, expired, onClose }: Ask & { pageId: number; expired: boolean; onClose: () => void }) {
  const feature = PLUS_FEATURES[section];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  async function upgrade() {
    setLoading(true);
    setError('');
    const enable = turnOn ? feature?.setting : undefined;
    if (!(await startPlusCheckout(pageId, { enable }))) {
      setLoading(false);
      setError('Couldn’t open checkout. Please try again.');
    }
  }

  const name = feature?.name ?? 'This feature';
  const title = turnOn ? `Turn on ${name} for your guests` : `${name} is part of Plus`;

  return createPortal(
    <div className="dash-plus-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dash-plus-dialog" role="dialog" aria-modal="true" aria-labelledby="dash-plus-title" tabIndex={-1} ref={ref}>
        <button type="button" className="dash-plus-x" onClick={onClose} aria-label="Close"><XMarkIcon /></button>
        <span className="dash-plus-icon" aria-hidden="true"><SparklesIcon /></span>
        <h2 id="dash-plus-title">{title}</h2>
        <p className="dash-plus-lead">
          <strong>Everything you’ve set up is saved.</strong>{' '}
          {expired ? 'Extend Plus' : 'Upgrade this page to Plus'} and {feature?.goesLive ?? 'it goes live for your guests'}
          {turnOn && feature?.setting ? ' — we’ll switch it on for you right after.' : '.'}
        </p>
        <ul className="dash-plus-list">
          <li><CheckIcon />Every Plus feature for this event: invitations, reminders, potluck, up to 500 guest photos and more</li>
          <li><CheckIcon />One payment of {PLAN_PRICE_PLUS_TAX}, for {PLAN_TERM_MONTHS} months — no subscription</li>
          <li><CheckIcon />You come straight back here when you’re done</li>
        </ul>
        {error && <p className="dash-plus-error" role="alert">{error}</p>}
        <div className="dash-plus-actions">
          <button type="button" className="dash-plus-later" onClick={onClose}>Not now</button>
          <button type="button" className="dash-plus-go" onClick={upgrade} disabled={loading}>
            {loading ? 'Opening checkout…' : turnOn && feature?.setting ? `${expired ? 'Extend' : 'Upgrade'} and turn it on` : expired ? 'Extend Plus' : 'Upgrade to Plus'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// At the top of a Plus screen on a free page: it's all usable, and when it
// goes live. Nothing on a paid page.
export function PlusSetupNote({ section }: { section: string }) {
  const { paid, expired, pageId } = usePlus();
  const [loading, setLoading] = useState(false);
  if (paid) return null;
  const feature = PLUS_FEATURES[section];
  return (
    <div className="dash-plus-note">
      <span className="dash-plus-badge">Plus</span>
      <p>
        {expired ? <strong>Your Plus term has ended. </strong> : <strong>Set it all up now — everything you add is saved. </strong>}
        {feature?.setting
          ? `${feature.name} shows on your page once this event is on Plus.`
          : `${feature?.name ?? 'This'} works once this event is on Plus.`}
      </p>
      <button
        type="button"
        className="dash-plus-note-btn"
        disabled={loading}
        onClick={async () => { setLoading(true); if (!(await startPlusCheckout(pageId))) setLoading(false); }}
      >
        {loading ? 'Opening checkout…' : expired ? 'Extend Plus' : 'Upgrade to Plus'}
      </button>
    </div>
  );
}

// A small lock for a button that needs Plus on a free page.
export function PlusLock() {
  const { paid } = usePlus();
  if (paid) return null;
  return <LockClosedIcon aria-label="Needs Plus" style={{ width: 14, height: 14, marginRight: 6, verticalAlign: '-2px' }} />;
}
