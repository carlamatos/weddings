import type { CSSProperties } from 'react';
import { previewImage } from '@/app/ui/themes/preview-image';

// The New Year's Eve theme's banner (app/ui/themes/NewYearsEve.tsx), behind
// the /new-years-eve-party banner's words: sparklers in the dark, the gold
// sweep of sparkles (a video on black, screen-blended so only the light
// shows), the new year in tall gold outline, gold confetti falling and
// twinkling sparkles. Every movement is CSS (invitation-landing.css,
// .ilp-ny-*) and stops under prefers-reduced-motion. Fixed values, so the
// page stays static.

const IMG = '/images/themes/new-years-eve';
const GOLD = '#C59F5E';
const GOLD_BRIGHT = '#E8BC76';
const COLORS = [GOLD_BRIGHT, GOLD, '#D0BFA0', '#AD741E', '#FFF1CF'];

const CONFETTI = Array.from({ length: 34 }, (_, i) => ({
  left: `${(i * 8.3 + 2) % 100}%`,
  w: i % 3 === 0 ? 5 : 8 + (i % 4) * 2,
  h: i % 3 === 0 ? 5 : 3,
  color: COLORS[i % COLORS.length],
  delay: `-${(i * 1.37) % 12}s`,
  dur: `${9 + (i % 5) * 2.2}s`,
  still: `${(i * 29 + 6) % 90}%`, // where it rests when motion is reduced
}));

const SPARKLES = [
  { left: '10%', top: '24%', size: 16, delay: '0s' }, { left: '21%', top: '70%', size: 11, delay: '-1.4s' },
  { left: '6%', top: '52%', size: 9, delay: '-2.6s' }, { left: '86%', top: '30%', size: 15, delay: '-0.8s' },
  { left: '78%', top: '76%', size: 10, delay: '-2s' }, { left: '93%', top: '56%', size: 12, delay: '-3.1s' },
];

function Sparkle({ size, style }: { size: number; style?: CSSProperties }) {
  return (
    <svg className="ilp-ny-sparkle" style={style} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0 C 13 8, 16 11, 24 12 C 16 13, 13 16, 12 24 C 11 16, 8 13, 0 12 C 8 11, 11 8, 12 0 Z" fill={GOLD_BRIGHT} />
    </svg>
  );
}

export function NewYearsHeroEffect({ year }: { year: string }) {
  return (
    <div className="ilp-ny" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ilp-ny-bg" {...previewImage(`${IMG}/hero.jpeg`, '100vw', { priority: true })} alt="" />
      <div className="ilp-ny-overlay" />
      {/* The sweep (about 500 KB) only where it's seen: on wide screens, with
          motion on. Phones and reduced motion never download it. */}
      <video className="ilp-ny-sweep" autoPlay muted playsInline preload="none">
        <source src={`${IMG}/sparkle.mp4`} type="video/mp4" media="(min-width: 901px) and (prefers-reduced-motion: no-preference)" />
      </video>
      <span className="ilp-ny-year">{year}</span>
      <div className="ilp-ny-confetti">
        {CONFETTI.map((c) => (
          <span key={c.left} style={{ left: c.left, width: c.w, height: c.h, background: c.color, animationDelay: c.delay, animationDuration: c.dur, ['--ilp-still' as string]: c.still } as CSSProperties} />
        ))}
      </div>
      {SPARKLES.map((s) => <Sparkle key={`${s.left}-${s.top}`} size={s.size} style={{ left: s.left, top: s.top, animationDelay: s.delay }} />)}
    </div>
  );
}
