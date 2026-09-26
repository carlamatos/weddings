import { useId } from 'react';

// A theme-agnostic hero background used until a theme has a real default
// image (see hero-defaults.ts) or the owner uploads a banner. Renders an
// abstract gradient wash in the theme's own palette instead of a photo —
// useId keeps gradient ids collision-free when several previews render on
// the same page (e.g. the setup wizard's theme grid).
export function GradientHeroPlaceholder({
  colors,
  className,
}: {
  colors: [string, string, string?];
  className?: string;
}) {
  const [c1, c2, c3 = c1] = colors;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg
      className={className}
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <defs>
        <radialGradient id={`ghp-a-${uid}`} cx="28%" cy="28%" r="60%">
          <stop offset="0%" stopColor={c1} stopOpacity="0.55" />
          <stop offset="100%" stopColor={c1} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`ghp-b-${uid}`} cx="76%" cy="72%" r="58%">
          <stop offset="0%" stopColor={c2} stopOpacity="0.5" />
          <stop offset="100%" stopColor={c2} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`ghp-c-${uid}`} cx="50%" cy="46%" r="42%">
          <stop offset="0%" stopColor={c3} stopOpacity="0.3" />
          <stop offset="100%" stopColor={c3} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill="#FFFFFF" />
      <ellipse cx="460" cy="280" rx="640" ry="480" fill={`url(#ghp-a-${uid})`} />
      <ellipse cx="1220" cy="720" rx="580" ry="440" fill={`url(#ghp-b-${uid})`} />
      <ellipse cx="800" cy="500" rx="360" ry="300" fill={`url(#ghp-c-${uid})`} />
    </svg>
  );
}
