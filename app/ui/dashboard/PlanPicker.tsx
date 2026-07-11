'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PlanPicker() {
  const [loading, setLoading] = useState(false);

  async function handlePaid() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '48px 24px', maxWidth: 760, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', marginBottom: 8 }}>Choose your plan</h1>
      <p style={{ color: '#6B6470', fontSize: 15, marginBottom: 36, marginTop: 0 }}>
        Get started for free, or unlock premium features from day one.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Free plan */}
        <div style={{ border: '1px solid #EDE8E3', borderRadius: 16, padding: '28px 28px 32px', background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9A8F8C', margin: '0 0 8px' }}>Free</p>
          <p style={{ fontSize: 32, fontWeight: 700, color: '#241F2B', margin: '0 0 4px' }}>$0</p>
          <p style={{ fontSize: 13, color: '#9A8F8C', margin: '0 0 24px' }}>No credit card needed</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Beautiful wedding website',
              'Custom shareable URL',
              'All themes',
              'RSVP management',
              'Photo gallery (up to 8 photos)',
            ].map((f) => (
              <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#3F3A45' }}>
                <span style={{ color: '#5C6B61', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 'auto' }}>
            <Link
              href="/dashboard/setup"
              style={{ display: 'block', textAlign: 'center', padding: '12px 24px', borderRadius: 999, border: '1.5px solid #C5BEB8', color: '#3F3A45', fontWeight: 600, fontSize: 14, textDecoration: 'none', background: '#fff', transition: 'background 0.15s' }}
            >
              Get started free
            </Link>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#9A8F8C', margin: '12px 0 0' }}>
              You can upgrade any time from your dashboard.
            </p>
          </div>
        </div>

        {/* Paid plan */}
        <div style={{ border: '2px solid #8c9eac', borderRadius: 16, padding: '28px 28px 32px', background: '#F7F9FA', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <span style={{ position: 'absolute', top: -13, left: 28, background: '#8c9eac', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 12px', borderRadius: 999 }}>
            Most popular
          </span>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6b808f', margin: '0 0 8px' }}>Premium</p>
          <p style={{ fontSize: 32, fontWeight: 700, color: '#241F2B', margin: '0 0 4px' }}>Premium</p>
          <p style={{ fontSize: 13, color: '#9A8F8C', margin: '0 0 24px' }}>Everything you need for a perfect day</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Everything in Free',
              'Unlimited gallery photos',
              'Custom domain',
              'Guest photo uploads',
              'Song requests',
            ].map((f) => (
              <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#3F3A45' }}>
                <span style={{ color: '#8c9eac', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={handlePaid}
            disabled={loading}
            style={{ marginTop: 'auto', display: 'block', width: '100%', padding: '12px 24px', borderRadius: 999, border: 'none', background: '#8c9eac', color: '#fff', fontWeight: 600, fontSize: 14, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Redirecting…' : 'Get Premium'}
          </button>
        </div>

      </div>
    </div>
  );
}
