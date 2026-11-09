'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckIcon, LockClosedIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PLUS_FEATURES } from '@/app/lib/plus-features';
import { PLAN_PRICE_PLUS_TAX, PLAN_TERM_MONTHS } from '@/app/lib/plans';
import { startPlusCheckout } from './upgrade-button';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';
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
  const d = useDashText();
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
      setError(d.plusGate.couldnTOpenCheckoutPlease);
    }
  }

  const name = feature?.name ?? d.plusGate.thisFeature;
  const title = turnOn ? fill(d.plusGate.turnOnForYourGuests, { name }) : fill(d.plusGate.isPartOfPlus, { name });

  return createPortal(
    <div className="dash-plus-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dash-plus-dialog" role="dialog" aria-modal="true" aria-labelledby="dash-plus-title" tabIndex={-1} ref={ref}>
        <button type="button" className="dash-plus-x" onClick={onClose} aria-label={d.plusGate.close}><XMarkIcon /></button>
        <span className="dash-plus-icon" aria-hidden="true"><SparklesIcon /></span>
        <h2 id="dash-plus-title">{title}</h2>
        <p className="dash-plus-lead">
          <strong>{d.plusGate.everythingYouVeSetUp}</strong>{' '}
          {expired ? d.plusGate.extendPlus : d.plusGate.upgradeThisPageToPlus} {d.plusGate.and} {feature?.goesLive ?? d.plusGate.itGoesLiveForYour}
          {turnOn && feature?.setting ? d.plusGate.weLlSwitchItOn : '.'}
        </p>
        <ul className="dash-plus-list">
          <li><CheckIcon />{d.plusGate.everyPlusFeatureForThis}</li>
          <li><CheckIcon />{fill(d.plusGate.onePaymentOfForMonths, { PLAN_PRICE_PLUS_TAX, PLAN_TERM_MONTHS })}</li>
          <li><CheckIcon />{d.plusGate.youComeStraightBackHere}</li>
        </ul>
        {error && <p className="dash-plus-error" role="alert">{error}</p>}
        <div className="dash-plus-actions">
          <button type="button" className="dash-plus-later" onClick={onClose}>{d.plusGate.notNow}</button>
          <button type="button" className="dash-plus-go" onClick={upgrade} disabled={loading}>
            {loading ? d.plusGate.openingCheckout : turnOn && feature?.setting ? fill(d.plusGate.andTurnItOn, { v1: expired ? d.plusGate.extend : d.plusGate.upgrade }) : expired ? d.plusGate.extendPlus : d.plusGate.upgradeToPlus}
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
  const d = useDashText();
  const { paid, expired, pageId } = usePlus();
  const [loading, setLoading] = useState(false);
  if (paid) return null;
  const feature = PLUS_FEATURES[section];
  return (
    <div className="dash-plus-note">
      <span className="dash-plus-badge">Plus</span>
      <p>
        {expired ? <strong>{d.plusGate.yourPlusTermHasEnded} </strong> : <strong>{d.plusGate.setItAllUpNow} </strong>}
        {feature?.setting
          ? fill(d.plusGate.showsOnYourPageOnce, { name: feature.name })
          : fill(d.plusGate.worksOnceThisEventIs, { v1: feature?.name ?? d.plusGate.this })}
      </p>
      <button
        type="button"
        className="dash-plus-note-btn"
        disabled={loading}
        onClick={async () => { setLoading(true); if (!(await startPlusCheckout(pageId))) setLoading(false); }}
      >
        {loading ? d.plusGate.openingCheckout : expired ? d.plusGate.extendPlus : d.plusGate.upgradeToPlus}
      </button>
    </div>
  );
}

// A small lock for a button that needs Plus on a free page.
export function PlusLock() {
  const d = useDashText();
  const { paid } = usePlus();
  if (paid) return null;
  return <LockClosedIcon aria-label={d.plusGate.needsPlus} style={{ width: 14, height: 14, marginRight: 6, verticalAlign: '-2px' }} />;
}
