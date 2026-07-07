'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setName(''); setEmail(''); setSubject(''); setMessage('');
      } else {
        setErrorMsg(data.error || 'Something went wrong.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  return status === 'success' ? (
    <div style={{
      padding: '32px', background: '#EAF2EC', border: '1px solid #B2D4B8',
      borderRadius: 14, textAlign: 'center',
    }}>
      <p style={{ fontSize: 24, margin: '0 0 8px' }}>✓</p>
      <p style={{ fontSize: 18, fontWeight: 600, color: '#3D6B46', margin: '0 0 8px' }}>Message sent!</p>
      <p style={{ fontSize: 14, color: '#3D6B46', margin: '0 0 20px' }}>
        Thanks for reaching out. We&apos;ll reply to <strong>{email || 'your email'}</strong> within one business day.
      </p>
      <button
        onClick={() => setStatus('idle')}
        style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #B2D4B8', background: '#fff', color: '#3D6B46', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
      >
        Send another message
      </button>
    </div>
  ) : (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Name <span style={{ color: 'var(--rose)' }}>*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Your name"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Email <span style={{ color: 'var(--rose)' }}>*</span></label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Subject</label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="What's this about?"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Message <span style={{ color: 'var(--rose)' }}>*</span></label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          placeholder="Tell us how we can help…"
          rows={6}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 140 }}
        />
      </div>

      {status === 'error' && (
        <p style={{ fontSize: 13, color: '#8B3A2A', margin: 0 }}>{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        style={{
          alignSelf: 'flex-start',
          padding: '12px 32px', borderRadius: 8, border: 'none',
          background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: status === 'sending' ? 'not-allowed' : 'pointer',
          opacity: status === 'sending' ? 0.6 : 1,
        }}
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#241F2B',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #D8D3CE',
  fontSize: 14,
  color: '#241F2B',
  fontFamily: 'system-ui, sans-serif',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};
