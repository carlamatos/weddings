'use client';

import { useState } from 'react';

export default function ConstructionPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/construction-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = '/';
      } else {
        setError('Incorrect password.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#FAF9F7', fontFamily: 'system-ui, sans-serif', padding: '24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <p style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#9A8F8C', margin: '0 0 20px' }}>
          Coming Soon
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 700, color: '#241F2B', margin: '0 0 16px', lineHeight: 1.1 }}>
          MyGala
        </h1>
        <p style={{ fontSize: 16, color: '#6B6470', margin: '0 0 48px', lineHeight: 1.7 }}>
          Beautiful event pages for your most important moments. We&apos;re putting the finishing touches on something special.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <input
            type="password"
            placeholder="Enter password to preview"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10,
              border: '1px solid #D8D3CE', fontSize: 14, color: '#241F2B',
              outline: 'none', fontFamily: 'system-ui', background: '#fff',
              boxSizing: 'border-box',
            }}
          />
          {error && <p style={{ color: '#8B3A2A', fontSize: 13, margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: '#241F2B', color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              opacity: loading || !password ? 0.5 : 1,
            }}
          >
            {loading ? 'Verifying…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
