'use client';

import { useState } from 'react';

// The form's words, in English or Spanish (/es/contacto).
const TEXT = {
  en: {
    name: 'Name', namePh: 'Your name', email: 'Email', subject: 'Subject', subjectPh: 'What’s this about?',
    message: 'Message', messagePh: 'Tell us how we can help…', send: 'Send message', sending: 'Sending…',
    sent: 'Message sent!', thanks: 'Thanks for reaching out. We’ll reply to', within: 'within one business day.', yourEmail: 'your email',
    another: 'Send another message', failed: 'Something went wrong.', network: 'Network error. Please try again.',
  },
  es: {
    name: 'Nombre', namePh: 'Tu nombre', email: 'Correo electrónico', subject: 'Asunto', subjectPh: '¿De qué se trata?',
    message: 'Mensaje', messagePh: 'Cuéntanos cómo podemos ayudarte…', send: 'Enviar mensaje', sending: 'Enviando…',
    sent: '¡Mensaje enviado!', thanks: 'Gracias por escribirnos. Te responderemos a', within: 'en un día hábil.', yourEmail: 'tu correo',
    another: 'Enviar otro mensaje', failed: 'Algo salió mal.', network: 'Error de conexión. Inténtalo de nuevo.',
  },
} as const;

export default function ContactForm({ lang = 'en' }: { lang?: 'en' | 'es' }) {
  const t = TEXT[lang];
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
        body: JSON.stringify({ name, email, subject, message, lang }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setName(''); setEmail(''); setSubject(''); setMessage('');
      } else {
        setErrorMsg(data.error || t.failed);
        setStatus('error');
      }
    } catch {
      setErrorMsg(t.network);
      setStatus('error');
    }
  }

  return status === 'success' ? (
    <div style={{
      padding: '32px', background: '#EAF2EC', border: '1px solid #B2D4B8',
      borderRadius: 14, textAlign: 'center',
    }}>
      <p style={{ fontSize: 24, margin: '0 0 8px' }}>✓</p>
      <p style={{ fontSize: 18, fontWeight: 600, color: '#3D6B46', margin: '0 0 8px' }}>{t.sent}</p>
      <p style={{ fontSize: 14, color: '#3D6B46', margin: '0 0 20px' }}>
        {t.thanks} <strong>{email || t.yourEmail}</strong> {t.within}
      </p>
      <button
        onClick={() => setStatus('idle')}
        style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #B2D4B8', background: '#fff', color: '#3D6B46', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
      >
        {t.another}
      </button>
    </div>
  ) : (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>{t.name} <span style={{ color: 'var(--rose)' }}>*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder={t.namePh}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>{t.email} <span style={{ color: 'var(--rose)' }}>*</span></label>
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
        <label style={labelStyle}>{t.subject}</label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder={t.subjectPh}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>{t.message} <span style={{ color: 'var(--rose)' }}>*</span></label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          placeholder={t.messagePh}
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
        {status === 'sending' ? t.sending : t.send}
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
