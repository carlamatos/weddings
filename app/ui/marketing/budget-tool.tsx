'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BUDGET_CATEGORIES, MAX_PRIORITIES, budgetHash, parseBudgetHash, splitBudget } from '@/app/lib/marketing/wedding-budget';
import { CURRENCIES, CURRENCY_NAMES, DEFAULT_CURRENCY, currencySymbol, formatMoney, isCurrency, type Currency } from '@/app/lib/marketing/tool-money';
import { CopyLinkButton, NumberField } from './tool-fields';

// The wedding budget calculator in the budget guide: the couple enters their
// total and guest count, picks up to three must-haves and anything they're
// skipping, and sees what each part of the wedding gets (see
// app/lib/marketing/wedding-budget.ts). Shared with a link
// (#budget=total.guests.currency.priorities.skipped).

const CHOICES = BUDGET_CATEGORIES.filter((c) => c.id !== 'buffer');

export default function BudgetTool() {
  const [total, setTotal] = useState(30000);
  const [guests, setGuests] = useState(100);
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);

  // Open a shared budget.
  useEffect(() => {
    const shared = parseBudgetHash(window.location.hash);
    /* eslint-disable react-hooks/set-state-in-effect -- read once from the URL after hydration */
    if (shared) {
      setTotal(shared.total);
      setGuests(shared.guests);
      if (isCurrency(shared.currency)) setCurrency(shared.currency);
      setPriorities(shared.priorities);
      setSkipped(shared.skipped);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const lines = useMemo(() => splitBudget(total, priorities, skipped), [total, priorities, skipped]);
  const money = (n: number) => formatMoney(n, currency);
  const food = lines.find((l) => l.id === 'food')!;

  const togglePriority = (id: string) => {
    setPriorities((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < MAX_PRIORITIES ? [...p, id] : p));
    setSkipped((s) => s.filter((x) => x !== id));
  };
  const toggleSkip = (id: string) => {
    setSkipped((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    setPriorities((p) => p.filter((x) => x !== id));
  };

  return (
    <div className="pt ft" id="budget-tool">
      <div className="pt-step">
        <h3 className="pt-step-title"><span>1</span> Your budget and guests</h3>
        <div className="ft-fields">
          <NumberField label="Total budget" value={total} onChange={setTotal} min={0} max={10000000} step={1000} prefix={currencySymbol(currency)} />
          <NumberField label="Number of guests" value={guests} onChange={setGuests} min={1} max={2000} step={5} />
          <label className="ft-field">
            <span className="ft-label">Currency</span>
            <select className="ft-input" value={currency} onChange={(e) => isCurrency(e.target.value) && setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c} · {CURRENCY_NAMES[c]}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="pt-step">
        <h3 className="pt-step-title"><span>2</span> What matters most? <em>Optional</em></h3>
        <p className="pt-help">Pick up to {MAX_PRIORITIES} must-haves and they get a bigger share. Skipping something? Its share goes to everything else.</p>
        <fieldset className="pt-question">
          <legend>Must-haves</legend>
          <div className="pt-chips">
            {CHOICES.map((c) => (
              <button key={c.id} type="button" className="pt-chip" aria-pressed={priorities.includes(c.id)}
                disabled={!priorities.includes(c.id) && priorities.length >= MAX_PRIORITIES}
                onClick={() => togglePriority(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="pt-question">
          <legend>Skipping</legend>
          <div className="pt-chips">
            {CHOICES.filter((c) => ['planner', 'music', 'transport', 'favours', 'cake', 'paper'].includes(c.id)).map((c) => (
              <button key={c.id} type="button" className="pt-chip ft-chip-skip" aria-pressed={skipped.includes(c.id)} onClick={() => toggleSkip(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="pt-step">
        <h3 className="pt-step-title"><span>3</span> Your budget, split</h3>
        <div className="ft-bar" role="img" aria-label={lines.filter((l) => l.percent > 0).map((l) => `${l.label} ${Math.round(l.percent)}%`).join(', ')}>
          {lines.filter((l) => l.percent > 0).map((l) => <span key={l.id} style={{ flexGrow: l.percent, background: l.color }} title={`${l.label}: ${money(l.amount)}`} />)}
        </div>
        <div className="ft-stats">
          <p><strong>{money(total / Math.max(guests, 1))}</strong><span>per guest, all in</span></p>
          <p><strong>{money(food.amount / Math.max(guests, 1))}</strong><span>per guest for food and drink</span></p>
          <p><strong>{money((total * 5) / 100)}</strong><span>set aside for surprises</span></p>
        </div>
        <table className="ft-table">
          <thead>
            <tr><th scope="col">Category</th><th scope="col" className="ft-num">Share</th><th scope="col" className="ft-num">Amount</th></tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id} className={l.skipped ? 'ft-row-off' : undefined}>
                <th scope="row">
                  <span className="ft-dot" style={{ background: l.color }} aria-hidden="true" />
                  <span className="ft-cat">
                    <strong>{l.label}{l.priority && <em className="ft-tag">Must-have</em>}{l.skipped && <em className="ft-tag ft-tag--off">Skipped</em>}</strong>
                    <small>{l.covers}</small>
                  </span>
                </th>
                <td className="ft-num">{Math.round(l.percent)}%</td>
                <td className="ft-num">{money(l.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><th scope="row">Total</th><td className="ft-num">100%</td><td className="ft-num">{money(total)}</td></tr>
          </tfoot>
        </table>
        <p className="pt-tip">Each guest adds about <strong>{money(total / Math.max(guests, 1))}</strong> to your wedding, so the guest list is the biggest lever you have. See how many people will come with the <Link href="/guest-count-planner">guest count planner</Link>.</p>
        <div className="pt-actions">
          <CopyLinkButton hash={budgetHash(total, guests, currency, priorities, skipped)} />
          <button type="button" className="pt-btn" onClick={() => { setPriorities([]); setSkipped([]); }}>Back to typical shares</button>
        </div>
      </div>
    </div>
  );
}
