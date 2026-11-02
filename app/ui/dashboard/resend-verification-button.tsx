'use client';

import { useState } from 'react';

// compact: a small button for slim bars (the editor's verify line).
export default function ResendVerificationButton({ label = 'Resend verification email', compact = false }: { label?: string; compact?: boolean }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');

  async function handleClick() {
    setState('sending');
    try {
      await fetch('/api/resend-verification', { method: 'POST' });
    } finally {
      setState('sent');
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={state !== 'idle'}
      style={{
        padding: compact ? '4px 10px' : '7px 14px', borderRadius: compact ? 6 : 8, border: '1px solid #8A6800',
        background: 'transparent', color: '#8A6800', fontSize: compact ? 12 : 13, fontWeight: 600,
        cursor: state === 'idle' ? 'pointer' : 'default', whiteSpace: 'nowrap',
      }}
    >
      {state === 'sent' ? 'Email sent' : state === 'sending' ? 'Sending…' : label}
    </button>
  );
}
