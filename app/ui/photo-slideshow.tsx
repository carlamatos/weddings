'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ArrowsPointingInIcon, ArrowsPointingOutIcon, PauseIcon, PlayIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import type { SlideshowPhoto } from '@/app/lib/slideshow-data';
import { SLIDESHOW_DEFAULT_SPEED, SLIDESHOW_POLL_MS, SLIDESHOW_SPEEDS } from '@/app/lib/slideshow';

type Strings = { share: string; scan: string; empty: string; justShared: string };
type WallMessage = { id: number; name: string; body: string };
const MESSAGE_MS = 9000; // each wall message stays this long

const SPEED_KEY = 'mygala:slideshow-speed';
const IDLE_MS = 3000;
const FADE_MS = 1200;

// <page>/slideshow (Live Party): the guests' photos, full screen, for a TV or a
// projector at the venue. Plays the photos in the order they were shared
// and loops; a photo that arrives while it plays is shown next, with a
// "Just shared" tag. Photos the host deletes leave the show at the next
// check. The QR code in the corner opens the page's photo upload, so the
// show keeps itself going. Controls appear when the mouse moves.
export default function PhotoSlideshow({ token, heading, initialPhotos, uploadUrl, strings, preview, messagesOn = false, initialMessages = [] }: {
  token: string;
  messagesOn?: boolean; // the live messages wall rotates over the photos
  initialMessages?: WallMessage[];
  heading: string;
  initialPhotos: SlideshowPhoto[];
  uploadUrl: string;
  strings: Strings;
  preview?: string; // the owner's note while it isn't live for guests
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [shown, setShown] = useState<{ a: SlideshowPhoto | null; b: SlideshowPhoto | null; front: 'a' | 'b' }>({ a: initialPhotos.at(-1) ?? null, b: null, front: 'a' }); // start on the newest
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<number>(SLIDESHOW_DEFAULT_SPEED);
  const [idle, setIdle] = useState(false);
  const [full, setFull] = useState(false);
  const [qr, setQr] = useState('');
  const [messages, setMessages] = useState<WallMessage[]>(initialMessages);
  const [msgAt, setMsgAt] = useState(0);
  // The timer, the keys and the photo check all move the show on, so the
  // list and the photo on screen are also kept in refs they can read.
  const list = useRef(initialPhotos);
  const currentId = useRef<string | null>(initialPhotos.at(-1)?.id ?? null);
  const queue = useRef<string[]>([]); // new arrivals, shown before the loop goes on
  const known = useRef(new Set(initialPhotos.map((p) => p.id)));
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    QRCode.toDataURL(uploadUrl, { margin: 1, width: 360, color: { dark: '#241F2B', light: '#FFFFFF' } }).then(setQr).catch(() => {});
  }, [uploadUrl]);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(SPEED_KEY));
      if ((SLIDESHOW_SPEEDS as readonly number[]).includes(saved)) setSpeed(saved);
    } catch {
      // Storage blocked: the default speed.
    }
  }, []);

  const setList = useCallback((next: SlideshowPhoto[]) => {
    list.current = next;
    setPhotos(next);
  }, []);

  // Moves to the next photo (a new arrival first) or back one, and shows it
  // once it has loaded, so the fade never reveals a blank.
  const step = useCallback(function step(dir: 1 | -1) {
    const all = list.current;
    if (!all.length) {
      currentId.current = null;
      setShown({ a: null, b: null, front: 'a' });
      return;
    }
    let next = -1;
    if (dir === 1) {
      while (queue.current.length && next < 0) {
        const id = queue.current.shift()!;
        next = all.findIndex((p) => p.id === id);
      }
    }
    if (next < 0) {
      const at = all.findIndex((p) => p.id === currentId.current);
      next = at < 0 ? (dir === 1 ? 0 : all.length - 1) : (at + dir + all.length) % all.length;
    }
    const photo = all[next];
    currentId.current = photo.id;
    const img = new Image();
    img.onload = () => setShown((s) => (s.front === 'a' ? { ...s, b: photo, front: 'b' } : { ...s, a: photo, front: 'a' }));
    img.onerror = () => { setList(list.current.filter((p) => p.id !== photo.id)); step(1); }; // deleted or broken: skip it
    img.src = photo.photo;
  }, [setList]);

  // New photos and deletions, every few seconds.
  useEffect(() => {
    let stop = false;
    async function check() {
      try {
        const res = await fetch(`/api/guests-photos/slideshow?t=${encodeURIComponent(token)}`, { cache: 'no-store' });
        if (!res.ok || stop) return;
        const { photos: latest } = (await res.json()) as { photos: SlideshowPhoto[] };
        const added = latest.filter((p) => !known.current.has(p.id));
        added.forEach((p) => known.current.add(p.id));
        queue.current.push(...added.map((p) => p.id));
        if (added.length) setFresh((f) => new Set([...f, ...added.map((p) => p.id)]));
        setList(latest);
        // The first photo, or the host deleted the one on screen.
        if (!currentId.current || !latest.some((p) => p.id === currentId.current)) step(1);
      } catch {
        // Offline for a moment: the show goes on with what it has.
      }
    }
    const timer = setInterval(check, SLIDESHOW_POLL_MS);
    return () => { stop = true; clearInterval(timer); };
  }, [token, setList, step]);

  // The messages wall: new messages and hidden ones, at the same pace as the
  // photos, and one message at a time in the corner.
  useEffect(() => {
    if (!messagesOn) return;
    let stop = false;
    const check = async () => {
      try {
        const res = await fetch(`/api/guest-messages?t=${encodeURIComponent(token)}`, { cache: 'no-store' });
        if (res.ok && !stop) setMessages(((await res.json()) as { messages: WallMessage[] }).messages);
      } catch {
        // Offline for a moment: keep the messages we have.
      }
    };
    const timer = setInterval(check, SLIDESHOW_POLL_MS);
    return () => { stop = true; clearInterval(timer); };
  }, [messagesOn, token]);
  useEffect(() => {
    if (messages.length < 2) return;
    const timer = setInterval(() => setMsgAt((i) => i + 1), MESSAGE_MS);
    return () => clearInterval(timer);
  }, [messages.length]);
  const message = messages.length ? messages[msgAt % messages.length] : null;

  // The next photo after `speed` seconds. Only a new photo on screen restarts
  // the count, so photos arriving don't hold the show up.
  const playable = photos.length > 1;
  useEffect(() => {
    if (paused || !playable) return;
    const timer = setTimeout(() => step(1), speed * 1000);
    return () => clearTimeout(timer);
  }, [paused, speed, step, shown, playable]);

  // Controls and the cursor hide when the mouse rests.
  useEffect(() => {
    let timer = setTimeout(() => setIdle(true), IDLE_MS);
    const wake = () => { setIdle(false); clearTimeout(timer); timer = setTimeout(() => setIdle(true), IDLE_MS); };
    window.addEventListener('mousemove', wake);
    window.addEventListener('touchstart', wake);
    return () => { clearTimeout(timer); window.removeEventListener('mousemove', wake); window.removeEventListener('touchstart', wake); };
  }, []);

  // Keeps the screen from going to sleep while the show plays.
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } };
    const request = () => { nav.wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {}); };
    request();
    const again = () => { if (document.visibilityState === 'visible') request(); };
    document.addEventListener('visibilitychange', again);
    return () => { document.removeEventListener('visibilitychange', again); lock?.release().catch(() => {}); };
  }, []);

  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFull = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else root.current?.requestFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); setPaused((p) => !p); }
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'f' || e.key === 'F') toggleFull();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, toggleFull]);

  function changeSpeed(value: number) {
    setSpeed(value);
    try { localStorage.setItem(SPEED_KEY, String(value)); } catch { /* storage blocked */ }
  }

  const current = shown[shown.front];
  const empty = !current;

  return (
    <div ref={root} className={`ss${idle ? ' ss--idle' : ''}`} style={{ '--ss-fade': `${FADE_MS}ms`, '--ss-speed': `${speed + FADE_MS / 1000}s` } as React.CSSProperties}>
      {(['a', 'b'] as const).map((layer) => {
        const p = shown[layer];
        if (!p) return null;
        return (
          <div key={`${layer}-${p.id}`} className={`ss-slide${shown.front === layer ? ' is-front' : ''}`} aria-hidden={shown.front !== layer}>
            <div className="ss-blur" style={{ backgroundImage: `url("${p.photo}")` }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="ss-photo" src={p.photo} alt="" />
          </div>
        );
      })}

      {empty && (
        <div className="ss-empty">
          {heading && <p className="ss-empty-heading">{heading}</p>}
          <p className="ss-empty-title">{strings.empty}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {qr && <img className="ss-empty-qr" src={qr} alt="" />}
          <p className="ss-empty-scan">{strings.scan}</p>
        </div>
      )}

      {!empty && (
        <>
          {current && fresh.has(current.id) && <span className="ss-new" key={current.id}>★ {strings.justShared}</span>}
          {heading && <p className="ss-heading">{heading}</p>}
          {message && (
            <div className="ss-msg" key={message.id}>
              <p className="ss-msg-body">“{message.body}”</p>
              <p className="ss-msg-name">— {message.name}</p>
            </div>
          )}
          {qr && (
            <div className="ss-qr">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="" />
              <div>
                <strong>{strings.share}</strong>
                <span>{strings.scan}</span>
              </div>
            </div>
          )}
        </>
      )}

      {preview && <p className="ss-preview">{preview}</p>}

      <div className="ss-controls" role="toolbar" aria-label="Slideshow">
        <button type="button" onClick={() => step(-1)} aria-label="Previous photo" disabled={photos.length < 2}><ChevronLeftIcon /></button>
        <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play' : 'Pause'}>{paused ? <PlayIcon /> : <PauseIcon />}</button>
        <button type="button" onClick={() => step(1)} aria-label="Next photo" disabled={photos.length < 2}><ChevronRightIcon /></button>
        <label className="ss-speed">
          <span>Each photo</span>
          <select value={speed} onChange={(e) => changeSpeed(Number(e.target.value))}>
            {SLIDESHOW_SPEEDS.map((s) => <option key={s} value={s}>{s} seconds</option>)}
          </select>
        </label>
        <span className="ss-count">{photos.length} photo{photos.length === 1 ? '' : 's'}</span>
        <button type="button" onClick={toggleFull} aria-label={full ? 'Leave full screen' : 'Full screen'}>{full ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}</button>
      </div>

      <style>{SLIDESHOW_CSS}</style>
    </div>
  );
}

const SLIDESHOW_CSS = `
.ss { position: fixed; inset: 0; overflow: hidden; background: #0d0b10; color: #fff; font-family: system-ui, -apple-system, sans-serif; }
.ss--idle, .ss--idle * { cursor: none; }
.ss-slide { position: absolute; inset: 0; opacity: 0; transition: opacity var(--ss-fade) ease; }
.ss-slide.is-front { opacity: 1; }
.ss-blur { position: absolute; inset: -40px; background-size: cover; background-position: center; filter: blur(36px) brightness(.45) saturate(1.2); }
.ss-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
.ss-slide.is-front .ss-photo { animation: ss-drift var(--ss-speed) ease-out both; }
@keyframes ss-drift { from { transform: scale(1); } to { transform: scale(1.045); } }
@media (prefers-reduced-motion: reduce) { .ss-slide.is-front .ss-photo { animation: none; } }

.ss-msg { position: absolute; left: 3vw; bottom: calc(3vw + clamp(30px, 3.6vw, 60px)); max-width: min(44vw, 640px); padding: clamp(14px, 1.4vw, 24px) clamp(18px, 1.8vw, 30px); border-radius: 18px; background: rgba(255,255,255,.94); color: #241F2B; box-shadow: 0 12px 40px rgba(0,0,0,.35); animation: ss-pop .6s ease-out both; }
.ss-msg-body { margin: 0 0 6px; font-family: Georgia, serif; font-size: clamp(18px, 1.9vw, 34px); line-height: 1.3; overflow-wrap: anywhere; }
.ss-msg-name { margin: 0; font-size: clamp(13px, 1.1vw, 19px); font-weight: 600; color: #8E3A2C; }
.ss-heading { position: absolute; left: 3vw; bottom: 3vw; margin: 0; max-width: 55vw; font-family: Georgia, serif; font-size: clamp(20px, 2.6vw, 44px); line-height: 1.15; text-shadow: 0 2px 18px rgba(0,0,0,.6); overflow-wrap: anywhere; }
.ss-qr { position: absolute; right: 2.4vw; bottom: 2.4vw; display: flex; align-items: center; gap: 14px; padding: 12px 18px 12px 12px; max-width: 34vw; border-radius: 16px; background: rgba(255,255,255,.94); color: #241F2B; box-shadow: 0 12px 40px rgba(0,0,0,.35); }
.ss-qr img { width: clamp(84px, 8vw, 150px); height: auto; border-radius: 6px; display: block; }
.ss-qr strong { display: block; font-size: clamp(15px, 1.4vw, 24px); margin-bottom: 4px; }
.ss-qr span { display: block; font-size: clamp(12px, 0.95vw, 16px); line-height: 1.4; color: #6B6470; }
.ss-new { position: absolute; left: 3vw; top: 3vw; padding: 8px 16px; border-radius: 999px; background: #B6584A; font-size: clamp(13px, 1.1vw, 18px); font-weight: 700; letter-spacing: .02em; box-shadow: 0 6px 24px rgba(0,0,0,.3); animation: ss-pop .5s ease-out both; }
@keyframes ss-pop { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }

.ss-empty { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 24px; text-align: center; background: radial-gradient(circle at 50% 40%, #2d2433, #0d0b10 70%); }
.ss-empty-heading { margin: 0; font-family: Georgia, serif; font-size: clamp(22px, 3vw, 48px); color: rgba(255,255,255,.8); }
.ss-empty-title { margin: 0; font-family: Georgia, serif; font-size: clamp(30px, 4.6vw, 76px); line-height: 1.1; }
.ss-empty-qr { width: clamp(180px, 22vw, 360px); height: auto; padding: 14px; border-radius: 18px; background: #fff; }
.ss-empty-scan { margin: 0; max-width: 640px; font-size: clamp(15px, 1.5vw, 24px); color: rgba(255,255,255,.75); }

.ss-preview { position: absolute; left: 50%; top: 84px; transform: translateX(-50%); margin: 0; max-width: min(720px, calc(100vw - 32px)); padding: 10px 16px; border-radius: 10px; background: #FFF8E7; color: #6B5200; font-size: 14px; line-height: 1.5; text-align: center; box-shadow: 0 6px 24px rgba(0,0,0,.3); }

.ss-controls { position: absolute; left: 50%; top: 20px; transform: translateX(-50%); display: flex; align-items: center; gap: 6px; padding: 8px; border-radius: 14px; background: rgba(20,16,24,.78); backdrop-filter: blur(10px); transition: opacity .3s ease; flex-wrap: wrap; justify-content: center; max-width: calc(100vw - 32px); }
.ss--idle .ss-controls { opacity: 0; pointer-events: none; }
.ss-controls button { display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: 10px; background: transparent; color: #fff; cursor: pointer; }
.ss-controls button:hover:not(:disabled) { background: rgba(255,255,255,.14); }
.ss-controls button:disabled { opacity: .35; cursor: default; }
.ss-controls svg { width: 22px; height: 22px; }
.ss-speed { display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 13px; color: rgba(255,255,255,.75); }
.ss-speed select { padding: 6px 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,.25); background: rgba(255,255,255,.08); color: #fff; font: inherit; }
.ss-speed option { color: #241F2B; }
.ss-count { padding: 0 8px; font-size: 13px; color: rgba(255,255,255,.6); white-space: nowrap; }

@media (max-width: 700px) {
  .ss-qr { max-width: none; left: 12px; right: 12px; bottom: 12px; }
  .ss-heading { display: none; }
}
`;
