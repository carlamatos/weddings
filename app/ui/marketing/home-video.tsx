'use client';

import { useEffect, useRef, useState } from 'react';
import { getImageProps } from 'next/image';
import type { Video } from '@/app/lib/marketing/types';
import { SoundButton } from './feature-video';

// The homepage's "how MyGala works" video. Only the poster loads with the
// page; the video file isn't fetched until the visitor presses play, so the
// page is as fast as without it. A press is a choice to watch, so it plays
// with sound (muted only if the browser refuses sound).
// The hero's "Watch how it works" button (a link to #how-it-works) scrolls
// here and starts it too. Once it plays, the sound button can turn the
// sound off (or back on).
// The poster goes through Next's image optimizer, sized to the frame: the
// page's width less its side padding (marketing.css .wrap), at most 1056px.
const POSTER_SIZES = '(max-width: 640px) calc(100vw - 40px), (max-width: 1120px) calc(100vw - 64px), 1056px';

export function HomeVideo({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const { props: poster } = getImageProps({ src: video.poster, alt: '', width: video.width, height: video.height, sizes: POSTER_SIZES, quality: 75 });
  const frame = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest?.('a[href="#how-it-works"]')) return;
      e.preventDefault();
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      frame.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
      setPlaying(true);
      player.current?.play().catch(() => {});
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Keeps the button in step when the sound is changed from the player's own controls.
  useEffect(() => {
    const el = player.current;
    if (!playing || !el) return;
    const sync = () => setMuted(el.muted);
    sync();
    el.addEventListener('volumechange', sync);
    return () => el.removeEventListener('volumechange', sync);
  }, [playing]);

  useEffect(() => {
    const el = player.current;
    if (!playing || !el) return;
    el.play().catch(() => {
      el.muted = true;
      el.play().catch(() => {});
    });
  }, [playing]);

  return (
    <figure className="home-video">
      <div className="home-video-frame" ref={frame}>
        {playing ? (
          <>
            <video ref={player} src={video.src} width={video.width} height={video.height} controls playsInline aria-label={video.title}>
              <a href={video.src}>Watch the video: {video.title}</a>
            </video>
            <SoundButton
              muted={muted}
              onClick={() => {
                const el = player.current;
                if (!el) return;
                el.muted = !el.muted;
                if (!el.muted && el.paused) el.play().catch(() => {});
              }}
            />
          </>
        ) : (
          <button type="button" className="home-video-play" onClick={() => setPlaying(true)} data-cta="home-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img {...poster} alt="" loading="lazy" decoding="async" />
            <span className="home-video-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
              Watch how it works <span className="home-video-len">1 min</span>
            </span>
          </button>
        )}
      </div>
      <figcaption>{video.caption}</figcaption>
    </figure>
  );
}
