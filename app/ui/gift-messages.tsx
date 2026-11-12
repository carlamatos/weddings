'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GIFT_COPY, type GiftLang } from '@/app/lib/gift-exchange-copy';
import { GIFT_MESSAGE_MAX } from '@/app/lib/gift-messages-shared';

export type GiftThreadItem = { id: number; mine: boolean; body: string };

// The two anonymous conversations on a participant's private Secret Santa
// page: with the person they drew (who never learns who's asking) and with
// their own Secret Santa (whose name is never shown).
export function GiftMessages({ p, t, lang, gifteeName, withGiftee, withSanta, hasSanta }: {
  p: string;
  t: string;
  lang: GiftLang;
  gifteeName: string;
  withGiftee: GiftThreadItem[];
  withSanta: GiftThreadItem[];
  hasSanta: boolean;
}) {
  const c = GIFT_COPY[lang];
  return (
    <div style={{ textAlign: 'left', marginTop: 26, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Thread p={p} t={t} lang={lang} to="giftee" title={c.askGiftee(gifteeName)} hint={c.askGifteeHint} items={withGiftee} otherLabel={gifteeName} />
      {hasSanta && <Thread p={p} t={t} lang={lang} to="santa" title={c.msgSanta} hint={c.msgSantaHint} items={withSanta} otherLabel={c.yourSanta} />}
    </div>
  );
}

function Thread({ p, t, lang, to, title, hint, items, otherLabel }: {
  p: string; t: string; lang: GiftLang; to: 'giftee' | 'santa'; title: string; hint: string; items: GiftThreadItem[]; otherLabel: string;
}) {
  const c = GIFT_COPY[lang];
  const router = useRouter();
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setState('sending');
    try {
      const res = await fetch('/api/gift-exchange/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p, t, to, body: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || c.msgFailed);
      setText('');
      setState('sent');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : c.msgFailed);
      setState('error');
    }
  }

  return (
    <section style={{ border: '1px solid #EDE8E3', borderRadius: 14, padding: '16px 16px 14px', background: '#fff' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#241F2B' }}>{title}</h2>
      <p style={{ margin: '0 0 12px', fontSize: 13, lineHeight: 1.5, color: '#6B6470' }}>{hint}</p>
      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {items.map((m) => (
            <div key={m.id} style={{ alignSelf: m.mine ? 'flex-end' : 'flex-start', maxWidth: '85%', background: m.mine ? '#FBEDEB' : '#F7F4F1', borderRadius: 12, padding: '8px 12px' }}>
              <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: '#9A8F8C' }}>{m.mine ? c.you : otherLabel}</p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#241F2B', whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{m.body}</p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={send} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); if (state !== 'sending') setState('idle'); }}
          maxLength={GIFT_MESSAGE_MAX}
          rows={2}
          placeholder={c.msgPlaceholder}
          aria-label={title}
          style={{ flex: 1, minWidth: 0, resize: 'vertical', padding: '9px 11px', border: '1px solid #E4DDD6', borderRadius: 10, fontSize: 14, lineHeight: 1.45, fontFamily: 'inherit', color: '#241F2B' }}
        />
        <button type="submit" disabled={state === 'sending' || !text.trim()} style={{ padding: '10px 16px', border: 0, borderRadius: 10, background: '#B3262E', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: state === 'sending' || !text.trim() ? 0.6 : 1 }}>
          {state === 'sending' ? c.sending : c.send}
        </button>
      </form>
      {state === 'sent' && <p style={{ margin: '8px 0 0', fontSize: 13, color: '#2F6B4A', fontWeight: 600 }}>{c.sent}</p>}
      {state === 'error' && <p style={{ margin: '8px 0 0', fontSize: 13, color: '#B3262E' }}>{error}</p>}
    </section>
  );
}
