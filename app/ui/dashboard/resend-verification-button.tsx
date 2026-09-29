'use client';

import { useState } from 'react';

export default function ResendVerificationButton() {
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
        padding: '9px 18px', borderRadius: 8, border: '1px solid #8A6800',
        background: 'transparent', color: '#8A6800', fontSize: 13, fontWeight: 600,
        cursor: state === 'idle' ? 'pointer' : 'default', whiteSpace: 'nowrap',
      }}
    >
      {state === 'sent' ? 'Email sent' : state === 'sending' ? 'Sending…' : 'Resend verification email'}
    </button>
  );
}
