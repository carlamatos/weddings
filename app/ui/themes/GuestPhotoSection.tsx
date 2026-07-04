'use client';

import { useState, useRef } from 'react';
import type { GuestPhoto } from '@/app/lib/definitions';

// ─── Public-facing: upload + gallery ────────────────────────────
interface GuestPhotoSectionProps {
  userPageId: string;
  initialPhotos: GuestPhoto[];
  initialHasMore: boolean;
  labels: {
    shareYourPhoto: string;
    loadMore: string;
    beFirstToShare: string;
    photoUploaded: string;
    photoUploadError: string;
    uploading: string;
  };
  btnClassName?: string;
}

export function GuestPhotoSection({
  userPageId,
  initialPhotos,
  initialHasMore,
  labels,
  btnClassName = 'btn',
}: GuestPhotoSectionProps) {
  const [photos, setPhotos] = useState<GuestPhoto[]>(initialPhotos);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploadProgress({ current: 0, total: files.length });
    let succeeded = 0;
    let lastError = '';

    for (let i = 0; i < files.length; i++) {
      setUploadProgress({ current: i + 1, total: files.length });
      const fd = new FormData();
      fd.append('userPageId', userPageId);
      fd.append('file', files[i]);
      try {
        const res = await fetch('/api/guests-photos/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.url) {
          const newPhoto: GuestPhoto = {
            id: data.id,
            user_page_id: parseInt(userPageId, 10),
            photo: data.url,
            ip_address: null,
            uploaded_at: data.uploaded_at ?? new Date().toISOString(),
          };
          setPhotos((prev) => [newPhoto, ...prev]);
          succeeded++;
        } else {
          lastError = data.error ?? labels.photoUploadError;
        }
      } catch {
        lastError = labels.photoUploadError;
      }
    }

    setUploadProgress(null);
    e.target.value = '';

    if (succeeded > 0 && succeeded === files.length) {
      showToast(files.length === 1 ? labels.photoUploaded : `${succeeded} photos shared — thank you!`, true);
    } else if (succeeded > 0) {
      showToast(`${succeeded} of ${files.length} photos uploaded. ${lastError}`, false);
    } else {
      showToast(lastError || labels.photoUploadError, false);
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/guests-photos?userPageId=${userPageId}&offset=${photos.length}`);
      const data = await res.json();
      setPhotos((prev) => [...prev, ...data.photos]);
      setHasMore(data.hasMore);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      {/* Upload button */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <button
          className={btnClassName}
          type="button"
          disabled={!!uploadProgress}
          onClick={() => inputRef.current?.click()}
        >
          {uploadProgress
            ? `${labels.uploading} ${uploadProgress.current} / ${uploadProgress.total}`
            : labels.shareYourPhoto}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: toast.ok ? '#3D6B46' : '#B6584A', color: '#fff',
          padding: '10px 20px', borderRadius: 8, fontSize: 14, zIndex: 9999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)', whiteSpace: 'nowrap',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Grid */}
      {photos.length === 0 ? (
        <p style={{ textAlign: 'center', opacity: 0.5, fontSize: 15 }}>{labels.beFirstToShare}</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {photos.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setLightbox(i)}
                style={{ padding: 0, border: 'none', background: 'none', cursor: 'zoom-in', display: 'block', aspectRatio: '1', overflow: 'hidden', borderRadius: 4 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.photo}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </button>
            ))}
          </div>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button
                className={btnClassName}
                type="button"
                disabled={loadingMore}
                onClick={loadMore}
                style={{ opacity: loadingMore ? 0.6 : 1 }}
              >
                {loadingMore ? '…' : labels.loadMore}
              </button>
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox photos={photos} index={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}

// ─── Dashboard: view + delete ────────────────────────────────────
interface DashboardGuestPhotosProps {
  initialPhotos: GuestPhoto[];
  initialHasMore: boolean;
  userPageId: string;
}

export function DashboardGuestPhotos({ initialPhotos, initialHasMore, userPageId }: DashboardGuestPhotosProps) {
  const [photos, setPhotos] = useState<GuestPhoto[]>(initialPhotos);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const deletePhoto = async (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/guests-photos?id=${id}`, { method: 'DELETE' });
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/guests-photos?userPageId=${userPageId}&offset=${photos.length}`);
      const data = await res.json();
      setPhotos((prev) => [...prev, ...data.photos]);
      setHasMore(data.hasMore);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  };

  if (photos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6B6470', fontSize: 15 }}>
        No guest photos yet. Once guests share photos on your page they will appear here.
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {photos.map((p, i) => (
          <div key={p.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#f0ede8' }}>
            <button
              onClick={() => setLightbox(i)}
              style={{ padding: 0, border: 'none', background: 'none', cursor: 'zoom-in', display: 'block', width: '100%', aspectRatio: '1' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </button>

            {/* Meta */}
            <div style={{ padding: '6px 8px 8px', fontSize: 11, color: '#6B6470', lineHeight: 1.4 }}>
              <div>{new Date(p.uploaded_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              <div>{new Date(p.uploaded_at).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}</div>
              {p.ip_address && <div style={{ opacity: 0.7 }}>IP: {p.ip_address}</div>}
            </div>

            {/* Delete */}
            <button
              onClick={() => deletePhoto(p.id)}
              title="Delete photo"
              style={{
                position: 'absolute', top: 6, right: 6,
                background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%',
                width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', flexShrink: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button
            type="button"
            disabled={loadingMore}
            onClick={loadMore}
            style={{
              padding: '10px 28px', borderRadius: 8, border: '1.5px solid #ccc',
              background: '#fff', cursor: loadingMore ? 'default' : 'pointer',
              fontSize: 14, color: '#241F2B', opacity: loadingMore ? 0.6 : 1,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {lightbox !== null && (
        <Lightbox photos={photos} index={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}

// ─── Shared lightbox ─────────────────────────────────────────────
function Lightbox({ photos, index, onClose }: { photos: GuestPhoto[]; index: number; onClose: () => void }) {
  const [cur, setCur] = useState(index);
  const prev = () => setCur((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setCur((i) => (i + 1) % photos.length);

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <button onClick={onClose} style={lbBtn({ top: 20, right: 20 })}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      {photos.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); prev(); }} style={lbBtn({ left: 16, top: '50%', transform: 'translateY(-50%)' })}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photos[cur].photo} alt="" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 4, boxShadow: '0 8px 40px rgba(0,0,0,0.6)', userSelect: 'none' }} />
      {photos.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); next(); }} style={lbBtn({ right: 16, top: '50%', transform: 'translateY(-50%)' })}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'system-ui', letterSpacing: 1 }}>
        {cur + 1} / {photos.length}
      </div>
    </div>
  );
}

function lbBtn(extra: React.CSSProperties): React.CSSProperties {
  return { position: 'fixed', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', backdropFilter: 'blur(4px)', ...extra };
}
