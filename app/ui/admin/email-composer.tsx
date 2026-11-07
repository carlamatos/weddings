'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ADMIN_EMAIL_AUDIENCES, ADMIN_EMAIL_BODY_MAX, ADMIN_EMAIL_BUTTON_LINKS, ADMIN_EMAIL_BUTTON_MAX, ADMIN_EMAIL_DEFAULT_SIGNATURE,
  ADMIN_EMAIL_MAX_RECIPIENTS, ADMIN_EMAIL_PLACEHOLDERS, ADMIN_EMAIL_SIGNATURE_MAX, ADMIN_EMAIL_SUBJECT_MAX, ADMIN_EMAIL_TEMPLATES,
  type AdminEmailAudience, type AdminEmailButtonLink,
} from '@/app/lib/admin-email-templates';
import { alertError, alertOk, buttonBase, c } from './styles';
import { formatDate } from './format';

export type ComposerPerson = {
  id: string;
  email: string;
  name: string;
  joined: string | null;
  blocked: string | null;
  sentTemplates: Record<string, string>;
  // The page each audience is about for this person (null: in it, no page).
  audiences: Partial<Record<AdminEmailAudience, { heading: string; slug: string; guests: number; eventDate: string | null } | null>>;
};

const SIGNATURE_KEY = 'mygala-admin-email-signature';

const label: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: c.soft, margin: '0 0 6px' };
const input: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '9px 11px', border: `1px solid ${c.line}`, borderRadius: 8,
  fontSize: 14, fontFamily: 'inherit', color: c.ink, background: '#fff',
};
const card: React.CSSProperties = { background: '#fff', border: `1px solid ${c.line}`, borderRadius: 12, padding: 18 };
const primary: React.CSSProperties = {
  ...buttonBase, padding: '10px 18px', fontSize: 14, fontWeight: 600, background: c.accent, borderColor: c.accent, color: '#fff',
};

export default function EmailComposer({ people }: { people: ComposerPerson[] }) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState(ADMIN_EMAIL_TEMPLATES[0].id);
  const template = ADMIN_EMAIL_TEMPLATES.find((t) => t.id === templateId)!;
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [buttonLabel, setButtonLabel] = useState(template.buttonLabel);
  const [buttonLink, setButtonLink] = useState<AdminEmailButtonLink>(template.buttonLink);
  const [signature, setSignature] = useState(ADMIN_EMAIL_DEFAULT_SIGNATURE);
  const [audience, setAudience] = useState<AdminEmailAudience>(template.audience);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string>('');
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);
  const [busy, setBusy] = useState<'test' | 'send' | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  // The signature is remembered in this browser.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIGNATURE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setSignature(saved);
    } catch { /* private window */ }
  }, []);
  const changeSignature = (v: string) => {
    setSignature(v);
    try { localStorage.setItem(SIGNATURE_KEY, v); } catch { /* private window */ }
  };

  const inAudience = useMemo(() => people.filter((p) => p.audiences[audience] !== undefined), [people, audience]);
  const sendable = (p: ComposerPerson) => !p.blocked;

  // A new template or audience picks everyone in it who can be emailed and
  // hasn't had this template yet.
  useEffect(() => {
    const ids = inAudience.filter((p) => sendable(p) && !p.sentTemplates[templateId]).map((p) => p.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(new Set(ids.slice(0, ADMIN_EMAIL_MAX_RECIPIENTS)));
    setPreviewId(ids[0] ?? '');
  }, [inAudience, templateId]);

  const chooseTemplate = (id: string) => {
    const t = ADMIN_EMAIL_TEMPLATES.find((x) => x.id === id)!;
    setTemplateId(id);
    setSubject(t.subject);
    setBody(t.body);
    setButtonLabel(t.buttonLabel);
    setButtonLink(t.buttonLink);
    setAudience(t.audience);
    setNotice(null);
  };

  const draft = { template: templateId, subject, body, buttonLabel, buttonLink, signature };
  const draftKey = JSON.stringify([draft, audience, previewId]);

  useEffect(() => {
    if (!subject.trim() || !body.trim()) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      const res = await fetch('/api/admin/email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal,
        body: JSON.stringify({ action: 'preview', draft, audience, previewUserId: previewId }),
      }).catch(() => null);
      if (res?.ok) setPreview(await res.json());
    }, 350);
    return () => { clearTimeout(timer); ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  async function post(action: 'test' | 'send') {
    setBusy(action);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, draft, audience, previewUserId: previewId, userIds: [...selected] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setNotice({ ok: false, text: data.error ?? 'Something went wrong.' }); return; }
      if (action === 'test') {
        setNotice({ ok: true, text: `Test sent to ${data.to}. Check your inbox.` });
      } else {
        const skipped = (data.skipped ?? []) as { email: string; reason: string }[];
        setNotice({
          ok: true,
          text: `Sent to ${data.sent} ${data.sent === 1 ? 'person' : 'people'}.${skipped.length ? ` Skipped ${skipped.map((s) => `${s.email} (${s.reason.toLowerCase()})`).join(', ')}.` : ''}`,
        });
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  function send() {
    const n = selected.size;
    if (!n) return;
    if (!window.confirm(`Send “${preview?.subject ?? subject}” to ${n} ${n === 1 ? 'person' : 'people'}? This can’t be undone.`)) return;
    post('send');
  }

  const toggle = (id: string) => setSelected((s) => {
    const next = new Set(s);
    if (next.has(id)) next.delete(id);
    else if (next.size < ADMIN_EMAIL_MAX_RECIPIENTS) next.add(id);
    return next;
  });

  return (
    <div className="admin-email">
      <style>{`
        .admin-email-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px; align-items: start; }
        .admin-email-templates { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; margin-bottom: 20px; }
        @media (max-width: 900px) { .admin-email-grid { grid-template-columns: 1fr; } }
      `}</style>

      <p style={label}>1. Choose a template</p>
      <div className="admin-email-templates">
        {ADMIN_EMAIL_TEMPLATES.map((t) => {
          const on = t.id === templateId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => chooseTemplate(t.id)}
              aria-pressed={on}
              style={{
                textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                background: on ? '#FBF5F3' : '#fff', border: `1px solid ${on ? c.accent : c.line}`, color: c.ink,
              }}
            >
              <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{t.name}</span>
              <span style={{ display: 'block', fontSize: 11.5, color: c.soft, lineHeight: 1.45, marginTop: 3 }}>{t.description}</span>
            </button>
          );
        })}
      </div>

      <div className="admin-email-grid">
        <div style={card}>
          <p style={{ ...label, marginBottom: 12 }}>2. Edit the email</p>
          <label style={label} htmlFor="ae-subject">Subject</label>
          <input id="ae-subject" style={{ ...input, marginBottom: 14 }} value={subject} maxLength={ADMIN_EMAIL_SUBJECT_MAX} onChange={(e) => setSubject(e.target.value)} />

          <label style={label} htmlFor="ae-body">Message</label>
          <textarea id="ae-body" style={{ ...input, minHeight: 320, lineHeight: 1.55, resize: 'vertical' }} value={body} maxLength={ADMIN_EMAIL_BODY_MAX} onChange={(e) => setBody(e.target.value)} />
          <p style={{ fontSize: 11.5, color: c.muted, margin: '6px 0 14px', lineHeight: 1.6 }}>
            Filled in for each person:{' '}
            {ADMIN_EMAIL_PLACEHOLDERS.map((p, i) => (
              <span key={p.key} title={p.hint}><code>{p.key}</code>{i < ADMIN_EMAIL_PLACEHOLDERS.length - 1 ? ', ' : ''}</span>
            ))}
            . Leave a blank line between paragraphs.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={label} htmlFor="ae-btn">Button text</label>
              <input id="ae-btn" style={input} value={buttonLabel} maxLength={ADMIN_EMAIL_BUTTON_MAX} disabled={buttonLink === 'none'} onChange={(e) => setButtonLabel(e.target.value)} />
            </div>
            <div>
              <label style={label} htmlFor="ae-link">Button goes to</label>
              <select id="ae-link" style={input} value={buttonLink} onChange={(e) => setButtonLink(e.target.value as AdminEmailButtonLink)}>
                {Object.entries(ADMIN_EMAIL_BUTTON_LINKS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <label style={label} htmlFor="ae-sig">Signature</label>
          <textarea id="ae-sig" style={{ ...input, minHeight: 58, resize: 'vertical' }} value={signature} maxLength={ADMIN_EMAIL_SIGNATURE_MAX} onChange={(e) => changeSignature(e.target.value)} />
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            <p style={{ ...label, margin: 0 }}>Preview</p>
            <select aria-label="Preview as" style={{ ...input, width: 'auto', maxWidth: '100%', padding: '5px 8px', fontSize: 12 }} value={previewId} onChange={(e) => setPreviewId(e.target.value)}>
              <option value="">As a sample person</option>
              {inAudience.map((p) => <option key={p.id} value={p.id}>As {p.name || p.email}</option>)}
            </select>
          </div>
          <p style={{ fontSize: 13, margin: '0 0 10px' }}><span style={{ color: c.muted }}>Subject:</span> <strong>{preview?.subject ?? subject}</strong></p>
          <iframe
            title="Email preview"
            sandbox=""
            srcDoc={preview?.html ?? ''}
            style={{ width: '100%', height: 640, border: `1px solid ${c.line}`, borderRadius: 8, background: '#F7F4F1' }}
          />
        </div>
      </div>

      <div style={{ ...card, marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ minWidth: 240 }}>
            <label style={label} htmlFor="ae-aud">3. Who gets it</label>
            <select id="ae-aud" style={input} value={audience} onChange={(e) => setAudience(e.target.value as AdminEmailAudience)}>
              {Object.entries(ADMIN_EMAIL_AUDIENCES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <p style={{ fontSize: 12, color: c.muted, margin: '6px 0 0' }}>{ADMIN_EMAIL_AUDIENCES[audience].hint}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
            <button type="button" style={buttonBase} onClick={() => setSelected(new Set(inAudience.filter(sendable).map((p) => p.id).slice(0, ADMIN_EMAIL_MAX_RECIPIENTS)))}>Select all</button>
            <button type="button" style={buttonBase} onClick={() => setSelected(new Set())}>Select none</button>
          </div>
        </div>

        {inAudience.length === 0 ? (
          <p style={{ fontSize: 13, color: c.soft, margin: 0 }}>Nobody fits this group right now.</p>
        ) : (
          <div style={{ border: `1px solid ${c.line}`, borderRadius: 8, maxHeight: 360, overflowY: 'auto' }}>
            {inAudience.map((p) => {
              const page = p.audiences[audience];
              const sentThis = p.sentTemplates[templateId];
              return (
                <label
                  key={p.id}
                  style={{
                    display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', borderBottom: `1px solid ${c.line}`,
                    fontSize: 13, cursor: p.blocked ? 'not-allowed' : 'pointer', opacity: p.blocked ? 0.55 : 1,
                  }}
                >
                  <input type="checkbox" checked={selected.has(p.id)} disabled={!!p.blocked} onChange={() => toggle(p.id)} style={{ marginTop: 3 }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 600 }}>{p.name || p.email}</span>
                    {p.name && <span style={{ color: c.soft }}> · {p.email}</span>}
                    <span style={{ display: 'block', color: c.muted, fontSize: 12, marginTop: 2 }}>
                      {page ? <>{page.heading || `/${page.slug}`} · {page.guests} {page.guests === 1 ? 'guest' : 'guests'}{page.eventDate ? ` · event ${formatDate(`${page.eventDate}T12:00:00Z`)}` : ''}</> : 'No page yet'}
                      {' · '}joined {formatDate(p.joined)}
                    </span>
                  </span>
                  {(p.blocked || sentThis) && (
                    <span style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', color: p.blocked ? c.amber : c.soft }}>
                      {p.blocked ?? `Got this ${formatDate(sentThis)}`}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}

        {notice && <div role="status" style={{ ...(notice.ok ? alertOk : alertError), marginTop: 14 }}>{notice.text}</div>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', marginTop: 16 }}>
          <button type="button" style={{ ...buttonBase, padding: '10px 16px', fontSize: 14 }} disabled={!!busy} onClick={() => post('test')}>
            {busy === 'test' ? 'Sending…' : 'Send me a test'}
          </button>
          <button type="button" style={{ ...primary, opacity: !selected.size || busy ? 0.6 : 1 }} disabled={!selected.size || !!busy} onClick={send}>
            {busy === 'send' ? 'Sending…' : `Send to ${selected.size} ${selected.size === 1 ? 'person' : 'people'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
