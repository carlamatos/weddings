import type { PaperMotion } from '@/app/lib/invitation-motion';

// The moving layer over a birthday paper (app/lib/invitation-motion.ts), drawn
// above the paper and under the words: flames that flicker with a warm glow,
// flags that swing in the wind, or confetti bursting from the middle. Plain
// CSS animations, in cqw like the rest of the card. Still when the guest asks
// for less motion, and in print (the flames and flags at rest, no confetti).

// The same "random" numbers every time, so server and browser agree.
const rnd = (i: number, salt: number) => {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const cq = (px: number) => `${px / 10}cqw`;

const CSS = `
@keyframes mg-flicker {
  0%, 100% { transform: scale(1, 1) skewX(0deg); opacity: 1; }
  18% { transform: scale(0.95, 1.07) skewX(-2.5deg); opacity: 0.94; }
  37% { transform: scale(1.04, 0.94) skewX(1.5deg); opacity: 1; }
  55% { transform: scale(0.97, 1.09) skewX(3deg); opacity: 0.9; }
  74% { transform: scale(1.02, 0.97) skewX(-1.5deg); opacity: 1; }
}
@keyframes mg-glow {
  0%, 100% { opacity: 0.75; transform: translate(-50%, -50%) scale(1); }
  30% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
  60% { opacity: 0.65; transform: translate(-50%, -50%) scale(0.95); }
}
@keyframes mg-sway {
  0%, 100% { transform: rotate(-2deg) scaleX(1); }
  30% { transform: rotate(9deg) scaleX(0.93); }
  55% { transform: rotate(3deg) scaleX(0.98); }
  78% { transform: rotate(7deg) scaleX(0.95); }
}
@keyframes mg-burst {
  0% { transform: translate(0, 0) scale(0.2); opacity: 0; animation-timing-function: cubic-bezier(0.1, 0.75, 0.3, 1); }
  3% { opacity: 1; }
  32% { transform: translate(var(--dx), var(--dy)) scale(1); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(1); opacity: 1; }
}
@keyframes mg-fall {
  0%, 22% { transform: translateY(0) rotate(0deg); opacity: 1; animation-timing-function: cubic-bezier(0.45, 0, 0.8, 0.6); }
  70% { opacity: 1; }
  92%, 100% { transform: translateY(var(--fall)) rotate(var(--spin)); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .mg-motion * { animation: none !important; }
  .mg-confetti { display: none; }
}
@media print {
  .mg-motion * { animation: none !important; }
  .mg-confetti { display: none; }
}
`;

const CONFETTI_COLORS = ['#E5197F', '#1FC7B0', '#22B3E2', '#F7B500', '#0E5068', '#8A1F55', '#FF6FB1'];

export function PaperMotionLayer({ motion }: { motion: PaperMotion }) {
  return (
    <div className="mg-motion" aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* One copy of the keyframes for the whole page (React hoists and dedupes it). */}
      <style href="invitation-motion" precedence="default">{CSS}</style>
      {motion.kind === 'confetti' ? <Confetti /> : motion.pieces.map(([x, y, w, h, ax, ay], i) => {
        const sprite = {
          position: 'absolute', left: cq(x), top: cq(y), width: cq(w), height: cq(h),
          backgroundImage: `url(${motion.atlas})`, backgroundRepeat: 'no-repeat',
          backgroundSize: `${cq(motion.size[0])} ${cq(motion.size[1])}`, backgroundPosition: `${cq(-ax)} ${cq(-ay)}`,
        } as const;
        if (motion.kind === 'flags') {
          // Each flag hangs from its top (12px of clear margin above it) and
          // the gust runs along the string, left to right.
          return <span key={i} style={{ ...sprite, transformOrigin: `50% ${(12 / h) * 100}%`, animation: `mg-sway ${(2.6 + rnd(i, 1) * 0.9).toFixed(2)}s ease-in-out ${(-(x / 1000) * 2.2 - rnd(i, 2) * 0.4).toFixed(2)}s infinite` }} />;
        }
        const glow = Math.max(w, h * 0.45) * 2.6;
        return (
          <span key={i}>
            <span style={{
              position: 'absolute', left: cq(x + w / 2), top: cq(y + h * 0.42), width: cq(glow), height: cq(glow), borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,200,120,0.38) 0%, rgba(255,175,90,0.12) 36%, rgba(255,170,80,0) 68%)',
              animation: `mg-glow ${(1.6 + rnd(i, 3) * 0.8).toFixed(2)}s ease-in-out ${(-rnd(i, 4) * 2).toFixed(2)}s infinite`,
              transform: 'translate(-50%, -50%)',
            }} />
            <span style={{ ...sprite, transformOrigin: '50% 95%', animation: `mg-flicker ${(0.9 + rnd(i, 5) * 0.6).toFixed(2)}s ease-in-out ${(-rnd(i, 6) * 1.5).toFixed(2)}s infinite` }} />
          </span>
        );
      })}
    </div>
  );
}

// Confetti: a burst from the middle of the card every few seconds, the pieces
// flying out, then drifting down, turning, and fading.
function Confetti() {
  const N = 46;
  return (
    <div className="mg-confetti" style={{ position: 'absolute', left: '50%', top: '46%' }}>
      {Array.from({ length: N }, (_, i) => {
        // Out in every direction, a little more upwards.
        const a = (i / N) * Math.PI * 2 + rnd(i, 7) * 0.5;
        const dist = 22 + rnd(i, 8) * 30;
        const dx = Math.cos(a) * dist, dy = Math.sin(a) * dist * 0.9 - 10;
        const w = 1.1 + rnd(i, 9) * 1.2, h = rnd(i, 10) > 0.5 ? w : w * 0.5;
        const dur = 5.5, delay = -rnd(i, 11) * 0.12;
        return (
          <span key={i} style={{ position: 'absolute', left: 0, top: 0, ['--dx' as string]: `${dx.toFixed(1)}cqw`, ['--dy' as string]: `${dy.toFixed(1)}cqw`, animation: `mg-burst ${dur}s ${delay.toFixed(2)}s infinite` }}>
            <span style={{
              display: 'block', width: `${w.toFixed(2)}cqw`, height: `${h.toFixed(2)}cqw`, background: CONFETTI_COLORS[i % CONFETTI_COLORS.length], borderRadius: rnd(i, 12) > 0.8 ? '50%' : '0.15cqw',
              ['--fall' as string]: `${(18 + rnd(i, 13) * 22).toFixed(1)}cqw`, ['--spin' as string]: `${Math.round((rnd(i, 14) - 0.5) * 900)}deg`,
              animation: `mg-fall ${dur}s ${delay.toFixed(2)}s infinite`,
            }} />
          </span>
        );
      })}
    </div>
  );
}
