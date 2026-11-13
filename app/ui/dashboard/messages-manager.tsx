'use client';

import { useState } from 'react';
import type { GuestMessage } from '@/app/lib/guest-messages';
import { useDashText } from '@/app/ui/dashboard/dash-text';

// The host's list of wall messages, newest first: hide one from the page and
// slideshow (it stays here), show it again, or delete it.
export function MessagesManager({ initialMessages }: { initialMessages: GuestMessage[] }) {
  const d = useDashText();
  const [messages, setMessages] = useState(initialMessages);

  const setHidden = async (id: number, hidden: boolean) => {
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, hidden } : x)));
    const res = await fetch('/api/guest-messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, hidden }) }).catch(() => null);
    if (!res?.ok) setMessages((m) => m.map((x) => (x.id === id ? { ...x, hidden: !hidden } : x)));
  };
  const remove = async (id: number) => {
    if (!window.confirm(d.messagesWall.deleteConfirm)) return;
    setMessages((m) => m.filter((x) => x.id !== id));
    await fetch(`/api/guest-messages?id=${id}`, { method: 'DELETE' }).catch(() => null);
  };

  if (!messages.length) return <p style={{ fontSize: 14, color: '#9A8F8C', margin: '8px 0 0' }}>{d.messagesWall.empty}</p>;
  const btn: React.CSSProperties = { padding: '5px 10px', borderRadius: 7, border: '1px solid #DDD5CE', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#241F2B' };
  return (
    <div style={{ display: 'grid', gap: 10, maxWidth: 760 }}>
      {messages.map((m) => (
        <div key={m.id} style={{ background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: '12px 14px', opacity: m.hidden ? 0.55 : 1, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 4px', fontSize: 14, lineHeight: 1.5, color: '#241F2B', whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{m.body}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#6B6470' }} suppressHydrationWarning>
              {m.name} · {new Date(m.created_at).toLocaleString(d.meta.locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              {m.hidden && <strong style={{ color: '#B6584A' }}> · {d.messagesWall.hiddenTag}</strong>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button type="button" style={btn} onClick={() => setHidden(m.id, !m.hidden)}>{m.hidden ? d.messagesWall.show : d.messagesWall.hide}</button>
            <button type="button" style={btn} onClick={() => remove(m.id)}>{d.messagesWall.delete}</button>
          </div>
        </div>
      ))}
    </div>
  );
}
