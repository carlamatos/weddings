'use client';

import { useState, useRef, useTransition, useEffect, useCallback } from 'react';
import type { GalleryImage } from '@/app/lib/definitions';
import { addGalleryImage, deleteGalleryImage } from '@/app/lib/actions';

// ─── Static grid with lightbox (used in live theme pages) ────
export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(() => setActiveIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)), [images.length]);
  const next = useCallback(() => setActiveIndex((i) => (i === null ? null : (i + 1) % images.length)), [images.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, close, prev, next]);

  if (!images.length) return null;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActiveIndex(i)}
            style={{ padding: 0, border: 'none', background: 'none', cursor: 'zoom-in', display: 'block', aspectRatio: '1', overflow: 'hidden' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.image_path}
              alt={img.image_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Close */}
          <button onClick={close} style={navBtnStyle({ top: 20, right: 20 })} title="Close">
            <CloseIcon />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); prev(); }} style={navBtnStyle({ left: 16, top: '50%', transform: 'translateY(-50%)' })} title="Previous">
              <ChevronIcon dir="left" />
            </button>
          )}

          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeIndex].image_path}
            alt={images[activeIndex].image_name}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 4, boxShadow: '0 8px 40px rgba(0,0,0,0.6)', userSelect: 'none' }}
          />

          {/* Next */}
          {images.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); next(); }} style={navBtnStyle({ right: 16, top: '50%', transform: 'translateY(-50%)' })} title="Next">
              <ChevronIcon dir="right" />
            </button>
          )}

          {/* Counter */}
          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'system-ui', letterSpacing: 1 }}>
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

function navBtnStyle(extra: React.CSSProperties): React.CSSProperties {
  return {
    position: 'fixed',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '50%',
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    backdropFilter: 'blur(4px)',
    transition: 'background 0.2s',
    ...extra,
  };
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {dir === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}

// ─── Editable gallery (passed as editSlots.gallery) ───────
export function EditableGallery({ initialImages, isPaid }: { initialImages: GalleryImage[]; isPaid?: boolean }) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = isPaid ? 100 : 8;

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const slots = MAX_IMAGES - images.length;
    if (slots <= 0) {
      setError(`Gallery limit reached (${MAX_IMAGES} photos maximum).`);
      e.target.value = '';
      return;
    }
    const allowed = files.slice(0, slots);
    if (allowed.length < files.length) {
      setError(`Only ${slots} slot${slots === 1 ? '' : 's'} remaining — uploading the first ${slots}.`);
    }

    setUploading(true);

    for (const file of allowed) {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const objectUrl = URL.createObjectURL(file);
      const tempImage: GalleryImage = {
        id: tempId,
        user_page_id: 0,
        image_path: objectUrl,
        image_name: file.name,
        image_type: file.type,
        created_at: new Date().toISOString(),
      };
      setImages((prev) => [...prev, tempImage]);

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/gallery/upload', { method: 'POST', body: formData });
        const text = await res.text();
        let data: { url?: string; error?: string };
        try { data = JSON.parse(text); } catch { data = { error: text || res.statusText }; }

        if (data.url) {
          setImages((prev) =>
            prev.map((img) =>
              img.id === tempId ? { ...img, id: `saved-${Date.now()}`, image_path: data.url! } : img
            )
          );
          startTransition(() =>
            addGalleryImage({ imagePath: data.url!, imageName: file.name, imageType: 'image/webp' })
          );
        } else {
          setImages((prev) => prev.filter((img) => img.id !== tempId));
          setError(data.error ?? 'Upload failed. Please try again.');
        }
      } catch {
        setImages((prev) => prev.filter((img) => img.id !== tempId));
        setError('Upload failed. Please try again.');
      }
    }

    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
    startTransition(() => deleteGalleryImage(imageId));
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
        {images.map((img) => (
          <GalleryThumb key={img.id} image={img} onDelete={handleDelete} />
        ))}
        {images.length < MAX_IMAGES && <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            aspectRatio: '1',
            border: '2px dashed #DCD3C5',
            borderRadius: 4,
            background: '#FAF9F7',
            cursor: uploading ? 'wait' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: '#9A8F8C',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            minHeight: 120,
          }}
        >
          <PlusIcon />
          {uploading ? 'Uploading…' : 'Add photos'}
        </button>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFiles}
      />

      {error && (
        <div style={{
          marginTop: 12, padding: '10px 14px', background: '#FEF2F0',
          borderRadius: 8, color: '#B6584A', fontSize: 13,
          fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>{error}</span>
          <button onClick={() => setError('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B6584A', fontWeight: 700, fontSize: 16, lineHeight: 1 }}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}

function GalleryThumb({ image, onDelete }: { image: GalleryImage; onDelete: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const isTemp = image.id.startsWith('temp-');

  return (
    <div
      style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.image_path}
        alt={image.image_name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: isTemp ? 0.5 : 1, transition: 'opacity 0.2s' }}
      />
      {isTemp && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
          <span style={{ color: '#fff', fontSize: 12, fontFamily: 'system-ui', fontWeight: 600 }}>Uploading…</span>
        </div>
      )}
      {!isTemp && hovered && (
        <button
          onClick={() => onDelete(image.id)}
          title="Remove photo"
          style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(36,31,43,0.72)', border: 'none', borderRadius: '50%',
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
          }}
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}
