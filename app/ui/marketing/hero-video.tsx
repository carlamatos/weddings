'use client';

import { useEffect, useRef } from 'react';

// The homepage's background video. It starts as just the poster image; the
// video itself (~2 MB) is only fetched on wider screens, so phones on mobile
// data — and anyone with Data Saver or reduced motion on — get the still.
export default function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) return;
    if (!window.matchMedia('(min-width: 768px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    video.src = src;
    video.play().catch(() => {});
  }, [src]);

  return <video ref={ref} className="hero-video" muted loop playsInline preload="none" poster={poster} />;
}
