'use client';

import { useState, useRef, useTransition, useId, useLayoutEffect } from 'react';
import { updateHeading, updateDescription, updateBannerImage, resetBannerImage, resetHeroColors, updateEventDateTime, updateHeroEyebrow, updatePageSetting, updateContactInfo, updateSectionText } from '@/app/lib/actions';
import { SECTION_TEXT_MAX_LENGTH, type SectionTextKey } from '@/app/lib/section-text';
import AddressAutocomplete, { type AddressComponents } from '@/app/ui/address-autocomplete';
import { formatDateRange } from './event-when';
import { compressImageFile, isHeicFile } from '@/app/lib/compress-image';
import { isValidOptionalPhone, PHONE_INVALID_MESSAGE, PHONE_MAX_LENGTH } from '@/app/lib/phone';
import { HERO_OBJECT_POSITIONS, heroMediaStyle, type HeroObjectPosition } from './hero-media';
import { HeroOverlay, HERO_OVERLAY_DEFAULT_COLOR, isHeroOverlayColor, isHeroOverlayOpacity } from './hero-overlay';
import { heroTextStyle, type HeroTextKey } from './hero-style';
import HeroColorField from './HeroColorField';
import EditSheet, { SheetField, SheetSection, TextPreview } from './EditSheet';
import { useThemeLook, type ThemeLook } from './theme-look';

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

function saveHeroTextColor(pageId: number, key: HeroTextKey, color: string) {
  return updatePageSetting(pageId, `hero_${key}_color`, color);
}

// ─── TextSheet ────────────────────────────────────────────
// The full-screen editor shared by the text fields below: one text box and,
// for text that can be recoloured, the colour picker with a preview.
function TextSheet({
  title,
  intro,
  label,
  hint,
  draft,
  setDraft,
  multiline,
  rows = 3,
  maxLength,
  color,
  setColor,
  previewLarge,
  onSave,
  onClose,
  extra,
  selectAll = true,
  look,
}: {
  title: string;
  intro: string;
  label: string;
  hint: string;
  draft: string;
  setDraft: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  color?: string;
  setColor?: (v: string) => void;
  previewLarge?: boolean;
  onSave: () => void;
  onClose: () => void;
  extra?: React.ReactNode;
  selectAll?: boolean; // select the text on open, so typing replaces it
  look?: ThemeLook; // how the text looks with the theme's colours
}) {
  const id = useId();
  return (
    <EditSheet title={title} intro={intro} onClose={onClose} onSave={onSave}>
      <SheetField label={label} hint={hint} htmlFor={id}>
        {multiline ? (
          <textarea
            id={id}
            className="theme-sheet-input"
            value={draft}
            rows={rows}
            maxLength={maxLength}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            onFocus={selectAll ? (e) => e.currentTarget.select() : undefined}
          />
        ) : (
          <input
            id={id}
            className="theme-sheet-input"
            value={draft}
            maxLength={maxLength}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSave(); }}
            autoFocus
            onFocus={(e) => e.currentTarget.select()}
          />
        )}
        {maxLength && <p className="theme-sheet-count">{draft.length} / {maxLength}</p>}
      </SheetField>
      {setColor && (
        <>
          <HeroColorField
            id={`${id}-color`}
            label="Text colour"
            value={color ?? ''}
            onChange={setColor}
            current={look?.colorHex ?? look?.color}
            hint="Click the colour square to choose a colour for this text. Pick one that stands out from the photo or background behind it."
          />
          <TextPreview text={draft} color={color ?? ''} look={look} large={previewLarge} />
        </>
      )}
      {extra}
    </EditSheet>
  );
}

// The Edit button under an editable element. The element's bottom margin
// (the theme's space before the next thing) moves below the button, so the
// button sits right under what it edits instead of drifting toward the next
// element.
export function EditBadge({ onClick, title, label = 'Edit' }: { onClick: () => void; title: string; label?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const badge = ref.current;
    const el = badge?.previousElementSibling as HTMLElement | null;
    if (!badge || !el) return;
    const margin = parseFloat(getComputedStyle(el).marginBottom);
    if (!(margin > 0)) return;
    el.style.marginBottom = '0px';
    badge.style.marginBottom = `${margin}px`;
  }, []);
  return (
    <button ref={ref} type="button" className="theme-edit-badge" onClick={onClick} title={title}>
      <PencilIcon /> {label}
    </button>
  );
}

// ─── EditableHeroEyebrow ──────────────────────────────────
// Replaces: <p className="hero-eyebrow">...</p>
export function EditableHeroEyebrow({
  pageId,
  value,
  initialColor = '',
  className = 'hero-eyebrow',
}: {
  pageId: number;
  value: string;
  initialColor?: string; // owner's text colour; '' = the theme's
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);
  const [draft, setDraft] = useState(value);
  const [color, setColor] = useState(initialColor);
  const [draftColor, setDraftColor] = useState(initialColor);
  const [elRef, readLook] = useThemeLook<HTMLParagraphElement>();
  const [look, setLook] = useState<ThemeLook>();
  const [, startTransition] = useTransition();

  const startEdit = () => {
    setLook(readLook());
    setDraft(current);
    setDraftColor(color);
    setEditing(true);
  };

  const save = () => {
    const v = draft.trim() || current;
    setCurrent(v);
    setEditing(false);
    startTransition(() => updateHeroEyebrow(pageId, v));
    if (draftColor !== color) {
      setColor(draftColor);
      startTransition(() => saveHeroTextColor(pageId, 'eyebrow', draftColor));
    }
  };

  return (
    <span className="theme-editable" style={{ display: 'block' }}>
      <p ref={elRef} className={className} style={{ whiteSpace: 'pre-line', ...heroTextStyle(color) }} onClick={startEdit}>{current}</p>
      <EditBadge onClick={startEdit} title="Edit the line above the names" label="Edit top line" />
      {editing && (
        <TextSheet
          title="Edit the line above the names"
          look={look}
          intro="This short line sits at the top of your banner, above the names — for example “Together with their families” or “Save the date”."
          label="Text"
          hint="Press Enter for a new line."
          draft={draft}
          setDraft={setDraft}
          multiline
          color={draftColor}
          setColor={setDraftColor}
          onSave={save}
          onClose={() => setEditing(false)}
        />
      )}
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
  initialColor = '',
  fallback,
  className,
  style,
  icon,
}: {
  pageId: number;
  k: SectionTextKey;
  as: 'p' | 'h2';
  value: string;
  initialColor?: string; // owner's colour for this heading; '' = the theme's
  fallback: string;
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);
  const [draft, setDraft] = useState(value || fallback);
  const [color, setColor] = useState(initialColor);
  const [draftColor, setDraftColor] = useState(initialColor);
  const [elRef, readLook] = useThemeLook<HTMLParagraphElement & HTMLHeadingElement>();
  const [look, setLook] = useState<ThemeLook>();
  const [, startTransition] = useTransition();

  const startEdit = () => {
    setLook(readLook());
    setDraft(current || fallback);
    setDraftColor(color);
    setEditing(true);
  };

  const saveValue = (raw: string) => {
    const trimmed = raw.trim();
    const v = trimmed === fallback ? '' : trimmed;
    setCurrent(v);
    setEditing(false);
    if (draftColor !== color) {
      setColor(draftColor);
      startTransition(() => updatePageSetting(pageId, `color:${k}`, draftColor));
    }
    startTransition(async () => {
      const saved = await updateSectionText(pageId, k, v);
      if (saved !== null) setCurrent(saved);
    });
  };

  const isTitle = Tag === 'h2';

  return (
    <span className="theme-editable" style={{ display: 'block' }}>
      <Tag ref={elRef} className={className} style={color ? { ...style, ...heroTextStyle(color) } : style} onClick={startEdit}>{icon}{current || fallback}</Tag>
      <EditBadge onClick={startEdit} title="Edit this heading" label={Tag === 'h2' ? 'Edit section title' : 'Edit heading'} />
      {editing && (
        <TextSheet
          title={isTitle ? 'Edit this section’s title' : 'Edit this section’s heading'}
          look={look}
          intro={`You’re changing “${current || fallback}”. Leave it empty to go back to the theme’s wording.`}
          label={isTitle ? 'Title' : 'Heading'}
          hint="Keep it short — it’s shown as a heading on your page."
          draft={draft}
          setDraft={setDraft}
          maxLength={SECTION_TEXT_MAX_LENGTH}
          color={draftColor}
          setColor={setDraftColor}
          previewLarge={isTitle}
          onSave={() => saveValue(draft)}
          onClose={() => setEditing(false)}
          extra={current ? (
            <SheetField label="Theme wording" hint={`Brings back “${fallback}”.`}>
              <button type="button" className="theme-sheet-btn" onClick={() => saveValue('')}>Reset to default</button>
            </SheetField>
          ) : undefined}
        />
      )}
    </span>
  );
}

// ─── EditableHeroName ─────────────────────────────────────
// Replaces: <h1 className="hero-name">{heading}</h1>
export function EditableHeroName({
  pageId,
  value,
  initialColor = '',
  className = 'hero-name',
}: {
  pageId: number;
  value: string;
  initialColor?: string; // owner's text colour; '' = the theme's
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);
  const [draft, setDraft] = useState(value);
  const [color, setColor] = useState(initialColor);
  const [draftColor, setDraftColor] = useState(initialColor);
  const [elRef, readLook] = useThemeLook<HTMLHeadingElement>();
  const [look, setLook] = useState<ThemeLook>();
  const [, startTransition] = useTransition();

  const startEdit = () => {
    setLook(readLook());
    setDraft(current);
    setDraftColor(color);
    setEditing(true);
  };

  const save = () => {
    const v = draft.trim() || current;
    setCurrent(v);
    setEditing(false);
    startTransition(() => updateHeading(pageId, v));
    if (draftColor !== color) {
      setColor(draftColor);
      startTransition(() => saveHeroTextColor(pageId, 'name', draftColor));
    }
  };

  return (
    <span className="theme-editable" style={{ display: 'block' }}>
      <h1 ref={elRef} className={className} style={{ whiteSpace: 'pre-line', ...heroTextStyle(color) }} onClick={startEdit}>{current}</h1>
      <EditBadge onClick={startEdit} title="Edit the main title" label="Edit title" />
      {editing && (
        <TextSheet
          title="Edit your event’s main title"
          look={look}
          intro="This is the big title on your banner — usually the couple’s names or the name of the event."
          label="Title"
          hint="Press Enter to break it onto a new line, e.g. “Emma” on one line and “& Liam” on the next."
          draft={draft}
          setDraft={setDraft}
          multiline
          color={draftColor}
          setColor={setDraftColor}
          previewLarge
          onSave={save}
          onClose={() => setEditing(false)}
        />
      )}
    </span>
  );
}

// ─── EditableHeroDate ─────────────────────────────────────
// Replaces: <p className="hero-date">{formatted date}</p>
// Opens the editor with the date / time and the venue's address. The city
// and country shown in the hero come from the picked address.
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
  initialColor = '',
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
  initialColor?: string; // owner's text colour; '' = the theme's
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
  const [color, setColor] = useState(initialColor);
  const [dColor, setDColor] = useState(initialColor);
  const [elRef, readLook] = useThemeLook<HTMLParagraphElement>();
  const [look, setLook] = useState<ThemeLook>();
  const [, startTransition] = useTransition();

  const [dDate, setDDate] = useState(eventDate ?? '');
  const [dTime, setDTime] = useState(eventTime ?? '');
  const [dEndDate, setDEndDate] = useState(eventEndDate ?? '');
  const [dEndTime, setDEndTime] = useState(eventEndTime ?? '');
  const endBeforeStart = !!dEndDate && !!dDate && dEndDate < dDate;
  // Set only by picking an address (the editor has no city/country fields).
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

  // What the banner will show once saved.
  const previewText = (() => {
    const parts: string[] = [];
    if (dDate) parts.push(formatDateRange(dDate, dEndDate || undefined, 'en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    const loc = [dCity, dCountry].filter(Boolean).join(', ');
    if (loc) parts.push(loc);
    return parts.join(' · ');
  })();

  const save = () => {
    if (endBeforeStart) return;
    setOpen(false);
    if (previewText) setCurrentText(previewText);
    if (dColor !== color) {
      setColor(dColor);
      startTransition(() => saveHeroTextColor(pageId, 'date', dColor));
    }
    startTransition(() =>
      updateEventDateTime(pageId, {
        date: dDate || undefined, time: dTime || undefined, city: dCity || undefined, country: dCountry || undefined,
        endDate: dEndDate, endTime: dEndTime,
        address: address ? dAddress : undefined,
      })
    );
  };

  const openDialog = () => { setLook(readLook()); setDColor(color); setOpen(true); };

  return (
    <span
      className="theme-editable"
      style={{ display: 'block', position: 'relative' }}
    >
      <p ref={elRef} className={className} style={heroTextStyle(color)} onClick={openDialog}>{currentText}</p>

      <EditBadge onClick={openDialog} title="Edit the date and location" label="Edit date & location" />

      {open && (
        <EditSheet
          title="Edit the date & location"
          intro="When and where your event happens. Guests see this on your banner, in the countdown and in their invitations."
          onClose={() => setOpen(false)}
          onSave={save}
          saveDisabled={endBeforeStart}
        >
          <SheetSection title="Date & time">
            <div className="theme-sheet-2col">
              <SheetField label="Date" htmlFor="hd-date" hint="The day your event starts.">
                <input id="hd-date" className="theme-sheet-input" type="date" value={dDate} onChange={(e) => setDDate(e.target.value)} />
              </SheetField>
              <SheetField label="Start time" htmlFor="hd-time" hint="When guests should arrive.">
                <input id="hd-time" className="theme-sheet-input" type="time" value={dTime} onChange={(e) => setDTime(e.target.value)} />
              </SheetField>
            </div>
            <div className="theme-sheet-2col">
              <SheetField label="End date" optional htmlFor="hd-end-date" hint="Only for events over several days.">
                <input id="hd-end-date" className="theme-sheet-input" type="date" value={dEndDate} min={dDate || undefined} onChange={(e) => setDEndDate(e.target.value)} />
              </SheetField>
              <SheetField label="End time" optional htmlFor="hd-end-time" hint="When the event wraps up.">
                <input id="hd-end-time" className="theme-sheet-input" type="time" value={dEndTime} onChange={(e) => setDEndTime(e.target.value)} />
              </SheetField>
            </div>
            {endBeforeStart && (
              <p className="theme-sheet-error" role="alert">The end date can’t be before the start date.</p>
            )}
          </SheetSection>

          {address && (
            <SheetSection title="Location">
              <SheetField label="Venue name" optional htmlFor="hd-venue" hint="The name of the place, as guests know it.">
                <input id="hd-venue" className="theme-sheet-input" type="text" value={dAddress.venueName} placeholder="e.g. Hycroft Manor"
                  onChange={(e) => setDAddress((prev) => ({ ...prev, venueName: e.target.value }))} />
              </SheetField>
              <SheetField label="Address" hint="Start typing, then pick the address from the list — that also sets the city and country on your banner.">
                <AddressAutocomplete onPlaceSelect={handlePlaceSelect} defaultValue={dAddress.formattedAddress} />
              </SheetField>
              <SheetField label="Unit" optional htmlFor="hd-unit" hint="Apartment, suite or room number.">
                <input id="hd-unit" className="theme-sheet-input" type="text" value={dAddress.unitNumber} placeholder="Apt, suite…"
                  onChange={(e) => setDAddress((prev) => ({ ...prev, unitNumber: e.target.value }))} />
              </SheetField>
            </SheetSection>
          )}

          <SheetSection title="How it looks on your banner">
            <HeroColorField
              id="hd-color"
              label="Text colour"
              value={dColor}
              onChange={setDColor}
              current={look?.colorHex ?? look?.color}
              hint="Click the colour square to choose a colour for the date and place on your banner."
            />
            <TextPreview text={previewText || currentText} color={dColor} look={look} />
          </SheetSection>
        </EditSheet>
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

  return (
    <span className="theme-editable" style={{ display: 'block' }}>
      <p className={className} style={style} onClick={startEdit}>{current}</p>
      <EditBadge onClick={startEdit} title="Edit your story" label="Edit story" />
      {editing && (
        <TextSheet
          title="Edit your story"
          intro="A few words for your guests — how you met, what the day means to you, or what to expect."
          label="Your story"
          hint="Press Enter twice to start a new paragraph."
          draft={draft}
          setDraft={setDraft}
          multiline
          rows={12}
          selectAll={false}
          onSave={save}
          onClose={() => setEditing(false)}
        />
      )}
    </span>
  );
}

// ─── EditableBannerBg ─────────────────────────────────────
// Replaces: <img className="hero-bg" src={bannerImage} alt="" />
// Shows a camera overlay; clicking opens a file picker (images only; existing video banners still play).
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
  const [editing, setEditing] = useState(false);
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

  // Clears the custom text, heading and button colours, then reloads so every
  // editable piece shows the theme's colours again.
  const [restoringColors, setRestoringColors] = useState(false);
  const restoreThemeColors = async () => {
    if (!window.confirm('Are you sure you want to restore the default theme colors? Your custom heading, text and button colors will be removed from the whole page.')) return;
    setRestoringColors(true);
    setUploadError('');
    const ok = await resetHeroColors(pageId);
    if (!ok) {
      setRestoringColors(false);
      setUploadError('Couldn’t restore the theme colors. Please try again.');
      return;
    }
    window.location.reload();
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

    // Banner videos are switched off for now — images only. Existing video
    // banners still display (see isVideoUrl above).
    if (file.type.startsWith('video/')) {
      setUploadError('Videos aren’t supported right now. Please choose a photo.');
      e.target.value = '';
      return;
    }

    // Optimistic preview — except HEIC, which most browsers can't display;
    // that one appears once it's converted and uploaded.
    if (!isHeicFile(file)) {
      const objectUrl = URL.createObjectURL(file);
      setCurrent(objectUrl);
      setIsVideo(false);
    }
    setUploading(true);
    setUploadError('');

    try {
      // Images go through the server route for safety check + optimization.
      const compressed = await compressImageFile(file);
      const formData = new FormData();
      formData.append('file', compressed);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const text = await res.text();
      let data: { url?: string; error?: string };
      try { data = JSON.parse(text); } catch { data = { error: text || res.statusText }; }
      if (!data.url) throw new Error(data.error ?? 'Upload failed. Please try again.');
      const uploadedUrl = data.url;

      setCurrent(uploadedUrl);
      setIsVideo(false);
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
        accept="image/*,.heic,.heif"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      {/* Always visible — matches every other editable field's "Edit" badge.
          Hover-only would hide the only way to edit the banner on touch
          devices, and from anyone who doesn't happen to hover over it. */}
      <button
        type="button"
        className="theme-banner-overlay"
        onClick={() => setEditing(true)}
        title="Change the banner photo, its position and overlay"
        style={{ border: 'none', font: 'inherit', opacity: hovered || uploading ? 1 : 0.85 }}
      >
        <CameraIcon />
        <span>{uploading ? 'Uploading…' : 'Edit banner'}</span>
      </button>

      {editing && (
        <EditSheet
          title="Edit your banner"
          intro="The large photo at the top of your page. Changes here are saved as you make them."
          onClose={() => setEditing(false)}
        >
          <div className="theme-sheet-field">
            <p className="theme-sheet-label">Preview</p>
            <div className="theme-banner-preview">
              {!mediaSrc ? (
                <span className="theme-banner-preview-empty">The theme’s own design</span>
              ) : isVideo ? (
                <video src={mediaSrc} autoPlay muted loop playsInline style={mediaStyle} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaSrc} alt="Your banner" style={mediaStyle} />
              )}
              <HeroOverlay overlay={{ color: overlayColor, opacity: overlayOpacity }} />
              {uploading && <span className="theme-banner-preview-busy">Uploading…</span>}
            </div>
            <p className="theme-sheet-hint">Phones show a narrower slice of the banner, so keep the important part near the middle.</p>
          </div>

          {uploadError && <p className="theme-sheet-error" role="alert">{uploadError}</p>}

          <SheetSection title="Photo">
            <SheetField label="Upload a new one" hint="A photo (JPG, PNG, HEIC). Wide, landscape photos work best.">
              <div className="theme-sheet-row">
                <button type="button" className="theme-sheet-btn theme-sheet-btn--primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <CameraIcon /> {uploading ? 'Uploading…' : 'Choose a photo'}
                </button>
                {current && !uploading && (
                  <button type="button" className="theme-sheet-btn" onClick={restoreDefault} disabled={restoring}>
                    {restoring ? 'Restoring…' : 'Use the theme’s default instead'}
                  </button>
                )}
              </div>
            </SheetField>
          </SheetSection>

          <SheetSection title="Size & position">
            <SheetField label="Size" hint="“Fill the banner” crops the photo to cover the whole area. “Show the whole photo” fits it inside, which can leave empty edges.">
              <div className="theme-sheet-choices" role="group" aria-label="Size">
                <button type="button" aria-pressed={objectFit === 'cover'} onClick={() => objectFit !== 'cover' && toggleObjectFit()}>Fill the banner</button>
                <button type="button" aria-pressed={objectFit === 'contain'} onClick={() => objectFit !== 'contain' && toggleObjectFit()}>Show the whole photo</button>
              </div>
            </SheetField>
            <SheetField label="Which part to keep in view" hint="When the photo is cropped, choose whether its top, middle or bottom stays visible. Click your choice again to go back to the theme’s default.">
              <div className="theme-sheet-choices" role="group" aria-label="Vertical alignment">
                {HERO_OBJECT_POSITIONS.map((pos) => (
                  <button key={pos} type="button" aria-pressed={objectPosition === pos} onClick={() => chooseObjectPosition(pos)}>
                    {pos === 'top' ? 'Top' : pos === 'center' ? 'Middle' : 'Bottom'}
                  </button>
                ))}
              </div>
            </SheetField>
          </SheetSection>

          <SheetSection title="Colour overlay">
            <HeroColorField
              id="banner-overlay-color"
              label="Overlay colour"
              value={overlayColor}
              onChange={chooseOverlayColor}
              allowDefault={false}
              hint="A see-through layer of colour over the photo. A dark overlay makes white text easier to read."
            />
            <SheetField label="Overlay strength" htmlFor="banner-overlay-opacity" hint="Slide to the left for a lighter overlay, or all the way left (0%) to turn it off.">
              <div className="theme-sheet-row">
                <input
                  id="banner-overlay-opacity"
                  type="range"
                  className="theme-sheet-range"
                  min={0}
                  max={100}
                  step={5}
                  value={overlayOpacity}
                  onChange={(e) => chooseOverlayOpacity(Number(e.target.value))}
                  aria-valuetext={`${overlayOpacity}%`}
                />
                <span className="theme-sheet-range-value">{overlayOpacity}%</span>
              </div>
            </SheetField>
          </SheetSection>

          <SheetSection title="Start over">
            <SheetField label="Theme colours" hint="Removes every custom text, heading and button colour from the whole page.">
              <button type="button" className="theme-sheet-btn" onClick={restoreThemeColors} disabled={restoringColors}>
                {restoringColors ? 'Restoring…' : 'Restore default theme colours'}
              </button>
            </SheetField>
          </SheetSection>
        </EditSheet>
      )}

      {uploadError && !editing && (
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
  // What's saved, for Cancel to go back to.
  const [saved, setSaved] = useState({ email: email ?? '', phone: phone ?? '' });
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
      else { setSaved({ email: emailVal, phone: phoneVal }); setEditing(false); }
    });
  }

  const cancel = () => { setEmailVal(saved.email); setPhoneVal(saved.phone); setError(''); setEditing(false); };

  if (editing) {
    return (
      <>
        <ContactPreview email={emailVal} phone={phoneVal} linkStyle={linkStyle} />
        <EditSheet
          title="Edit your contact details"
          intro="Shown at the bottom of your page, so guests know how to reach you with questions."
          onClose={cancel}
          onSave={handleSave}
          saving={saving}
        >
          <SheetField label="Email" htmlFor="ci-email" hint="Guests can tap it to send you an email.">
            <input id="ci-email" className="theme-sheet-input" type="email" value={emailVal} onChange={e => setEmailVal(e.target.value)} placeholder="you@example.com" autoFocus />
          </SheetField>
          <SheetField label="Phone" optional htmlFor="ci-phone" hint="Include the area code. Guests on a phone can tap it to call you.">
            <input
              id="ci-phone" className="theme-sheet-input" type="tel" value={phoneVal} onChange={e => { setPhoneVal(e.target.value); setError(''); }}
              placeholder="e.g. 604 555 0123" maxLength={PHONE_MAX_LENGTH} inputMode="tel" aria-invalid={!!error}
            />
          </SheetField>
          {error && <p className="theme-sheet-error" role="alert">{error}</p>}
        </EditSheet>
      </>
    );
  }

  return (
    // In the editor, clicking the details edits them (rather than opening
    // the mail or phone app).
    <span className="theme-editable" style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => { e.preventDefault(); setEditing(true); }}>
      <ContactPreview email={emailVal} phone={phoneVal} linkStyle={linkStyle} />
      <EditBadge onClick={() => setEditing(true)} title="Edit contact info" label="Edit contact info" />
    </span>
  );
}

function ContactPreview({ email, phone, linkStyle }: { email: string; phone: string; linkStyle?: React.CSSProperties }) {
  return (
    <>
      {email && <p style={{ margin: '0 0 4px' }}><a href={`mailto:${email}`} style={{ textDecoration: 'none', ...linkStyle }}>{email}</a></p>}
      {phone && <p style={{ margin: 0 }}><a href={`tel:${phone}`} style={{ textDecoration: 'none', ...linkStyle }}>{phone}</a></p>}
      {!email && !phone && <p style={{ margin: 0, opacity: 0.5, fontStyle: 'italic' }}>Add contact info</p>}
    </>
  );
}
