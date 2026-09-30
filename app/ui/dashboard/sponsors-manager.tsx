'use client';

import { useRef, useState } from 'react';
import type { Sponsor } from '@/app/lib/definitions';
import { addSponsor, deleteSponsor, reorderSponsors, updateSponsor } from '@/app/lib/actions';
import { SPONSOR_DESCRIPTION_MAX, SPONSOR_MAX_COUNT } from '@/app/lib/custom-sections';
import { uploadImage } from './upload-image';

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: '1px solid #EDE8E3', borderRadius: 8, fontSize: 14,
  fontFamily: 'inherit', color: '#241F2B', outline: 'none', width: '100%', boxSizing: 'border-box',
};
const btnPrimary: React.CSSProperties = {
  padding: '9px 20px', borderRadius: 8, border: 'none', background: '#B6584A', color: '#fff',
  fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
};
const btnGhost: React.CSSProperties = {
  padding: '8px 14px', borderRadius: 8, border: '1px solid #EDE8E3', background: '#fff', color: '#241F2B',
  fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
};
const iconBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 6, border: '1px solid #EDE8E3', background: '#fff', color: '#6B6470',
  cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', marginBottom: 6,
};
const cardStyle: React.CSSProperties = { background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: 18 };

type Message = { kind: 'ok' | 'error'; text: string } | null;

function MessageText({ message }: { message: Message }) {
  if (!message) return null;
  return <span role="status" style={{ fontSize: 13, color: message.kind === 'ok' ? '#3D6B46' : '#B91C1C' }}>{message.text}</span>;
}

// Image picker with a preview; the upload happens as soon as a file is chosen.
// An optional background colour sits behind the image (for transparent logos).
function ImageField({ url, bg, onChange, onBgChange, onError }: {
  url: string | null;
  bg: string | null;
  onChange: (url: string | null) => void;
  onBgChange: (bg: string | null) => void;
  onError: (text: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  // Remembers the last colour picked, so switching the background off and on keeps it.
  const [lastBg, setLastBg] = useState(bg ?? '#FFFFFF');
  const fileRef = useRef<HTMLInputElement>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 160, flexShrink: 0 }}>
      <div style={{ width: 160, height: 110, borderRadius: 8, border: '1px dashed #D9D2CB', background: (url && bg) || '#faf8f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: url && bg ? 10 : 0, boxSizing: 'border-box' }}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: 12, color: '#6B6470' }}>{uploading ? 'Uploading…' : 'No image'}</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button type="button" style={{ ...btnGhost, flex: 1, padding: '6px 8px', fontSize: 12 }} onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : url ? 'Replace' : 'Upload image'}
        </button>
        {url && !uploading && (
          <button type="button" style={{ ...btnGhost, padding: '6px 8px', fontSize: 12 }} onClick={() => { onChange(null); onBgChange(null); }}>Remove</button>
        )}
      </div>
      {url && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#241F2B' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!bg} onChange={(e) => onBgChange(e.target.checked ? lastBg : null)} />
            Background
          </label>
          <input
            type="color"
            aria-label="Background colour"
            value={bg ?? lastBg}
            disabled={!bg}
            onChange={(e) => { setLastBg(e.target.value); onBgChange(e.target.value); }}
            style={{ width: 34, height: 24, padding: 0, border: '1px solid #EDE8E3', borderRadius: 4, background: '#fff', cursor: bg ? 'pointer' : 'default', opacity: bg ? 1 : 0.4 }}
          />
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pick} />
    </div>
  );
}

function DescriptionField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ flex: 1, minWidth: 200 }}>
      <label style={labelStyle} htmlFor={id}>Short description</label>
      <textarea
        id={id}
        style={{ ...inputStyle, minHeight: 84, resize: 'vertical' }}
        value={value}
        maxLength={SPONSOR_DESCRIPTION_MAX}
        placeholder="e.g. Harbour Hotel — thank you for hosting our guests"
        onChange={(e) => onChange(e.target.value)}
      />
      <p style={{ fontSize: 11, color: '#6B6470', margin: '4px 0 0', textAlign: 'right' }}>{value.length} / {SPONSOR_DESCRIPTION_MAX}</p>
    </div>
  );
}

export function SponsorsManager({ pageId, initialSponsors }: { pageId: number; initialSponsors: Sponsor[] }) {
  const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors);
  const [listMessage, setListMessage] = useState<Message>(null);

  async function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= sponsors.length) return;
    const previous = sponsors;
    const next = [...sponsors];
    [next[index], next[target]] = [next[target], next[index]];
    setSponsors(next);
    setListMessage(null);
    const result = await reorderSponsors(pageId, next.map((s) => s.id));
    if (!result.ok) {
      setSponsors(previous);
      setListMessage({ kind: 'error', text: result.error });
    }
  }

  async function remove(sponsor: Sponsor) {
    if (!window.confirm('Remove this sponsor from your page?')) return;
    const result = await deleteSponsor(pageId, sponsor.id);
    if (!result.ok) {
      setListMessage({ kind: 'error', text: result.error });
      return;
    }
    setSponsors((prev) => prev.filter((s) => s.id !== sponsor.id));
    setListMessage({ kind: 'ok', text: 'Sponsor removed.' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 760 }}>
      {sponsors.length === 0 && (
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0 }}>No sponsors yet. Add the first one below — the section appears on your page once there is at least one.</p>
      )}
      {sponsors.map((sponsor, i) => (
        <SponsorRow
          key={sponsor.id}
          pageId={pageId}
          sponsor={sponsor}
          isFirst={i === 0}
          isLast={i === sponsors.length - 1}
          onMove={(delta) => move(i, delta)}
          onRemove={() => remove(sponsor)}
          onSaved={(updated) => setSponsors((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))}
        />
      ))}
      <MessageText message={listMessage} />

      {sponsors.length < SPONSOR_MAX_COUNT ? (
        <NewSponsorForm pageId={pageId} onAdded={(s) => { setSponsors((prev) => [...prev, s]); setListMessage(null); }} />
      ) : (
        <p style={{ fontSize: 13, color: '#6B6470', margin: 0 }}>You’ve reached the limit of {SPONSOR_MAX_COUNT} sponsors.</p>
      )}
    </div>
  );
}

function SponsorRow({
  pageId, sponsor, isFirst, isLast, onMove, onRemove, onSaved,
}: {
  pageId: number;
  sponsor: Sponsor;
  isFirst: boolean;
  isLast: boolean;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
  onSaved: (s: Sponsor) => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(sponsor.image_url);
  const [imageBg, setImageBg] = useState<string | null>(sponsor.image_bg);
  const [description, setDescription] = useState(sponsor.description ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const dirty = imageUrl !== sponsor.image_url || imageBg !== sponsor.image_bg || description.trim() !== (sponsor.description ?? '');

  async function save() {
    setSaving(true);
    setMessage(null);
    const result = await updateSponsor(pageId, sponsor.id, { imageUrl, imageBg, description });
    setSaving(false);
    if (!result.ok) {
      setMessage({ kind: 'error', text: result.error });
      return;
    }
    setDescription(result.value.description ?? '');
    setImageBg(result.value.image_bg);
    onSaved(result.value);
    setMessage({ kind: 'ok', text: 'Saved.' });
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <ImageField
          url={imageUrl}
          bg={imageBg}
          onChange={(u) => { setImageUrl(u); setMessage(null); }}
          onBgChange={(b) => { setImageBg(b); setMessage(null); }}
          onError={(text) => setMessage({ kind: 'error', text })}
        />
        <DescriptionField id={`sponsor-${sponsor.id}`} value={description} onChange={(v) => { setDescription(v); setMessage(null); }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button type="button" style={iconBtn} onClick={() => onMove(-1)} disabled={isFirst} aria-label="Move up" title="Move up">↑</button>
          <button type="button" style={iconBtn} onClick={() => onMove(1)} disabled={isLast} aria-label="Move down" title="Move down">↓</button>
          <button type="button" style={{ ...iconBtn, color: '#B91C1C' }} onClick={onRemove} aria-label="Remove sponsor" title="Remove sponsor">✕</button>
        </div>
      </div>
      {(dirty || message) && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end', marginTop: 12 }}>
          <MessageText message={message} />
          {dirty && (
            <button type="button" style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }} onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function NewSponsorForm({ pageId, onAdded }: { pageId: number; onAdded: (s: Sponsor) => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBg, setImageBg] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const canAdd = !!imageUrl || !!description.trim();

  async function add() {
    setSaving(true);
    setMessage(null);
    const result = await addSponsor(pageId, { imageUrl, imageBg, description });
    setSaving(false);
    if (!result.ok) {
      setMessage({ kind: 'error', text: result.error });
      return;
    }
    onAdded(result.value);
    setImageUrl(null);
    setImageBg(null);
    setDescription('');
    setMessage({ kind: 'ok', text: 'Sponsor added.' });
  }

  return (
    <div style={{ ...cardStyle, borderStyle: 'dashed', background: '#faf8f6' }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: '#241F2B', margin: '0 0 14px' }}>Add a sponsor</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <ImageField
          url={imageUrl}
          bg={imageBg}
          onChange={(u) => { setImageUrl(u); setMessage(null); }}
          onBgChange={(b) => { setImageBg(b); setMessage(null); }}
          onError={(text) => setMessage({ kind: 'error', text })}
        />
        <DescriptionField id="sponsor-new" value={description} onChange={(v) => { setDescription(v); setMessage(null); }} />
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end', marginTop: 12 }}>
        <MessageText message={message} />
        <button type="button" style={{ ...btnPrimary, opacity: !canAdd || saving ? 0.55 : 1 }} onClick={add} disabled={!canAdd || saving}>
          {saving ? 'Adding…' : 'Add sponsor'}
        </button>
      </div>
    </div>
  );
}
