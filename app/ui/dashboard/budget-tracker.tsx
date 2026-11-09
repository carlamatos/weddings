'use client';

import { useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { TrashIcon } from '@heroicons/react/20/solid';
import { deletePlan, saveBudget, startBudget } from '@/app/lib/plan-actions';
import { blankBudget, budgetTotals, depositsDue, BUDGET_LINES_MAX, type BudgetLine, type BudgetPlan } from '@/app/lib/saved-plans';
import { CURRENCIES, CURRENCY_NAMES, DEFAULT_CURRENCY, formatMoney, type Currency } from '@/app/lib/marketing/tool-money';
import { btn, card, input, primary } from './guest-ui';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
// The host's own date, so a payment due today isn't "overdue" in the evening.
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const num: React.CSSProperties = { ...input, width: 110, textAlign: 'right' };
const th: React.CSSProperties = { padding: '10px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid #EDE8E3' };
const label: React.CSSProperties = { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470' };
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #F0ECE8', verticalAlign: 'middle' };

// Budget (Planning): the budget from the free calculator, or one started
// here, as a tracker. Each category has its estimate, what's been spent and
// the next payment due; it saves as the host types. Deposits due also come
// by email (the plan reminders cron).
export function BudgetTracker({ pageId, initial, calculatorHref }: { pageId: number; initial: BudgetPlan | null; calculatorHref: string }) {
  const d = useDashText();
  const [plan, setPlan] = useState<BudgetPlan | null>(initial);
  const [status, setStatus] = useState<'saved' | 'saving' | 'error' | ''>('');

  const persist = useDebouncedCallback(async (next: BudgetPlan) => {
    setStatus('saving');
    setStatus((await saveBudget(pageId, next)) ? 'saved' : 'error');
  }, 700);

  const update = (next: BudgetPlan) => { setPlan(next); setStatus('saving'); persist(next); };
  const setLine = (id: string, patch: Partial<BudgetLine>) => plan && update({ ...plan, lines: plan.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });

  if (!plan) return <StartBudget pageId={pageId} calculatorHref={calculatorHref} onStart={setPlan} />;

  const money = (n: number) => formatMoney(n, plan.currency);
  const totals = budgetTotals(plan);
  const due = depositsDue(plan);
  const spentShare = plan.total ? Math.min(100, (totals.spent / plan.total) * 100) : 0;

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section style={{ ...card, padding: '18px 22px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={label}>{d.budgetTracker.totalBudget}</span>
            <AmountInput value={plan.total} onChange={(v) => update({ ...plan, total: v })} style={{ ...num, width: 140, fontSize: 18, fontWeight: 700 }} label={d.budgetTracker.totalBudget} />
          </label>
          <Stat label={d.budgetTracker.spentSoFar} value={money(totals.spent)} />
          <Stat label={totals.overBy ? d.budgetTracker.overBudget : d.budgetTracker.leftToSpend} value={money(totals.overBy || totals.left)} tone={totals.overBy ? 'bad' : 'good'} />
          <label style={{ display: 'grid', gap: 4, marginLeft: 'auto' }}>
            <span style={label}>{d.budgetTracker.currency}</span>
            <select value={plan.currency} onChange={(e) => update({ ...plan, currency: e.target.value as Currency })} style={{ ...input, background: '#fff' }}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c} · {CURRENCY_NAMES[c]}</option>)}
            </select>
          </label>
        </div>
        <div aria-hidden="true" style={{ height: 8, borderRadius: 999, background: '#F0ECE8', marginTop: 16, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${spentShare}%`, background: totals.overBy ? '#B6584A' : '#3D6B46', borderRadius: 999, transition: 'width .3s' }} />
        </div>
        <p style={{ fontSize: 13, color: '#6B6470', margin: '8px 0 0' }}>
          {Math.round(spentShare)}{d.budgetTracker.ofYourBudgetSpent}
          {Math.abs(totals.estimated - plan.total) >= 1 && fill(d.budgetTracker.yourEstimatesAddUpTo, { v1: money(totals.estimated), v2: totals.estimated > plan.total ? fill(d.budgetTracker.more, { amount: money(totals.estimated - plan.total) }) : fill(d.budgetTracker.less, { amount: money(plan.total - totals.estimated) }) })}
          <span role="status" style={{ marginLeft: 8, color: status === 'error' ? '#8B3A2A' : '#9A8F8C' }}>
            {status === 'saving' ? d.budgetTracker.saving : status === 'saved' ? d.budgetTracker.saved : status === 'error' ? d.budgetTracker.couldnTSaveCheckYour : ''}
          </span>
        </p>
      </section>

      {due.length > 0 && (
        <section style={{ ...card, padding: '16px 22px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 8px' }}>{d.budgetTracker.paymentsDue}</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
            {due.map((l) => {
              const late = l.due < today();
              return (
                <li key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#241F2B', flexWrap: 'wrap' }}>
                  <span style={{ minWidth: 110, fontWeight: 600, color: late ? '#A1361F' : '#241F2B' }}>{formatDue(l.due, d.meta.locale)}{late && d.budgetTracker.overdue}</span>
                  <span style={{ flex: 1 }}>{l.label}: {money(l.deposit)}</span>
                  <button type="button" style={{ ...btn, padding: '5px 10px', fontSize: 13 }} onClick={() => setLine(l.id, { paid: true, actual: l.actual + l.deposit })}>{d.budgetTracker.markAsPaid}</button>
                </li>
              );
            })}
          </ul>
          <p style={{ fontSize: 12.5, color: '#9A8F8C', margin: '10px 0 0' }}>{d.budgetTracker.weEmailYouAWeek}</p>
        </section>
      )}

      <section style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, color: '#241F2B', minWidth: 760 }}>
          <thead>
            <tr>
              <th style={{ ...th, paddingLeft: 18 }}>{d.budgetTracker.category}</th>
              <th style={{ ...th, textAlign: 'right' }}>{d.budgetTracker.estimate}</th>
              <th style={{ ...th, textAlign: 'right' }}>{d.budgetTracker.spent}</th>
              <th style={{ ...th, textAlign: 'right' }}>{d.budgetTracker.nextPayment}</th>
              <th style={th}>{d.budgetTracker.due}</th>
              <th style={th}>{d.budgetTracker.paid}</th>
              <th style={th} aria-label={d.budgetTracker.remove} />
            </tr>
          </thead>
          <tbody>
            {plan.lines.map((l) => {
              const over = l.actual > l.estimate && l.estimate > 0;
              return (
                <tr key={l.id}>
                  <td style={{ ...td, paddingLeft: 18, minWidth: 190 }}>
                    {l.id.startsWith('c-')
                      ? <input value={l.label} maxLength={60} aria-label={d.budgetTracker.categoryName} onChange={(e) => setLine(l.id, { label: e.target.value })} style={{ ...input, width: '100%' }} />
                      : <span style={{ fontWeight: 600 }}>{l.label}</span>}
                    <input value={l.note} maxLength={200} placeholder={d.budgetTracker.noteVendorContact} aria-label={fill(d.budgetTracker.noteFor, { label: l.label })} onChange={(e) => setLine(l.id, { note: e.target.value })}
                      style={{ display: 'block', width: '100%', marginTop: 4, border: 'none', background: 'transparent', fontSize: 12.5, color: '#6B6470', padding: '2px 0', fontFamily: 'inherit', outline: 'none' }} />
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}><AmountInput value={l.estimate} onChange={(v) => setLine(l.id, { estimate: v })} style={num} label={fill(d.budgetTracker.estimateFor, { label: l.label })} /></td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <AmountInput value={l.actual} onChange={(v) => setLine(l.id, { actual: v })} style={{ ...num, ...(over ? { borderColor: '#E6B8AC', color: '#A1361F' } : {}) }} label={fill(d.budgetTracker.spentOn, { label: l.label })} />
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}><AmountInput value={l.deposit} onChange={(v) => setLine(l.id, { deposit: v, paid: v ? l.paid : false })} style={num} label={fill(d.budgetTracker.nextPaymentFor, { label: l.label })} /></td>
                  <td style={td}><input type="date" value={l.due} aria-label={fill(d.budgetTracker.paymentDueDateFor, { label: l.label })} onChange={(e) => setLine(l.id, { due: e.target.value })} style={{ ...input, width: 150 }} /></td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <input type="checkbox" checked={l.paid} disabled={!l.deposit} aria-label={fill(d.budgetTracker.paymentForMade, { label: l.label })} onChange={(e) => setLine(l.id, { paid: e.target.checked })} style={{ accentColor: '#3D6B46', width: 16, height: 16 }} />
                  </td>
                  <td style={td}>
                    <button type="button" aria-label={fill(d.budgetTracker.remove2, { label: l.label })} title={d.budgetTracker.removeThisLine} onClick={() => update({ ...plan, lines: plan.lines.filter((x) => x.id !== l.id) })}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9A929F', padding: 4 }}>
                      <TrashIcon style={{ width: 16, height: 16 }} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" style={{ ...td, paddingLeft: 18, textAlign: 'left' }}>{d.budgetTracker.total}</th>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{money(totals.estimated)}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{money(totals.spent)}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{money(due.reduce((n, l) => n + l.deposit, 0))}</td>
              <td style={td} colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </section>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {plan.lines.length < BUDGET_LINES_MAX && (
          <button type="button" style={btn} onClick={() => update({ ...plan, lines: [...plan.lines, { id: `c-${Date.now().toString(36)}`, label: 'New category', estimate: 0, actual: 0, deposit: 0, due: '', paid: false, note: '' }] })}>
            {d.budgetTracker.addACategory}
          </button>
        )}
        <a href={calculatorHref} target="_blank" rel="noopener" style={{ ...btn, color: '#B6584A' }}>{d.budgetTracker.openTheBudgetCalculator}</a>
        <button type="button" style={{ ...btn, border: 'none', background: 'none', color: '#8B3A2A', marginLeft: 'auto' }}
          onClick={async () => { if (confirm('Delete this budget? Everything you’ve entered here is removed.')) { if (await deletePlan(pageId, 'budget')) setPlan(null); } }}>
          {d.budgetTracker.deleteThisBudget}
        </button>
      </div>
    </div>
  );
}

function Stat({ label: text, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  const labelStyle = label;
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <span style={labelStyle}>{text}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color: tone === 'bad' ? '#A1361F' : tone === 'good' ? '#3D6B46' : '#241F2B', lineHeight: 1.2 }}>{value}</span>
    </div>
  );
}

// A money field that lets the host clear it while typing.
function AmountInput({ value, onChange, style, label }: { value: number; onChange: (v: number) => void; style: React.CSSProperties; label: string }) {
  const [text, setText] = useState(value ? String(value) : '');
  const shown = Number(text || 0) === value ? text : value ? String(value) : '';
  return (
    <input inputMode="decimal" value={shown} placeholder="0" aria-label={label} style={style}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^\d.]/g, '');
        setText(raw);
        onChange(Number(raw) || 0);
      }} />
  );
}

function formatDue(d: string, locale: string): string {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString(locale, { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });
}

// No budget yet: start from the calculator, or from a total typed here.
function StartBudget({ pageId, calculatorHref, onStart }: { pageId: number; calculatorHref: string; onStart: (p: BudgetPlan) => void }) {
  const d = useDashText();
  const [total, setTotal] = useState('25000');
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const amount = useMemo(() => Math.round(Number(total.replace(/[^\d.]/g, '')) || 0), [total]);
  return (
    <section style={{ ...card, maxWidth: 640 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.budgetTracker.startYourBudget}</h2>
      <p style={{ fontSize: 14, color: '#6B6470', margin: '0 0 16px', lineHeight: 1.6 }}>
        {rich(d.budgetTracker.typeYourTotalAndWe, { t0: (s) => <a href={calculatorHref} target="_blank" rel="noopener" style={{ color: '#B6584A', fontWeight: 600 }}>{s}</a>, t1: (s) => <strong>{s}</strong> })}
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span style={label}>{d.budgetTracker.totalBudget}</span>
          <input inputMode="numeric" value={total} onChange={(e) => setTotal(e.target.value)} style={{ ...input, width: 150 }} />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span style={label}>{d.budgetTracker.currency}</span>
          <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} style={{ ...input, background: '#fff' }}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <button type="button" style={primary} disabled={busy}
          onClick={async () => {
            if (amount < 100) { setError('Type a total of at least 100.'); return; }
            setBusy(true);
            setError('');
            if (await startBudget(pageId, amount, currency)) onStart(blankBudget(amount, currency));
            else setError('Couldn’t start the budget. Please try again.');
            setBusy(false);
          }}>
          {busy ? d.budgetTracker.starting : d.budgetTracker.startMyBudget}
        </button>
      </div>
      {error && <p role="alert" style={{ fontSize: 13, color: '#8B3A2A', margin: '10px 0 0' }}>{error}</p>}
    </section>
  );
}
