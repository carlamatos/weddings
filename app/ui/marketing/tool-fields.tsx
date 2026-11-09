'use client';

import { useEffect, useState } from 'react';
import { appHref } from '@/app/lib/app-url';
import { planParam } from '@/app/lib/saved-plans';

// Small pieces shared by the free planning tools (budget calculator, RSVP
// deadline calculator, guest count planner).

// A number input that lets people clear it while typing; the tool keeps the
// last valid number, kept within min and max.
export function NumberField({ label, value, onChange, min, max, step = 1, prefix, suffix, hint }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; prefix?: string; suffix?: string; hint?: string;
}) {
  const [text, setText] = useState(String(value));
  // Follow outside changes (a shared link, a reset) without fighting the typing.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors the value when it changes from outside
    setText((t) => (Number(t) === value ? t : String(value)));
  }, [value]);
  return (
    <label className="ft-field">
      <span className="ft-label">{label}</span>
      <span className="ft-input-wrap">
        {prefix && <span className="ft-affix">{prefix}</span>}
        <input className="ft-input" type="number" inputMode="numeric" min={min} max={max} step={step} value={text}
          onChange={(e) => {
            setText(e.target.value);
            const n = Number(e.target.value);
            if (e.target.value !== '' && Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
          }}
          onBlur={() => setText(String(value))} />
        {suffix && <span className="ft-affix">{suffix}</span>}
      </span>
      {hint && <span className="ft-hint">{hint}</span>}
    </label>
  );
}

// Copies a link to the page that opens with the tool set up as it is now.
export function CopyLinkButton({ hash, label = 'Copy link to share' }: { hash: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    const url = `${window.location.origin}${window.location.pathname}${hash}`;
    window.history.replaceState(null, '', hash);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the address bar now holds the link.
    }
  }
  return <button type="button" className="pt-btn" onClick={copy}>{copied ? 'Link copied!' : label}</button>;
}

// "Save to my MyGala": keeps this plan on the visitor's event page. Signed
// in, it opens the save screen in the dashboard; otherwise sign-up, which
// keeps the plan until they reach the dashboard (saved-plans.ts).
export function SavePlanButton({ hash, what }: { hash: string; what: string }) {
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    const signedIn = await fetch('/api/auth/session', { cache: 'no-store' })
      .then((r) => r.json())
      .then((s: { user?: unknown } | null) => !!s?.user)
      .catch(() => false);
    const plan = planParam(hash);
    window.location.href = appHref(signedIn ? `/dashboard/save-plan?plan=${plan}` : `/register?plan=${plan}`);
  }
  return (
    <button type="button" className="pt-btn pt-btn--main ft-save" onClick={save} disabled={busy} title={`Keep this ${what} in your free MyGala account`}>
      {busy ? 'Opening…' : 'Save to my MyGala'}
    </button>
  );
}
