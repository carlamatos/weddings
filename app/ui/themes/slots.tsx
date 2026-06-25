'use client';

import { useState, useRef, useTransition } from 'react';
import { updateHeading, updateDescription, updateBannerImage, updateEventDateTime } from '@/app/lib/actions';

// ─── shared pencil icon ──────────────────────────────────
function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

// ─── EditableHeroName ─────────────────────────────────────
// Replaces: <h1 className="hero-name">{heading}</h1>
export function EditableHeroName({
  value,
  className = 'hero-name',
}: {
  value: string;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);
  const [draft, setDraft] = useState(value);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(current);
    setEditing(true);
    setHovered(false);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const save = () => {
    const v = draft.trim() || current;
    setCurrent(v);
    setEditing(false);
    startTransition(() => updateHeading(v));
  };

  const cancel = () => {
    setDraft(current);
    setEditing(false);
  };

  if (editing) {
    return (
      <span style={{ display: 'block', position: 'relative' }}>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') cancel();
          }}
          className={`${className} theme-edit-input`}
          autoFocus
        />
        <div className="theme-edit-controls">
          <button className="theme-edit-save" onClick={save}>Save</button>
          <button className="theme-edit-cancel" onClick={cancel}>Cancel</button>
        </div>
      </span>
    );
  }

  return (
    <span
      className="theme-editable"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'block' }}
    >
      <h1 className={className}>{current}</h1>
      {hovered && (
        <button className="theme-edit-badge" onClick={startEdit} title="Edit name">
          <PencilIcon /> Edit
        </button>
      )}
    </span>
  );
}

// ─── EditableHeroDate ─────────────────────────────────────
// Replaces: <p className="hero-date">{formatted date}</p>
// Shows a popover with date / time / city / country inputs.
export function EditableHeroDate({
  className = 'hero-date',
  displayText,
  eventDate,
  eventTime,
  city,
  country,
}: {
  className?: string;
  displayText: string;
  eventDate?: string;
  eventTime?: string;
  city?: string;
  country?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentText, setCurrentText] = useState(displayText);
  const [, startTransition] = useTransition();

  const [dDate, setDDate] = useState(eventDate ?? '');
  const [dTime, setDTime] = useState(eventTime ?? '');
  const [dCity, setDCity] = useState(city ?? '');
  const [dCountry, setDCountry] = useState(country ?? '');

  const save = () => {
    setOpen(false);
    // Build a quick optimistic display string
    const parts: string[] = [];
    if (dDate) {
      parts.push(new Date(dDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    }
    const loc = [dCity, dCountry].filter(Boolean).join(', ');
    if (loc) parts.push(loc);
    if (parts.length) setCurrentText(parts.join(' · '));
    startTransition(() =>
      updateEventDateTime({ date: dDate || undefined, time: dTime || undefined, city: dCity || undefined, country: dCountry || undefined })
    );
  };

  const cancel = () => setOpen(false);

  return (
    <span
      className="theme-editable"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => !open && setHovered(false)}
      style={{ display: 'block', position: 'relative' }}
    >
      <p className={className}>{currentText}</p>

      {!open && hovered && (
        <button className="theme-edit-badge" onClick={() => setOpen(true)} title="Edit date & location">
          <PencilIcon /> Edit
        </button>
      )}

      {open && (
        <div className="theme-date-popover">
          <div>
            <label>Date</label>
            <input type="date" value={dDate} onChange={(e) => setDDate(e.target.value)} />
          </div>
          <div>
            <label>Time</label>
            <input type="time" value={dTime} onChange={(e) => setDTime(e.target.value)} />
          </div>
          <div className="theme-date-2col">
            <div>
              <label>City</label>
              <input type="text" value={dCity} onChange={(e) => setDCity(e.target.value)} placeholder="e.g. Tofino" />
            </div>
            <div>
              <label>Country / Province</label>
              <input type="text" value={dCountry} onChange={(e) => setDCountry(e.target.value)} placeholder="e.g. BC" />
            </div>
          </div>
          <div className="theme-edit-controls" style={{ marginTop: 4 }}>
            <button className="theme-edit-save" onClick={save}>Save</button>
            <button className="theme-edit-cancel" onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}
    </span>
  );
}

// ─── EditableDescription ──────────────────────────────────
// Replaces the story/description paragraph.
export function EditableDescription({
  value,
  className,
  style,
}: {
  value: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);
  const [draft, setDraft] = useState(value);
  const [, startTransition] = useTransition();

  const startEdit = () => {
    setDraft(current);
    setEditing(true);
    setHovered(false);
  };

  const save = () => {
    const v = draft.trim() || current;
    setCurrent(v);
    setEditing(false);
    startTransition(() => updateDescription(v));
  };

  const cancel = () => {
    setDraft(current);
    setEditing(false);
  };

  if (editing) {
    return (
      <span style={{ display: 'block', position: 'relative' }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') cancel();
          }}
          rows={4}
          className={`${className ?? ''} theme-edit-input`}
          style={style}
          autoFocus
        />
        <div className="theme-edit-controls">
          <button className="theme-edit-save" onClick={save}>Save</button>
          <button className="theme-edit-cancel" onClick={cancel}>Cancel</button>
        </div>
      </span>
    );
  }

  return (
    <span
      className="theme-editable"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'block' }}
    >
      <p className={className} style={style}>{current}</p>
      {hovered && (
        <button className="theme-edit-badge" onClick={startEdit} title="Edit description">
          <PencilIcon /> Edit
        </button>
      )}
    </span>
  );
}

// ─── EditableBannerBg ─────────────────────────────────────
// Replaces: <img className="hero-bg" src={bannerImage} alt="" />
// Shows a camera overlay; clicking opens a file picker.
export function EditableBannerBg({ src }: { src: string }) {
  const [hovered, setHovered] = useState(false);
  const [current, setCurrent] = useState(src);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optimistic preview
    const objectUrl = URL.createObjectURL(file);
    setCurrent(objectUrl);
    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const text = await res.text();
      let data: { url?: string; error?: string };
      try { data = JSON.parse(text); } catch { data = { error: text || res.statusText }; }
      if (data.url) {
        setCurrent(data.url);
        startTransition(() => updateBannerImage(data.url!));
      } else {
        setCurrent(src); // revert preview
        setUploadError(data.error ?? 'Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected if needed
      e.target.value = '';
    }
  };

  return (
    <span
      style={{ position: 'absolute', inset: 0, display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero-bg" src={current || '/images/themes/quiet-coastal/coastal.png'} alt="" />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      {(hovered || uploading) && (
        <button
          className="theme-banner-overlay"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Replace photo"
          style={{ border: 'none', cursor: uploading ? 'wait' : 'pointer' }}
        >
          <CameraIcon />
          <span>{uploading ? 'Uploading…' : 'Replace photo'}</span>
        </button>
      )}

      {uploadError && (
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          background: '#fff', color: '#B6584A', borderRadius: 10, padding: '10px 18px',
          fontSize: 13, fontWeight: 500, fontFamily: 'system-ui, sans-serif',
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)', zIndex: 20,
          whiteSpace: 'nowrap', maxWidth: '90vw', textAlign: 'center',
        }}>
          {uploadError}
          <button
            onClick={() => setUploadError('')}
            style={{ marginLeft: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#B6584A', fontWeight: 700, fontSize: 14 }}
          >×</button>
        </div>
      )}
    </span>
  );
}
