'use client';

import { useState, useRef, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { updateHeading, updateDescription, updateBannerImage, resetBannerImage, updateEventDateTime, updateHeroEyebrow, updatePageSetting, updateContactInfo, updateSectionText } from '@/app/lib/actions';
import { SECTION_TEXT_MAX_LENGTH, type SectionTextKey } from '@/app/lib/section-text';
import AddressAutocomplete, { type AddressComponents } from '@/app/ui/address-autocomplete';
import { formatDateRange } from './event-when';
import { compressImageFile, isHeicFile } from '@/app/lib/compress-image';
import { isValidOptionalPhone, PHONE_INVALID_MESSAGE, PHONE_MAX_LENGTH } from '@/app/lib/phone';
import { HERO_OBJECT_POSITIONS, heroMediaStyle, type HeroObjectPosition } from './hero-media';
import { HeroOverlay, HERO_OVERLAY_DEFAULT_COLOR, isHeroOverlayColor, isHeroOverlayOpacity } from './hero-overlay';

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
  pageId,
  value,
  className = 'hero-eyebrow',
}: {
  pageId: number;
  value: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);
  const [draft, setDraft] = useState(value);
  const [, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startEdit = () => {
    setDraft(current);
    setEditing(true);
    setTimeout(() => textareaRef.current?.select(), 0);
  };

  const save = () => {
    const v = draft.trim() || current;
    setCurrent(v);
    setEditing(false);
    startTransition(() => updateHeroEyebrow(pageId, v));
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
    <span className="theme-editable" style={{ display: 'block' }}>
      <p className={className} style={{ whiteSpace: 'pre-line' }}>{current}</p>
      <button className="theme-edit-badge" onClick={startEdit} title="Edit eyebrow text">
        <PencilIcon /> Edit
      </button>
    </span>
  );
}

// ─── EditableSectionText ──────────────────────────────────
// A section eyebrow or h2 title (rendered through <SectionText> in the
// themes). Saving an empty value, or the default itself, goes back to the
// theme's default text.
export function EditableSectionText({
  pageId,
  k,
  as: Tag,
  value,
  fallback,
  className,
  style,
  icon,
}: {
  pageId: number;
  k: SectionTextKey;
  as: 'p' | 'h2';
  value: string;
  fallback: string;
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);
  const [draft, setDraft] = useState(value || fallback);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(current || fallback);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const saveValue = (raw: string) => {
    const trimmed = raw.trim();
    const v = trimmed === fallback ? '' : trimmed;
    setCurrent(v);
    setEditing(false);
    startTransition(async () => {
      const saved = await updateSectionText(pageId, k, v);
      if (saved !== null) setCurrent(saved);
    });
  };

  const cancel = () => {
    setDraft(current || fallback);
    setEditing(false);
  };

  if (editing) {
    return (
      <span style={{ display: 'block', position: 'relative' }}>
        <input
          ref={inputRef}
          value={draft}
          maxLength={SECTION_TEXT_MAX_LENGTH}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveValue(draft);
            if (e.key === 'Escape') cancel();
          }}
          className={`${className ?? ''} theme-edit-input`}
          style={style}
          autoFocus
        />
        <span className="theme-edit-controls" style={{ justifyContent: 'center' }}>
          <button className="theme-edit-save" onClick={() => saveValue(draft)}>Save</button>
          <button className="theme-edit-cancel" onClick={cancel}>Cancel</button>
          {current && (
            <button className="theme-edit-cancel" onClick={() => saveValue('')} title={`Back to "${fallback}"`}>
              Reset to default
            </button>
          )}
        </span>
      </span>
    );
  }

  return (
    <span className="theme-editable" style={{ display: 'block' }}>
      <Tag className={className} style={style}>{icon}{current || fallback}</Tag>
      <button className="theme-edit-badge" onClick={startEdit} title="Edit text">
        <PencilIcon /> Edit
      </button>
    </span>
  );
}

// ─── EditableHeroName ─────────────────────────────────────
// Replaces: <h1 className="hero-name">{heading}</h1>
export function EditableHeroName({
  pageId,
  value,
  className = 'hero-name',
}: {
  pageId: number;
  value: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);
  const [draft, setDraft] = useState(value);
  const [, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startEdit = () => {
    setDraft(current);
    setEditing(true);
    setTimeout(() => textareaRef.current?.select(), 0);
  };

  const save = () => {
    const v = draft.trim() || current;
    setCurrent(v);
    setEditing(false);
    startTransition(() => updateHeading(pageId, v));
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
    <span className="theme-editable" style={{ display: 'block' }}>
      <h1 className={className} style={{ whiteSpace: 'pre-line' }}>{current}</h1>
      <button className="theme-edit-badge" onClick={startEdit} title="Edit name">
        <PencilIcon /> Edit
      </button>
    </span>
  );
}

// ─── EditableHeroDate ─────────────────────────────────────
// Replaces: <p className="hero-date">{formatted date}</p>
// Opens a dialog with the date / time and the venue's address. The city and
// country shown in the hero come from the picked address. The dialog is
// portaled to <body> because every theme's hero clips its overflow.
export type HeroDateAddress = {
  venueName?: string;
  streetAddress?: string;
  unitNumber?: string;
  postalCode?: string;
  placeId?: string;
  formattedAddress?: string;
};

export function EditableHeroDate({
  pageId,
  className = 'hero-date',
  displayText,
  eventDate,
  eventTime,
  eventEndDate,
  eventEndTime,
  city,
  country,
  address,
}: {
  pageId: number;
  className?: string;
  displayText: string;
  eventDate?: string;
  eventTime?: string;
  eventEndDate?: string;
  eventEndTime?: string;
  city?: string;
  country?: string;
  // Only for pages held at an address (not virtual events).
  address?: HeroDateAddress;
}) {
  const [open, setOpen] = useState(false);
  const [currentText, setCurrentText] = useState(displayText);
  const [, startTransition] = useTransition();

  const [dDate, setDDate] = useState(eventDate ?? '');
  const [dTime, setDTime] = useState(eventTime ?? '');
  const [dEndDate, setDEndDate] = useState(eventEndDate ?? '');
  const [dEndTime, setDEndTime] = useState(eventEndTime ?? '');
  const endBeforeStart = !!dEndDate && !!dDate && dEndDate < dDate;
  // Set only by picking an address (the dialog has no city/country fields).
  const [dCity, setDCity] = useState(city ?? '');
  const [dCountry, setDCountry] = useState(country ?? '');
  const [dAddress, setDAddress] = useState<Required<HeroDateAddress>>(() => ({
    venueName: address?.venueName ?? '',
    streetAddress: address?.streetAddress ?? '',
    unitNumber: address?.unitNumber ?? '',
    postalCode: address?.postalCode ?? '',
    placeId: address?.placeId ?? '',
    formattedAddress: address?.formattedAddress ?? '',
  }));

  const handlePlaceSelect = (c: AddressComponents) => {
    setDAddress((prev) => ({
      ...prev,
      streetAddress: c.streetAddress,
      postalCode: c.postalCode,
      placeId: c.placeId,
      formattedAddress: c.formattedAddress,
    }));
    if (c.city) setDCity(c.city);
    if (c.country) setDCountry(c.country);
  };

  const save = () => {
    if (endBeforeStart) return;
    setOpen(false);
    // Build a quick optimistic display string
    const parts: string[] = [];
    if (dDate) {
      parts.push(formatDateRange(dDate, dEndDate || undefined, 'en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    }
    const loc = [dCity, dCountry].filter(Boolean).join(', ');
    if (loc) parts.push(loc);
    if (parts.length) setCurrentText(parts.join(' · '));
    startTransition(() =>
      updateEventDateTime(pageId, {
        date: dDate || undefined, time: dTime || undefined, city: dCity || undefined, country: dCountry || undefined,
        endDate: dEndDate, endTime: dEndTime,
        address: address ? dAddress : undefined,
      })
    );
  };

  const cancel = () => setOpen(false);

  return (
    <span
      className="theme-editable"
      style={{ display: 'block', position: 'relative' }}
    >
      <p className={className}>{currentText}</p>

      <button className="theme-edit-badge" onClick={() => setOpen(true)} title="Edit dates and location">
        <PencilIcon /> Edit dates and location
      </button>

      {open && createPortal(
        <div className="theme-edit-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) cancel(); }}>
          <div
            className="theme-date-popover theme-date-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Edit date & location"
            onKeyDown={(e) => { if (e.key === 'Escape') cancel(); }}
          >
            <p className="theme-date-heading">Date &amp; time</p>
            <div className="theme-date-2col">
              <div>
                <label htmlFor="hd-date">Date</label>
                <input id="hd-date" type="date" value={dDate} onChange={(e) => setDDate(e.target.value)} />
              </div>
              <div>
                <label htmlFor="hd-time">Time</label>
                <input id="hd-time" type="time" value={dTime} onChange={(e) => setDTime(e.target.value)} />
              </div>
            </div>
            <div className="theme-date-2col">
              <div>
                <label htmlFor="hd-end-date">End date <span style={{ fontWeight: 400, opacity: 0.7 }}>(optional)</span></label>
                <input id="hd-end-date" type="date" value={dEndDate} min={dDate || undefined} onChange={(e) => setDEndDate(e.target.value)} />
              </div>
              <div>
                <label htmlFor="hd-end-time">End time <span style={{ fontWeight: 400, opacity: 0.7 }}>(optional)</span></label>
                <input id="hd-end-time" type="time" value={dEndTime} onChange={(e) => setDEndTime(e.target.value)} />
              </div>
            </div>
            {endBeforeStart && (
              <p style={{ color: '#B91C1C', fontSize: 12, margin: 0 }}>The end date can’t be before the start date.</p>
            )}

            {address && (
              <>
                <p className="theme-date-heading">Location</p>
                <div>
                  <label htmlFor="hd-venue">Venue name <span style={{ fontWeight: 400, opacity: 0.7 }}>(optional)</span></label>
                  <input id="hd-venue" type="text" value={dAddress.venueName} placeholder="e.g. Hycroft Manor"
                    onChange={(e) => setDAddress((prev) => ({ ...prev, venueName: e.target.value }))} />
                </div>
                <div>
                  <label>Address</label>
                  <AddressAutocomplete onPlaceSelect={handlePlaceSelect} defaultValue={dAddress.formattedAddress} />
                </div>
                <div>
                  <label htmlFor="hd-unit">Unit <span style={{ fontWeight: 400, opacity: 0.7 }}>(optional)</span></label>
                  <input id="hd-unit" type="text" value={dAddress.unitNumber} placeholder="Apt, suite…"
                    onChange={(e) => setDAddress((prev) => ({ ...prev, unitNumber: e.target.value }))} />
                </div>
              </>
            )}
            <div className="theme-edit-controls" style={{ marginTop: 4 }}>
              <button className="theme-edit-save" onClick={save} disabled={endBeforeStart}>Save</button>
              <button className="theme-edit-cancel" onClick={cancel}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </span>
  );
}

// ─── EditableDescription ──────────────────────────────────
// Replaces the story/description paragraph.
export function EditableDescription({
  pageId,
  value,
  className,
  style,
}: {
  pageId: number;
  value: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);
  const [draft, setDraft] = useState(value);
  const [, startTransition] = useTransition();

  const startEdit = () => {
    setDraft(current);
    setEditing(true);
  };

  const save = () => {
    const v = draft.trim() || current;
    setCurrent(v);
    setEditing(false);
    startTransition(() => updateDescription(pageId, v));
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
    <span className="theme-editable" style={{ display: 'block' }}>
      <p className={className} style={style}>{current}</p>
      <button className="theme-edit-badge" onClick={startEdit} title="Edit description">
        <PencilIcon /> Edit
      </button>
    </span>
  );
}

// ─── EditableBannerBg ─────────────────────────────────────
// Replaces: <img className="hero-bg" src={bannerImage} alt="" />
// Shows a camera overlay; clicking opens a file picker (image or video).
function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url);
}

export function EditableBannerBg({
  pageId,
  src,
  initialObjectFit = 'cover',
  initialObjectPosition,
  initialOverlayColor,
  initialOverlayOpacity,
  defaultSrc,
  fallback,
}: {
  pageId: number;
  src: string;
  initialObjectFit?: 'cover' | 'contain';
  // Vertical alignment the owner chose; unset = the theme's own default.
  initialObjectPosition?: HeroObjectPosition;
  // Saved banner overlay (hero_overlay_color / hero_overlay_opacity settings).
  initialOverlayColor?: string;
  initialOverlayOpacity?: string;
  // What the current theme shows when there is no banner (its default image, or
  // a custom element such as Terracotta's illustration).
  defaultSrc?: string;
  fallback?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const [current, setCurrent] = useState(src);
  // Falls back to defaultSrc too — otherwise a theme whose default hero is a
  // video (no banner uploaded yet) would render it through an <img> tag.
  const [isVideo, setIsVideo] = useState(() => isVideoUrl(src || defaultSrc || ''));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [objectFit, setObjectFit] = useState<'cover' | 'contain'>(initialObjectFit);
  const [objectPosition, setObjectPosition] = useState<HeroObjectPosition | undefined>(initialObjectPosition);
  const [overlayColor, setOverlayColor] = useState(isHeroOverlayColor(initialOverlayColor) ? initialOverlayColor : HERO_OVERLAY_DEFAULT_COLOR);
  const [overlayOpacity, setOverlayOpacity] = useState(isHeroOverlayOpacity(initialOverlayOpacity) ? Number(initialOverlayOpacity) : 0);
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlaySaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Back to the theme's own default hero (only offered while a custom banner is set).
  const [restoring, setRestoring] = useState(false);
  const restoreDefault = async () => {
    if (!window.confirm('Restore the theme’s default background? Your uploaded banner will be removed from this page.')) return;
    setRestoring(true);
    setUploadError('');
    const ok = await resetBannerImage(pageId);
    setRestoring(false);
    if (!ok) {
      setUploadError('Couldn’t restore the default background. Please try again.');
      return;
    }
    setCurrent('');
    setIsVideo(isVideoUrl(defaultSrc || ''));
  };

  const toggleObjectFit = () => {
    const next = objectFit === 'cover' ? 'contain' : 'cover';
    setObjectFit(next);
    startTransition(() => updatePageSetting(pageId, 'hero_object_fit', next));
  };

  // Clicking the chosen alignment again goes back to the theme's default.
  const chooseObjectPosition = (next: HeroObjectPosition) => {
    const value = objectPosition === next ? undefined : next;
    setObjectPosition(value);
    startTransition(() => updatePageSetting(pageId, 'hero_object_position', value ?? ''));
  };

  // The colour picker and slider fire on every move; preview instantly, save
  // once the owner pauses.
  const saveOverlaySetting = (name: 'hero_overlay_color' | 'hero_overlay_opacity', value: string) => {
    clearTimeout(overlaySaveTimers.current[name]);
    overlaySaveTimers.current[name] = setTimeout(() => {
      startTransition(() => updatePageSetting(pageId, name, value));
    }, 400);
  };
  const chooseOverlayColor = (next: string) => {
    if (!isHeroOverlayColor(next)) return;
    setOverlayColor(next);
    saveOverlaySetting('hero_overlay_color', next);
    // Picking a colour while the overlay is off would show nothing — turn it on.
    if (overlayOpacity === 0) {
      setOverlayOpacity(40);
      saveOverlaySetting('hero_overlay_opacity', '40');
    }
  };
  const chooseOverlayOpacity = (next: number) => {
    setOverlayOpacity(next);
    saveOverlaySetting('hero_overlay_opacity', String(next));
  };

  // Fills the banner on its own, whatever the theme's CSS does — some themes
  // position their banner image with inline styles that don't reach this one.
  const mediaStyle: React.CSSProperties = {
    position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block',
    ...heroMediaStyle(objectFit, objectPosition),
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileIsVideo = file.type.startsWith('video/');

    // Optimistic preview — except HEIC, which most browsers can't display;
    // that one appears once it's converted and uploaded.
    if (!isHeicFile(file)) {
      const objectUrl = URL.createObjectURL(file);
      setCurrent(objectUrl);
      setIsVideo(fileIsVideo);
    }
    setUploading(true);
    setUploadError('');

    try {
      let uploadedUrl: string;

      if (fileIsVideo) {
        // Videos upload directly from browser to Blob — bypasses the 4.5 MB
        // Vercel function body limit.
        //
        // Step 1: fetch our token route manually so we surface real server errors
        // instead of the opaque "Failed to retrieve the client token" from upload().
        const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
        const pathname = `banners/${Date.now()}.${ext}`;

        const tokenRes = await fetch('/api/upload/token', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            type: 'blob.generate-client-token',
            payload: { pathname, clientPayload: null, multipart: false },
          }),
        });
        const tokenData = await tokenRes.json() as { clientToken?: string; error?: string };
        if (!tokenRes.ok || !tokenData.clientToken) {
          throw new Error(tokenData.error ?? `Token request failed (${tokenRes.status})`);
        }

        // Step 2: upload directly to Vercel Blob with the client token.
        const { put } = await import('@vercel/blob/client');
        const blob = await put(pathname, file, {
          access: 'public',
          token: tokenData.clientToken,
          contentType: file.type,
        });
        uploadedUrl = blob.url;
      } else {
        // Images go through the server route for safety check + optimization.
        const compressed = await compressImageFile(file);
        const formData = new FormData();
        formData.append('file', compressed);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const text = await res.text();
        let data: { url?: string; error?: string };
        try { data = JSON.parse(text); } catch { data = { error: text || res.statusText }; }
        if (!data.url) throw new Error(data.error ?? 'Upload failed. Please try again.');
        uploadedUrl = data.url;
      }

      setCurrent(uploadedUrl);
      setIsVideo(isVideoUrl(uploadedUrl) || fileIsVideo);
      startTransition(() => updateBannerImage(pageId, uploadedUrl));
    } catch (err) {
      setCurrent(src);
      setIsVideo(isVideoUrl(src));
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const mediaSrc = current || defaultSrc || '';

  return (
    <span
      style={{ position: 'absolute', inset: 0, display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!mediaSrc ? (
        fallback
      ) : isVideo ? (
        <video
          className="hero-bg"
          src={mediaSrc}
          autoPlay
          muted
          loop
          playsInline
          style={mediaStyle}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="hero-bg" src={mediaSrc} alt="" style={mediaStyle} />
      )}
      <HeroOverlay overlay={{ color: overlayColor, opacity: overlayOpacity }} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif,video/mp4,video/quicktime,video/webm"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      {/* Always visible — matches every other editable field's "Edit" badge.
          Hover-only would hide the only way to replace the banner on touch
          devices, and from anyone who doesn't happen to hover over it. */}
      <div
        className="theme-banner-overlay"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 10, rowGap: 6, alignItems: 'center', justifyContent: 'flex-end', maxWidth: 'calc(100% - 28px)', borderRadius: 18, whiteSpace: 'nowrap', opacity: hovered || uploading ? 1 : 0.85 }}
      >
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
        <span role="group" aria-label="Vertical alignment" style={{ display: 'inline-flex', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.4)' }}>
          {HERO_OBJECT_POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => chooseObjectPosition(pos)}
              aria-pressed={objectPosition === pos}
              title={objectPosition === pos ? 'Aligned — click again to use the theme’s default' : `Align the photo to the ${pos}`}
              style={{ background: objectPosition === pos ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', fontSize: 12, padding: '4px 9px', fontWeight: 600, letterSpacing: 0.3 }}
            >
              {pos === 'top' ? 'Top' : pos === 'center' ? 'Center' : 'Bottom'}{objectPosition === pos ? ' ✓' : ''}
            </button>
          ))}
        </span>
        <span role="group" aria-label="Overlay" title="A colour layer between the photo and the text" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span>Overlay</span>
          <input
            type="color"
            value={overlayColor}
            onChange={(e) => chooseOverlayColor(e.target.value)}
            aria-label="Overlay colour"
            style={{ width: 26, height: 22, padding: 0, border: '1px solid rgba(255,255,255,0.5)', borderRadius: 4, background: 'none', cursor: 'pointer' }}
          />
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={overlayOpacity}
            onChange={(e) => chooseOverlayOpacity(Number(e.target.value))}
            aria-label="Overlay opacity"
            aria-valuetext={`${overlayOpacity}%`}
            style={{ width: 80, cursor: 'pointer', accentColor: '#fff' }}
          />
          <span style={{ minWidth: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{overlayOpacity}%</span>
        </span>
        {current && !uploading && (
          <button
            onClick={restoreDefault}
            disabled={restoring}
            title="Remove your banner and use the theme's default background"
            style={{ background: 'none', border: 'none', cursor: restoring ? 'wait' : 'pointer', color: 'inherit', font: 'inherit', padding: 0 }}
          >
            <span>{restoring ? 'Restoring…' : 'Restore default background'}</span>
          </button>
        )}
      </div>

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
  pageId,
  email,
  phone,
  linkStyle,
}: {
  pageId: number;
  email?: string;
  phone?: string;
  linkStyle?: React.CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [emailVal, setEmailVal] = useState(email ?? '');
  const [phoneVal, setPhoneVal] = useState(phone ?? '');
  const [error, setError] = useState('');
  const [saving, startTransition] = useTransition();

  function handleSave() {
    if (!isValidOptionalPhone(phoneVal)) {
      setError(PHONE_INVALID_MESSAGE);
      return;
    }
    setError('');
    startTransition(async () => {
      let result: { error?: string };
      try {
        result = await updateContactInfo(pageId, emailVal, phoneVal);
      } catch {
        result = { error: 'Couldn’t save. Please try again.' };
      }
      if (result.error) setError(result.error);
      else setEditing(false);
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
          type="tel" value={phoneVal} onChange={e => { setPhoneVal(e.target.value); setError(''); }}
          placeholder="Phone (optional)" style={inputStyle}
          maxLength={PHONE_MAX_LENGTH} inputMode="tel" aria-invalid={!!error}
        />
        {error && <p role="alert" style={{ margin: '0 0 6px', fontSize: 12, lineHeight: 1.4, color: '#fff', background: 'rgba(185,28,28,0.9)', padding: '5px 8px', borderRadius: 6 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.9)', color: '#333', fontSize: 12, fontWeight: 600 }}
          >Save</button>
          <button
            onClick={() => { setEmailVal(email ?? ''); setPhoneVal(phone ?? ''); setError(''); setEditing(false); }}
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
