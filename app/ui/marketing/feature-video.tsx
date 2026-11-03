'use client';

import { useEffect, useRef, useState } from 'react';
import type { Video } from '@/app/lib/marketing/types';

// A short explainer video on a feature page. It plays muted while it's on
// screen (unless the visitor prefers reduced motion) and pauses when it
// scrolls away; the sound button turns the voiceover on. Until it's near the
// screen only the poster and metadata load.
export function FeatureVideo({ video }: { video: Video }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Keeps the button in step when the sound is changed from the player's own controls.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => setMuted(el.muted);
    el.addEventListener('volumechange', sync);
    return () => el.removeEventListener('volumechange', sync);
  }, []);

  function toggleSound() {
    const el = ref.current;
    if (!el) return;
    el.muted = !el.muted;
    if (!el.muted && el.paused) el.play().catch(() => {});
  }

  return (
    <figure className="mk-video" id="video">
      <div className="mk-video-frame">
        <video
          ref={ref}
          src={video.src}
          poster={video.poster}
          width={video.width}
          height={video.height}
          muted
          controls
          playsInline
          preload="metadata"
          aria-label={video.title}
        >
          <a href={video.src}>Watch the video: {video.title}</a>
        </video>
        <button type="button" className="mk-video-sound" onClick={toggleSound} aria-pressed={!muted}>
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5Z" /><path d="m23 9-6 6M17 9l6 6" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></svg>
          )}
          {muted ? 'Turn sound on' : 'Sound on'}
        </button>
      </div>
      <figcaption>{video.caption}</figcaption>
    </figure>
  );
}
