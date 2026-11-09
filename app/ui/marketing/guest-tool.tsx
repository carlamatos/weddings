'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { GUEST_GROUPS, TRAVEL, estimateGuests, guestHash, parseGuestHash, type Travel } from '@/app/lib/marketing/guest-count';
import { CURRENCIES, CURRENCY_NAMES, DEFAULT_CURRENCY, currencySymbol, formatMoney, isCurrency, type Currency } from '@/app/lib/marketing/tool-money';
import { CopyLinkButton, NumberField, SavePlanButton } from './tool-fields';

// The guest count planner in the guest count guide: the host enters how many
// people they'll invite from each group, and sees how many are likely to
// come, whether they fit the venue, how many tables they need and what the
// catering may cost (see app/lib/marketing/guest-count.ts). Shared with a
// link (#guests=…).

const EXAMPLE: Record<string, number> = { family: 12, extended: 30, close: 20, friends: 25, parents: 10, work: 8, plus: 15, kids: 0 };
const DEFAULT_RATES = Object.fromEntries(GUEST_GROUPS.map((g) => [g.id, g.rate]));

export default function GuestTool() {
  const [counts, setCounts] = useState<Record<string, number>>(EXAMPLE);
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [travel, setTravel] = useState<Travel>('local');
  const [capacity, setCapacity] = useState(120);
  const [table, setTable] = useState(10);
  const [cost, setCost] = useState(0);
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);

  useEffect(() => {
    const shared = parseGuestHash(window.location.hash);
    /* eslint-disable react-hooks/set-state-in-effect -- read once from the URL after hydration */
    if (shared) {
      setCounts(Object.fromEntries(GUEST_GROUPS.map((g) => [g.id, shared.counts[g.id] ?? 0])));
      setRates({ ...DEFAULT_RATES, ...shared.rates });
      setTravel(shared.travel);
      setCapacity(shared.capacity);
      setTable(Math.max(2, shared.table));
      setCost(shared.cost);
      if (isCurrency(shared.currency)) setCurrency(shared.currency);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const est = useMemo(() => estimateGuests(counts, rates, travel), [counts, rates, travel]);
  const money = (n: number) => formatMoney(n, currency);
  const rate = Math.max(est.averageRate, 1) / 100;
  // Plan for the high end of the range, so a good turnout still fits.
  const room = capacity - est.high;
  const moreInvites = Math.floor(room / rate);
  const fewerInvites = Math.ceil(-room / rate);
  const fill = capacity ? Math.min(100, (est.high / capacity) * 100) : 0;

  return (
    <div className="pt ft" id="guest-tool">
      <div className="pt-step">
        <h3 className="pt-step-title"><span>1</span> Who you’re inviting</h3>
        <p className="pt-help">Enter how many people you’ll invite from each group. The percentages are typical; change them if you know your crowd.</p>
        <div className="ft-groups">
          {GUEST_GROUPS.map((g) => (
            <div key={g.id} className="ft-group">
              <p className="ft-group-name"><strong>{g.label}</strong><small>{g.hint}</small></p>
              <NumberField label="Invited" value={counts[g.id] ?? 0} onChange={(v) => setCounts((c) => ({ ...c, [g.id]: v }))} min={0} max={2000} />
              <NumberField label="Likely to come" value={rates[g.id] ?? g.rate} onChange={(v) => setRates((r) => ({ ...r, [g.id]: v }))} min={0} max={100} step={5} suffix="%" />
            </div>
          ))}
        </div>
        <fieldset className="pt-question" style={{ marginTop: 18 }}>
          <legend>How far are guests travelling?</legend>
          <div className="pt-chips">
            {TRAVEL.map((t) => <button key={t.id} type="button" className="pt-chip" aria-pressed={travel === t.id} onClick={() => setTravel(t.id)}>{t.label}</button>)}
          </div>
        </fieldset>
      </div>

      <div className="pt-step">
        <h3 className="pt-step-title"><span>2</span> Your venue <em>Optional</em></h3>
        <div className="ft-fields">
          <NumberField label="Venue capacity" value={capacity} onChange={setCapacity} min={0} max={5000} step={10} suffix="people" />
          <label className="ft-field">
            <span className="ft-label">Seats per table</span>
            <select className="ft-input" value={table} onChange={(e) => setTable(Number(e.target.value))}>
              {[6, 8, 10, 12].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <NumberField label="Catering per guest" value={cost} onChange={setCost} min={0} max={100000} step={5} prefix={currencySymbol(currency)} />
          <label className="ft-field">
            <span className="ft-label">Currency</span>
            <select className="ft-input" value={currency} onChange={(e) => isCurrency(e.target.value) && setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c} · {CURRENCY_NAMES[c]}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="pt-step" aria-live="polite">
        <h3 className="pt-step-title"><span>3</span> How many will come</h3>
        <div className="ft-answer">
          <p className="ft-answer-date">About {est.expected} guests</p>
          <p className="ft-answer-note">
            Likely between <strong>{est.low}</strong> and <strong>{est.high}</strong> of the {est.invited} people you invite ({est.averageRate}% on average).
          </p>
        </div>
        {capacity > 0 && est.invited > 0 && (
          <div className="ft-capacity">
            <div className="ft-meter" role="img" aria-label={`A good turnout fills ${Math.round((est.high / capacity) * 100)}% of the venue`}>
              <span style={{ width: `${fill}%` }} className={room < 0 ? 'ft-over' : undefined} />
            </div>
            <p>
              {room >= 0
                ? <>Even with a good turnout you’ll fit, with <strong>{room}</strong> seats to spare. You could invite about <strong>{moreInvites}</strong> more people.</>
                : <>A good turnout would be <strong>{-room}</strong> over capacity. Invite about <strong>{fewerInvites}</strong> fewer people, or send a second round of invitations as replies come in.</>}
            </p>
          </div>
        )}
        <div className="ft-stats">
          <p><strong>{Math.ceil(est.high / table)}</strong><span>tables of {table} for a good turnout</span></p>
          {cost > 0
            ? <p><strong>{money(est.low * cost)} – {money(est.high * cost)}</strong><span>catering, for {est.low} to {est.high} guests</span></p>
            : <p><strong>{est.invited - est.expected}</strong><span>people likely to say no</span></p>}
          <p><strong>{Math.round(est.invited * 0.15)}</strong><span>may miss the RSVP deadline, so plan to follow up</span></p>
        </div>
        <p className="pt-tip">Next: set an RSVP deadline that gives you time to chase late replies with the <Link href="/rsvp-deadline-calculator">RSVP deadline calculator</Link>, and see what your guest count means for the rest of your spending with the <Link href="/wedding-budget-calculator">wedding budget calculator</Link>.</p>
        <div className="pt-actions">
          <SavePlanButton hash={guestHash(counts, rates, travel, capacity, table, cost, currency)} what="guest count plan" />
          <CopyLinkButton hash={guestHash(counts, rates, travel, capacity, table, cost, currency)} label="Copy link" />
          <button type="button" className="pt-btn" onClick={() => { setCounts(Object.fromEntries(GUEST_GROUPS.map((g) => [g.id, 0]))); setRates(DEFAULT_RATES); }}>Start from zero</button>
        </div>
      </div>
    </div>
  );
}
