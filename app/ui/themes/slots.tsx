'use client';

import { useState, useRef, useTransition } from 'react';
import { updateHeading, updateDescription, updateBannerImage, updateEventDateTime, updateHeroEyebrow, updatePageSetting, updateContactInfo } from '@/app/lib/actions';

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

// ─── EditableHeroEyebrow ──────────────────────────────────
// Replaces: <p className="hero-eyebrow">...</p>
export function EditableHeroEyebrow({
  value,
  className = 'hero-eyebrow',
}: {
  value: string;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);
  const [draft, setDraft] = useState(value);
  const [, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startEdit = () => {
    setDraft(current);
    setEditing(true);
    setHovered(false);
    setTimeout(() => textareaRef.current?.select(), 0);
  };

  const save = () => {
    const v = draft.trim() || current;
    setCurrent(v);
    setEditing(false);
    startTransition(() => updateHeroEyebrow(v));
  };

  const cancel = () => {
    setDraft(current);
    setEditing(false);
  };

  if (editing) {
    return (
      <span style={{ display: 'block', position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={draft}
          rows={3}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') cancel();
          }}
          className={`${className} theme-edit-input`}
          style={{ resize: 'vertical', width: '100%' }}
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
      <p className={className} style={{ whiteSpace: 'pre-line' }}>{current}</p>
      {hovered && (
        <button className="theme-edit-badge" onClick={startEdit} title="Edit eyebrow text">
          <PencilIcon /> Edit
        </button>
      )}
    </span>
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startEdit = () => {
    setDraft(current);
    setEditing(true);
    setHovered(false);
    setTimeout(() => textareaRef.current?.select(), 0);
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
        <textarea
          ref={textareaRef}
          value={draft}
          rows={3}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') cancel();
          }}
          className={`${className} theme-edit-input`}
          style={{ resize: 'vertical', width: '100%' }}
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
      <h1 className={className} style={{ whiteSpace: 'pre-line' }}>{current}</h1>
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
// Shows a camera overlay; clicking opens a file picker (image or video).
function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url);
}

export function EditableBannerBg({ src, initialObjectFit = 'cover' }: { src: string; initialObjectFit?: 'cover' | 'contain' }) {
  const [hovered, setHovered] = useState(false);
  const [current, setCurrent] = useState(src);
  const [isVideo, setIsVideo] = useState(() => isVideoUrl(src));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [objectFit, setObjectFit] = useState<'cover' | 'contain'>(initialObjectFit);
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleObjectFit = () => {
    const next = objectFit === 'cover' ? 'contain' : 'cover';
    setObjectFit(next);
    startTransition(() => updatePageSetting('hero_object_fit', next));
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileIsVideo = file.type.startsWith('video/');

    // Optimistic preview
    const objectUrl = URL.createObjectURL(file);
    setCurrent(objectUrl);
    setIsVideo(fileIsVideo);
    setUploading(true);
    setUploadError('');

    try {
      let uploadedUrl: string;

      if (fileIsVideo) {
        // Videos upload directly from browser to Blob — bypasses the 4.5 MB
        // Vercel function body limit. The token route handles auth + type checks.
        const { upload } = await import('@vercel/blob/client');
        const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
        const blob = await upload(`banners/${Date.now()}.${ext}`, file, {
          access: 'public',
          handleUploadUrl: '/api/upload/token',
        });
        uploadedUrl = blob.url;
      } else {
        // Images go through the server route for safety check + optimization.
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const text = await res.text();
        let data: { url?: string; error?: string };
        try { data = JSON.parse(text); } catch { data = { error: text || res.statusText }; }
        if (!data.url) throw new Error(data.error ?? 'Upload failed. Please try again.');
        uploadedUrl = data.url;
      }

      setCurrent(uploadedUrl);
      setIsVideo(isVideoUrl(uploadedUrl) || fileIsVideo);
      startTransition(() => updateBannerImage(uploadedUrl));
    } catch (err) {
      setCurrent(src);
      setIsVideo(isVideoUrl(src));
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const mediaSrc = current || '/images/themes/quiet-coastal/coastal.png';

  return (
    <span
      style={{ position: 'absolute', inset: 0, display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isVideo ? (
        <video
          className="hero-bg"
          src={mediaSrc}
          autoPlay
          muted
          loop
          playsInline
          style={{ objectFit }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="hero-bg" src={mediaSrc} alt="" style={{ objectFit }} />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4,video/quicktime,video/webm"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      {(hovered || uploading) && (
        <div className="theme-banner-overlay" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Replace photo"
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: uploading ? 'wait' : 'pointer', color: 'inherit', font: 'inherit', padding: 0 }}
          >
            <CameraIcon />
            <span>{uploading ? 'Uploading…' : 'Replace media'}</span>
          </button>
          <span style={{ opacity: 0.4, fontSize: 13 }}>|</span>
          <button
            onClick={toggleObjectFit}
            title={objectFit === 'cover' ? 'Switch to Contain' : 'Switch to Cover'}
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 6, cursor: 'pointer', color: 'inherit', font: 'inherit', fontSize: 12, padding: '4px 10px', fontWeight: 600, letterSpacing: 0.5 }}
          >
            {objectFit === 'cover' ? 'Cover ✓' : 'Contain ✓'}
          </button>
        </div>
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

// ─── EditableContactInfo ──────────────────────────────────
// Replaces the contact block (email + phone) in the footer.
export function EditableContactInfo({
  email,
  phone,
  linkStyle,
}: {
  email?: string;
  phone?: string;
  linkStyle?: React.CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [emailVal, setEmailVal] = useState(email ?? '');
  const [phoneVal, setPhoneVal] = useState(phone ?? '');
  const [, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateContactInfo(emailVal, phoneVal);
      setEditing(false);
    });
  }

  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '6px 10px', marginBottom: 6,
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6,
    background: 'rgba(255,255,255,0.12)', color: 'inherit', fontSize: 13,
    fontFamily: 'inherit', boxSizing: 'border-box',
  };

  if (editing) {
    return (
      <div style={{ minWidth: 220 }}>
        <input
          type="email" value={emailVal} onChange={e => setEmailVal(e.target.value)}
          placeholder="Contact email" style={inputStyle}
        />
        <input
          type="tel" value={phoneVal} onChange={e => setPhoneVal(e.target.value)}
          placeholder="Phone (optional)" style={inputStyle}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={handleSave}
            style={{ padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.9)', color: '#333', fontSize: 12, fontWeight: 600 }}
          >Save</button>
          <button
            onClick={() => { setEmailVal(email ?? ''); setPhoneVal(phone ?? ''); setEditing(false); }}
            style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', background: 'transparent', color: 'inherit', fontSize: 12 }}
          >Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {emailVal && <p style={{ margin: '0 0 4px' }}><a href={`mailto:${emailVal}`} style={{ textDecoration: 'none', ...linkStyle }}>{emailVal}</a></p>}
      {phoneVal && <p style={{ margin: 0 }}><a href={`tel:${phoneVal}`} style={{ textDecoration: 'none', ...linkStyle }}>{phoneVal}</a></p>}
      {!emailVal && !phoneVal && <p style={{ margin: 0, opacity: 0.5, fontStyle: 'italic' }}>Add contact info</p>}
      <button
        onClick={() => setEditing(true)}
        title="Edit contact info"
        style={{
          position: 'absolute', top: 0, right: -28,
          background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 4,
          cursor: 'pointer', padding: 4, color: 'inherit', lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    </span>
  );
}
