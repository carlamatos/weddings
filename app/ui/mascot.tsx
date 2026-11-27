// MyGala's three characters (public/images/mascot, drawn as animated SVGs;
// the drawings and their preview page are in mascot/ at the project root):
// Bubbly the host (welcomes and helps), Pop the celebrator (the big moments,
// and "oops" for errors) and Glo the guide (lights the way: the 404 page).
// Each moves on its own and stays still under prefers-reduced-motion. An
// <img>, so it costs one small file (5–8 KB) and no JavaScript. Decorative:
// the words beside it say what it means.
export type MascotPose =
  | 'bubbly' | 'bubbly-wave' | 'bubbly-think' | 'bubbly-sleep'
  | 'pop' | 'pop-ready' | 'pop-oops'
  | 'glo' | 'glo-this-way' | 'glo-lost' | 'glo-sleep';

// Each character's drawing is 240 wide; its height (the SVG's viewBox).
const HEIGHT = { bubbly: 274, pop: 280, glo: 260 } as const;

export function Mascot({ pose, size, className, style, eager = false }: { pose: MascotPose; size: number; className?: string; style?: React.CSSProperties; eager?: boolean }) {
  const character = pose.split('-')[0] as keyof typeof HEIGHT;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/mascot/${pose}.svg`}
      width={size}
      height={Math.round((size * HEIGHT[character]) / 240)}
      alt=""
      aria-hidden="true"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`mascot${className ? ` ${className}` : ''}`}
      style={style}
    />
  );
}
