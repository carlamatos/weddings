'use client';

import { useState, useTransition } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { updatePageSetting } from '@/app/lib/actions';
import { cleanMealOptions, MEAL_NAME_MAX, MEAL_OPTIONS_MAX, MEAL_OPTIONS_SETTING, MEALS_ON_SETTING } from '@/app/lib/rsvp-meals';
import { btn, card, input, primary } from './guest-ui';

// RSVP screen: ask guests to choose a meal and note allergies. Off by
// default; when on, the RSVP form shows a meal list and an allergies box
// for each person in the party (both optional for guests).
export function RsvpMealsOption({ pageId, initialOn, initialOptions }: { pageId: number; initialOn: boolean; initialOptions: string[] }) {
  const [on, setOn] = useState(initialOn);
  const [options, setOptions] = useState(initialOptions);
  const [saved, setSaved] = useState(initialOptions);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const clean = cleanMealOptions(options);
  const changed = JSON.stringify(clean) !== JSON.stringify(saved);

  const toggle = (next: boolean) => {
    setOn(next);
    startTransition(async () => {
      await updatePageSetting(pageId, MEALS_ON_SETTING, next ? 'true' : 'false');
      // The first time it's switched on, the starting list is saved too.
      if (next) await updatePageSetting(pageId, MEAL_OPTIONS_SETTING, JSON.stringify(saved));
    });
  };

  const save = () => {
    if (!clean.length) { setMessage('Add at least one meal.'); return; }
    startTransition(async () => {
      await updatePageSetting(pageId, MEAL_OPTIONS_SETTING, JSON.stringify(clean));
      setSaved(clean);
      setOptions(clean);
      setMessage('Saved. Your RSVP form shows these meals.');
    });
  };

  return (
    <section style={{ ...card, padding: '14px 18px', marginBottom: 24 }}>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 14, color: '#241F2B', lineHeight: 1.5 }}>
        <input type="checkbox" checked={on} disabled={pending} onChange={(e) => toggle(e.target.checked)} style={{ marginTop: 3, accentColor: '#B6584A' }} />
        <span>
          <strong>Ask guests to choose a meal</strong>
          <span style={{ display: 'block', color: '#6B6470', fontSize: 13 }}>
            Each person coming picks a meal and can note allergies or dietary needs. It&rsquo;s optional for guests. You get a count
            per meal for your caterer, and Find Your Table shows the meals at each table.
          </span>
        </span>
      </label>

      {on && (
        <div style={{ margin: '14px 0 2px 26px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', margin: '0 0 8px' }}>Meals guests choose from</p>
          <div style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
            {options.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 6 }}>
                <input
                  value={m} maxLength={MEAL_NAME_MAX} aria-label={`Meal ${i + 1}`} style={{ ...input, flex: 1 }}
                  onChange={(e) => { setMessage(''); setOptions((list) => list.map((x, j) => (j === i ? e.target.value : x))); }}
                />
                <button type="button" aria-label={`Remove ${m || 'this meal'}`} disabled={options.length < 2}
                  onClick={() => { setMessage(''); setOptions((list) => list.filter((_, j) => j !== i)); }}
                  style={{ ...btn, padding: '6px 8px', opacity: options.length < 2 ? 0.4 : 1 }}>
                  <XMarkIcon style={{ width: 16, height: 16 }} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 10 }}>
            {options.length < MEAL_OPTIONS_MAX && (
              <button type="button" style={btn} onClick={() => { setMessage(''); setOptions((list) => [...list, '']); }}>+ Add a meal</button>
            )}
            <button type="button" style={{ ...primary, opacity: changed && !pending ? 1 : 0.5 }} disabled={!changed || pending} onClick={save}>
              {pending ? 'Saving…' : 'Save meals'}
            </button>
            {message && <span role="status" style={{ fontSize: 13, color: message.startsWith('Saved') ? '#3D6B46' : '#8B3A2A' }}>{message}</span>}
          </div>
          <p style={{ fontSize: 12.5, color: '#9A8F8C', margin: '10px 0 0', lineHeight: 1.5 }}>
            Write them the way guests should read them, in your page&rsquo;s language. Renaming a meal doesn&rsquo;t change what guests already chose.
          </p>
        </div>
      )}
    </section>
  );
}
