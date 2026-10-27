// The wedding colour palette tool (app/ui/marketing/palette-tool.tsx): the
// wedding styles it offers, the three questions that suggest a style, the
// colour names it shows, and how a palette is built around the colour the
// couple picks.
//
// A palette has five colours in fixed roles (main, second, accent, a fourth
// that's greenery or an earth or deep tone, and a neutral) plus a metal.
// Each style has a hand-picked palette. When the couple picks their own main
// colour, the second and accent colours are rebuilt around it, turned round
// the colour wheel by the "mix" (tonal, analogous, complementary…), while
// keeping the lightness and strength of the style's own second and accent,
// so a Boho palette stays earthy and a Pastel one stays soft. Greenery,
// neutrals and metals don't follow the main colour.

export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type Venue = 'garden' | 'beach' | 'barn' | 'ballroom' | 'city' | 'forest' | 'vineyard';
export type Feel = 'romantic' | 'relaxed' | 'elegant' | 'fun' | 'moody' | 'modern';
export type Mix = 'tonal' | 'analogous' | 'complementary' | 'split' | 'triad';

export const SEASONS: { id: Season; label: string }[] = [
  { id: 'spring', label: 'Spring' },
  { id: 'summer', label: 'Summer' },
  { id: 'fall', label: 'Fall' },
  { id: 'winter', label: 'Winter' },
];

export const VENUES: { id: Venue; label: string }[] = [
  { id: 'garden', label: 'Garden or park' },
  { id: 'beach', label: 'Beach or lake' },
  { id: 'barn', label: 'Barn or farm' },
  { id: 'ballroom', label: 'Ballroom or hotel' },
  { id: 'city', label: 'City loft or restaurant' },
  { id: 'forest', label: 'Forest or mountains' },
  { id: 'vineyard', label: 'Vineyard or estate' },
];

export const FEELS: { id: Feel; label: string }[] = [
  { id: 'romantic', label: 'Romantic' },
  { id: 'relaxed', label: 'Relaxed and natural' },
  { id: 'elegant', label: 'Elegant and formal' },
  { id: 'fun', label: 'Bright and fun' },
  { id: 'moody', label: 'Moody and dramatic' },
  { id: 'modern', label: 'Simple and modern' },
];

export const MIX_LABELS: Record<Mix, string> = {
  tonal: 'Tonal: shades of one colour',
  analogous: 'Neighbours: colours side by side on the wheel',
  complementary: 'Contrast: an opposite colour as the accent',
  split: 'Soft contrast: two colours near the opposite',
  triad: 'Garden mix: three colours evenly spread',
};

export type PaletteStyle = {
  id: string;
  name: string;
  blurb: string;
  tip: string;
  // main, second, accent, fourth, neutral
  palette: [string, string, string, string, string];
  fourth: 'Greenery' | 'Earth tone' | 'Deep tone' | 'Soft tone';
  metal: { name: string; hex: string };
  mixes: Mix[];
  starters: string[]; // main colours that suit the style; the first is palette[0]
  seasons: Season[];
  venues: Venue[];
  feels: Feel[];
};

export const PALETTE_STYLES: PaletteStyle[] = [
  {
    id: 'romantic-garden', name: 'Romantic garden', blurb: 'Dusty rose, peach and sage, like a garden in June.',
    tip: 'Garden roses, peonies and ranunculus come in nearly every shade of this palette, so your florist has lots to work with.',
    palette: ['#C99A93', '#F2C4A8', '#8E6478', '#9DAE95', '#F8F3EA'], fourth: 'Greenery', metal: { name: 'Gold', hex: '#C6A15B' },
    mixes: ['analogous', 'tonal'], starters: ['#C99A93', '#E8A0B4', '#B9A9D6', '#F2C4A8', '#F2D3CC', '#F2DF9E'],
    seasons: ['spring', 'summer'], venues: ['garden', 'vineyard'], feels: ['romantic'],
  },
  {
    id: 'wildflower', name: 'Wildflower meadow', blurb: 'Cornflower, buttercup and poppy, gathered loosely.',
    tip: 'Let the flowers carry the colour. With bouquets this colourful, keep linens and paper in your neutral.',
    palette: ['#7F8FC9', '#F3D35B', '#E0674F', '#7FA35B', '#F6F1E4'], fourth: 'Greenery', metal: { name: 'Brass', hex: '#B8964E' },
    mixes: ['triad', 'split', 'analogous'], starters: ['#7F8FC9', '#F3D35B', '#E0674F', '#B9A9D6', '#E8A0B4', '#E9A26B'],
    seasons: ['spring', 'summer'], venues: ['garden', 'barn'], feels: ['relaxed', 'fun'],
  },
  {
    id: 'classic', name: 'Classic and timeless', blurb: 'Ivory, blush and champagne with soft greenery.',
    tip: 'Classic palettes look right in photos for decades. Add one deeper colour, like navy or burgundy, if you want more contrast.',
    palette: ['#EBC8C0', '#E6D3B1', '#B98C86', '#A3B19B', '#FAF7F0'], fourth: 'Greenery', metal: { name: 'Gold', hex: '#C9A24B' },
    mixes: ['tonal', 'analogous'], starters: ['#EBC8C0', '#26355A', '#8DA4BB', '#6E1E2B', '#E6D3B1', '#1C6B4E'],
    seasons: ['spring', 'summer', 'fall', 'winter'], venues: ['ballroom', 'garden', 'vineyard'], feels: ['romantic', 'elegant'],
  },
  {
    id: 'farmhouse', name: 'Rustic farmhouse', blurb: 'Dusty blue, burlap and eucalyptus on old wood.',
    tip: 'Wood tables, string lights and greenery are already part of most barns, so your colours only need a few touches: napkins, ribbons, flowers.',
    palette: ['#8DA4BB', '#C2A27E', '#B8734A', '#8FA89A', '#F3EAD3'], fourth: 'Greenery', metal: { name: 'Copper', hex: '#B87333' },
    mixes: ['complementary', 'analogous'], starters: ['#8DA4BB', '#A3B19B', '#C0643F', '#7A2E35', '#D1A12D', '#E8C4BA'],
    seasons: ['spring', 'summer', 'fall'], venues: ['barn'], feels: ['relaxed', 'romantic'],
  },
  {
    id: 'boho', name: 'Boho desert', blurb: 'Terracotta, dusty pink and pampas tones.',
    tip: 'Dried flowers and pampas grass suit this palette, keep for months and can cost less than fresh flowers out of season.',
    palette: ['#C0643F', '#D8A79A', '#C8902E', '#8A8A5C', '#E8DCC8'], fourth: 'Greenery', metal: { name: 'Brass', hex: '#B5964D' },
    mixes: ['analogous', 'tonal'], starters: ['#C0643F', '#A9472A', '#D8A79A', '#A3B19B', '#C8902E', '#C08B80'],
    seasons: ['summer', 'fall'], venues: ['barn', 'beach', 'vineyard'], feels: ['relaxed', 'fun'],
  },
  {
    id: 'coastal', name: 'Beach and coastal', blurb: 'Sea blue, seafoam and a little coral, with sand.',
    tip: 'Strong sun washes out pale colours in photos. Near the water, a mid-tone blue or coral holds up better than pastels alone.',
    palette: ['#6E9CBF', '#A8D5C2', '#F07E6E', '#D8C3A0', '#FBFAF6'], fourth: 'Earth tone', metal: { name: 'Silver', hex: '#B4B7BA' },
    mixes: ['analogous', 'complementary'], starters: ['#6E9CBF', '#A8D5C2', '#F07E6E', '#34B3B0', '#1F2D4D', '#F2C4A8'],
    seasons: ['summer'], venues: ['beach'], feels: ['relaxed', 'fun'],
  },
  {
    id: 'modern', name: 'Modern minimalist', blurb: 'Black, white and warm grey, with one colour.',
    tip: 'Pick one colour and use it with confidence. A minimalist palette works because everything else stays quiet.',
    palette: ['#1E1E1E', '#BDB6AC', '#B5654A', '#8E8A80', '#FFFFFF'], fourth: 'Earth tone', metal: { name: 'Brushed silver', hex: '#A8A9AD' },
    mixes: ['tonal', 'complementary'], starters: ['#1E1E1E', '#6E7350', '#B5654A', '#A3B19B', '#1F4FA8', '#C19A6B'],
    seasons: ['spring', 'summer', 'fall', 'winter'], venues: ['city', 'ballroom'], feels: ['modern', 'elegant'],
  },
  {
    id: 'vintage', name: 'Vintage', blurb: 'Dusty mauve, faded teal and antique lace.',
    tip: 'Thrifted china, lace and antique frames bring this palette to life, and mismatched pieces are part of the charm.',
    palette: ['#B48C98', '#E2C7B5', '#5E8C88', '#A9AD8F', '#F1E8D7'], fourth: 'Greenery', metal: { name: 'Antique gold', hex: '#B09155' },
    mixes: ['complementary', 'tonal'], starters: ['#B48C98', '#5E8C88', '#B9837D', '#C79A3E', '#A9BFD6', '#7A3B47'],
    seasons: ['spring', 'fall'], venues: ['garden', 'city', 'ballroom'], feels: ['romantic'],
  },
  {
    id: 'glam', name: 'Art deco glam', blurb: 'Emerald, black and champagne, with gold.',
    tip: 'Glam palettes need lots of light. Candles, mirrors and metallics keep deep colours from feeling heavy at night.',
    palette: ['#1C5E4A', '#18181B', '#E3CFA3', '#CFCBC4', '#F7F2E8'], fourth: 'Soft tone', metal: { name: 'Gold', hex: '#C9A24B' },
    mixes: ['complementary', 'tonal'], starters: ['#1C5E4A', '#18181B', '#1B2742', '#6E1E2B', '#1F3F8C', '#E3CFA3'],
    seasons: ['fall', 'winter'], venues: ['ballroom', 'city'], feels: ['elegant', 'moody'],
  },
  {
    id: 'tropical', name: 'Tropical', blurb: 'Fuchsia, tangerine and sunshine, with palm leaves.',
    tip: 'Bright palettes are easier to balance with lots of green and white. Big tropical leaves cost little and fill a lot of space.',
    palette: ['#D43B7F', '#F28C28', '#F2CF3B', '#2F7A4C', '#FFFDF7'], fourth: 'Greenery', metal: { name: 'Gold', hex: '#C9A24B' },
    mixes: ['analogous', 'triad', 'split'], starters: ['#D43B7F', '#F07E6E', '#F28C28', '#34B3B0', '#F5A623', '#B865A8'],
    seasons: ['summer'], venues: ['beach', 'garden'], feels: ['fun'],
  },
  {
    id: 'moody', name: 'Moody romance', blurb: 'Burgundy, plum and deep green, by candlelight.',
    tip: 'Dark colours read as black in dim light. Add a soft blush or champagne so the details still show in photos.',
    palette: ['#5E1B27', '#4A2742', '#D9A9A0', '#2D4B37', '#EDE3D8'], fourth: 'Greenery', metal: { name: 'Gold', hex: '#B8913F' },
    mixes: ['analogous', 'tonal'], starters: ['#5E1B27', '#4A2742', '#24402F', '#1B2742', '#7E1F2E', '#3F2238'],
    seasons: ['fall', 'winter'], venues: ['ballroom', 'city', 'forest'], feels: ['moody', 'romantic'],
  },
  {
    id: 'woodland', name: 'Enchanted forest', blurb: 'Forest green, moss and rust, among the trees.',
    tip: 'In the woods, greenery is your free décor. Spend on a few warm accents and lots of candlelight instead.',
    palette: ['#2F4A38', '#7B8450', '#A9572F', '#6B4E3B', '#F1EADB'], fourth: 'Earth tone', metal: { name: 'Copper', hex: '#B87333' },
    mixes: ['analogous', 'complementary'], starters: ['#2F4A38', '#7B8450', '#A9572F', '#4A6A5C', '#6B2D4E', '#C8902E'],
    seasons: ['fall', 'spring'], venues: ['forest'], feels: ['relaxed', 'moody'],
  },
  {
    id: 'harvest', name: 'Fall harvest', blurb: 'Burnt orange, burgundy and mustard.',
    tip: 'Fall flowers and foliage, like dahlias, mums and changing leaves, are in season and often cost less than imported blooms.',
    palette: ['#C4562A', '#6E1E2B', '#D1A12D', '#6E7339', '#F4ECDD'], fourth: 'Greenery', metal: { name: 'Copper', hex: '#B87333' },
    mixes: ['analogous', 'split'], starters: ['#C4562A', '#A9472A', '#6E1E2B', '#D1A12D', '#C0643F', '#5C2E4F'],
    seasons: ['fall'], venues: ['barn', 'vineyard', 'forest'], feels: ['relaxed', 'romantic'],
  },
  {
    id: 'winter', name: 'Winter wonderland', blurb: 'Ice blue, silver and evergreen.',
    tip: 'Evergreen branches, pine cones and white flowers are easy to find in winter. Add velvet ribbon in your main colour for warmth.',
    palette: ['#C9DBE8', '#A9ADB1', '#1F2D4D', '#24402F', '#FFFFFF'], fourth: 'Greenery', metal: { name: 'Silver', hex: '#B4B7BA' },
    mixes: ['tonal', 'analogous'], starters: ['#C9DBE8', '#1F2D4D', '#24402F', '#6E1E2B', '#B7B4C8', '#A9ADB1'],
    seasons: ['winter'], venues: ['ballroom', 'forest', 'city'], feels: ['elegant'],
  },
  {
    id: 'vineyard', name: 'Tuscan vineyard', blurb: 'Wine, terracotta, olive and lavender.',
    tip: 'Olive branches, lemons and lavender make lovely, lasting centrepieces that suit this palette.',
    palette: ['#722F37', '#C0643F', '#A99BC4', '#77773C', '#F3E9D6'], fourth: 'Greenery', metal: { name: 'Gold', hex: '#C6A15B' },
    mixes: ['analogous', 'split'], starters: ['#722F37', '#C0643F', '#A99BC4', '#C08B80', '#C8902E', '#5C2E4F'],
    seasons: ['summer', 'fall'], venues: ['vineyard'], feels: ['romantic', 'relaxed', 'elegant'],
  },
  {
    id: 'pastel', name: 'Spring pastels', blurb: 'Lilac, butter yellow, mint and baby blue.',
    tip: 'Pastels can look washed out together. Give them one slightly deeper shade, or crisp white, so each one shows.',
    palette: ['#CDB5DD', '#F6E3A1', '#B9D3EC', '#C6E3D0', '#FFFFFF'], fourth: 'Soft tone', metal: { name: 'Gold', hex: '#C9A24B' },
    mixes: ['triad', 'analogous'], starters: ['#CDB5DD', '#F4C9CF', '#C6E3D0', '#B9D3EC', '#F6E3A1', '#F5C6A5'],
    seasons: ['spring'], venues: ['garden'], feels: ['fun', 'romantic'],
  },
  {
    id: 'mountain', name: 'Mountain lake', blurb: 'Slate blue, pine and a warm rust.',
    tip: 'Let the view lead. Colours taken from the landscape around you will always look right in your photos.',
    palette: ['#4F6680', '#A9BCCF', '#A9572F', '#2E4A3D', '#F2EEE6'], fourth: 'Greenery', metal: { name: 'Brass', hex: '#B5964D' },
    mixes: ['complementary', 'tonal'], starters: ['#4F6680', '#2E4A3D', '#A9572F', '#C8902E', '#6E1E2B', '#A291A8'],
    seasons: ['summer', 'fall', 'winter'], venues: ['forest', 'beach'], feels: ['relaxed'],
  },
  {
    id: 'industrial', name: 'Urban loft', blurb: 'Slate, cognac and eucalyptus, with copper.',
    tip: 'Brick, concrete and steel are already part of the look. Warm colours and candlelight keep a loft from feeling cold.',
    palette: ['#5F6B73', '#9A5B32', '#2F6B55', '#8FA89A', '#EFEAE3'], fourth: 'Greenery', metal: { name: 'Copper', hex: '#B87333' },
    mixes: ['complementary', 'analogous'], starters: ['#5F6B73', '#9A5B32', '#2F6B55', '#6E1E2B', '#4F6680', '#A9472A'],
    seasons: ['spring', 'summer', 'fall', 'winter'], venues: ['city'], feels: ['modern'],
  },
  {
    id: 'jewel', name: 'Jewel tones', blurb: 'Sapphire, emerald, amethyst and ruby.',
    tip: 'Jewel tones are rich, so they need a calm neutral. Ivory linens let each colour shine without competing.',
    palette: ['#1F3F8C', '#1C6B4E', '#7D5BA6', '#9B1B30', '#F6F0E3'], fourth: 'Deep tone', metal: { name: 'Gold', hex: '#C9A24B' },
    mixes: ['triad', 'split'], starters: ['#1F3F8C', '#1C6B4E', '#7D5BA6', '#9B1B30', '#1F6F78', '#D4892A'],
    seasons: ['fall', 'winter'], venues: ['ballroom', 'city'], feels: ['elegant', 'moody', 'fun'],
  },
  {
    id: 'mediterranean', name: 'Mediterranean', blurb: 'Cobalt, lemon and terracotta on whitewash.',
    tip: 'Lemons, olive branches and blue-and-white ceramics make easy, affordable centrepieces for this palette.',
    palette: ['#1F4FA8', '#F2D84B', '#C0643F', '#7D8045', '#FFFFFF'], fourth: 'Greenery', metal: { name: 'Brass', hex: '#B5964D' },
    mixes: ['complementary', 'split'], starters: ['#1F4FA8', '#3D7CC9', '#F2D84B', '#C0643F', '#C2347A', '#7D8045'],
    seasons: ['summer'], venues: ['beach', 'vineyard'], feels: ['fun', 'relaxed'],
  },
];

export const ROLES = [
  { label: 'Main colour', use: 'Wedding party, flowers, invitations' },
  { label: 'Second colour', use: 'Flowers, ties, table details' },
  { label: 'Accent', use: 'Small touches: ribbons, cake, signage' },
  { label: '', use: '' }, // the style's fourth: see FOURTH_USES
  { label: 'Neutral', use: 'Linens, paper, backdrops' },
] as const;

export const FOURTH_USES: Record<PaletteStyle['fourth'], string> = {
  Greenery: 'Foliage, garlands, table runners',
  'Earth tone': 'Wood, textures, napkins',
  'Deep tone': 'Velvet, candles, a few blooms',
  'Soft tone': 'Ribbons, napkins, paper details',
};

// How well each style fits the couple's answers; unanswered questions count
// for nothing. The feel matters most, then the venue, then the season.
export function suggestStyles(season: Season | null, venue: Venue | null, feel: Feel | null, count = 3): PaletteStyle[] {
  if (!season && !venue && !feel) return [];
  const score = (s: PaletteStyle) =>
    (feel && s.feels.includes(feel) ? 3 : 0) + (venue && s.venues.includes(venue) ? 2 : 0) + (season && s.seasons.includes(season) ? 1 : 0);
  return PALETTE_STYLES.map((s, i) => ({ s, i, score: score(s) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, count)
    .map((x) => x.s);
}

// --- Colour maths, in OKLab/OKLCH (perceptually even, so turning the hue
// keeps a colour's lightness).

type Lch = { l: number; c: number; h: number };

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const fromLinear = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

export function normalizeHex(hex: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, (x) => x + x) : m[1];
  return `#${h.toUpperCase()}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255) as [number, number, number];
}

function rgbToHex(rgb: [number, number, number]): string {
  return `#${rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

function toOklab(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToRgb(L: number, a: number, b: number): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

export function toLch(hex: string): Lch {
  const [l, a, b] = toOklab(hex);
  return { l, c: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 };
}

// Back to hex; a colour the screen can't show loses strength until it can.
export function fromLch({ l, c, h }: Lch): string {
  const L = Math.min(0.99, Math.max(0.05, l));
  const rad = (h * Math.PI) / 180;
  const inGamut = (rgb: number[]) => rgb.every((v) => v >= -0.001 && v <= 1.001);
  let rgb = oklabToRgb(L, c * Math.cos(rad), c * Math.sin(rad));
  if (!inGamut(rgb)) {
    let lo = 0, hi = c;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklabToRgb(L, mid * Math.cos(rad), mid * Math.sin(rad)))) lo = mid; else hi = mid;
    }
    rgb = oklabToRgb(L, lo * Math.cos(rad), lo * Math.sin(rad));
  }
  return rgbToHex(rgb as [number, number, number]);
}

// WCAG contrast ratio, for readable text on the invitation preview.
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

export function isDark(hex: string): boolean {
  return toLch(hex).l < 0.6;
}

// --- Building a palette.

const MIX_OFFSETS: Record<Mix, [number, number]> = {
  tonal: [12, 0],
  analogous: [32, -38],
  complementary: [28, 180],
  split: [150, -150],
  triad: [120, -120],
};

export type Palette = { colors: [string, string, string, string, string]; mix: Mix | null };

// The style's own palette.
export function stylePalette(style: PaletteStyle): Palette {
  return { colors: [...style.palette], mix: null };
}

// A palette for this style around `main`. jitter (0 for none) nudges the
// hues and lightness a little, for "Try another mix".
export function buildPalette(style: PaletteStyle, main: string, mix: Mix, jitter = 0, locked: boolean[] = [], current?: string[]): Palette {
  const base = toLch(main);
  const ref = style.palette.map(toLch);
  const out = [...style.palette] as Palette['colors'];
  out[0] = main;
  // A grey, black or white main colour has no hue to build from: keep the
  // style's own colours around it.
  if (base.c >= 0.035) {
    const [o2, o3] = MIX_OFFSETS[mix];
    const j = () => (Math.random() * 2 - 1) * jitter;
    out[1] = fromLch({ l: ref[1].l + j() * 0.004, c: Math.max(ref[1].c, 0.02), h: base.h + o2 + j() });
    if (mix === 'tonal') {
      // A deeper or lighter shade of the main colour, as far from it as the
      // style's accent is from its main.
      const dl = ref[2].l - ref[0].l;
      const l = Math.abs(dl) < 0.15 ? base.l + (base.l > 0.55 ? -0.3 : 0.3) : base.l + dl;
      out[2] = fromLch({ l: l + j() * 0.003, c: Math.min(base.c, Math.max(ref[2].c, 0.04)), h: base.h + j() });
    } else {
      out[2] = fromLch({ l: ref[2].l + j() * 0.004, c: Math.max(ref[2].c, 0.05), h: base.h + o3 + j() });
    }
    // A deep or soft tone (not greenery or earth) follows the main colour too.
    if (style.fourth === 'Deep tone' || style.fourth === 'Soft tone') {
      out[3] = fromLch({ l: ref[3].l, c: ref[3].c, h: base.h + (mix === 'tonal' ? -20 : 90) + j() });
    }
  }
  if (current) for (let i = 0; i < 5; i++) if (locked[i] && current[i]) out[i] = current[i];
  return { colors: out, mix };
}

// When the main colour is much brighter than the style usually is, a
// softer version at the style's own strength.
export function softerVersion(style: PaletteStyle, main: string): string | null {
  const m = toLch(main), ref = toLch(style.palette[0]);
  if (m.c < 0.12 || m.c < ref.c * 1.6) return null;
  return fromLch({ l: (m.l + ref.l) / 2, c: Math.max(ref.c, 0.06), h: m.h });
}

// --- Colour names: the nearest wedding-friendly name.

const NAMES: [string, string][] = [
  ['White', '#FFFFFF'], ['Ivory', '#F6F1E4'], ['Cream', '#F3EAD3'], ['Champagne', '#E6D3B1'], ['Linen', '#EFE6D8'],
  ['Oat', '#DCCDB5'], ['Sand', '#D8C3A0'], ['Taupe', '#B3A28F'], ['Greige', '#BFB6AC'], ['Mushroom', '#A39383'],
  ['Stone', '#8E8A80'], ['Dove grey', '#C9C8C3'], ['Silver grey', '#A9ADB1'], ['Slate', '#5F6B73'], ['Charcoal', '#36393D'],
  ['Black', '#1A1A1A'], ['Mocha', '#7A5C4A'], ['Chocolate', '#4E3326'], ['Cognac', '#9A5B32'], ['Camel', '#C19A6B'],
  ['Caramel', '#B9783F'], ['Burlap', '#C2A27E'], ['Bark', '#6B4E3B'],
  ['Petal pink', '#F7DDE0'], ['Blush', '#F0CFC7'], ['Ballet pink', '#F4C9CF'], ['Dusty rose', '#C99A93'], ['Antique rose', '#B9837D'],
  ['Rose', '#D97A86'], ['Peony pink', '#E8A0B4'], ['Mauve', '#A9798A'], ['Dusty mauve', '#B48C98'], ['Fuchsia', '#C42D7A'],
  ['Hot pink', '#E84393'], ['Raspberry', '#B5305A'], ['Desert rose', '#C08B80'], ['Dusty pink', '#D8A79A'],
  ['Burgundy', '#6E1E2B'], ['Merlot', '#5A1A26'], ['Wine', '#722F37'], ['Ruby', '#9B1B30'], ['Cranberry', '#9E2B3A'],
  ['Cherry red', '#B3202E'], ['Poppy', '#E0674F'], ['Marsala', '#964F4C'],
  ['Terracotta', '#C0643F'], ['Rust', '#A9472A'], ['Burnt orange', '#C4562A'], ['Apricot', '#F2B98B'], ['Peach', '#F5C6A5'],
  ['Coral', '#F07E6E'], ['Tangerine', '#F28C28'], ['Pumpkin', '#D6762E'], ['Cinnamon', '#A65A2E'], ['Clay', '#B87D62'],
  ['Buttercup', '#F3D35B'], ['Butter yellow', '#F6E3A1'], ['Mustard', '#D1A12D'], ['Marigold', '#E9A531'], ['Ochre', '#C8902E'],
  ['Lemon', '#F2D84B'], ['Honey', '#D9A54A'], ['Gold', '#C9A24B'],
  ['Sage', '#A3B19B'], ['Eucalyptus', '#8FA89A'], ['Mint', '#C6E3D0'], ['Seafoam', '#A8D5C2'], ['Pistachio', '#C3D3A1'],
  ['Olive', '#77773C'], ['Moss', '#7B8450'], ['Fern', '#5E7F4A'], ['Meadow green', '#7FA35B'], ['Palm green', '#2F7A4C'],
  ['Emerald', '#1C6B4E'], ['Hunter green', '#2D4B37'], ['Forest green', '#2F4A38'], ['Evergreen', '#24402F'], ['Pine', '#2E4A3D'],
  ['Juniper', '#4A6A5C'], ['Bottle green', '#0F4D3A'], ['Laurel', '#8A9A6F'],
  ['Baby blue', '#C9DDF0'], ['Powder blue', '#B5CDE3'], ['Dusty blue', '#8DA4BB'], ['Cornflower', '#7F8FC9'], ['French blue', '#5A7FB5'],
  ['Slate blue', '#4F6680'], ['Steel blue', '#4A6A8A'], ['Cobalt', '#1F4FA8'], ['Sapphire', '#1F3F8C'], ['Navy', '#1F2D4D'],
  ['Midnight blue', '#18223A'], ['Teal', '#1F6F78'], ['Muted teal', '#5E8C88'], ['Aqua', '#7FCFCF'], ['Turquoise', '#34B3B0'],
  ['Ice blue', '#C9DBE8'], ['Denim', '#4F6D8F'], ['Periwinkle', '#9AA6E0'], ['Sea blue', '#6E9CBF'], ['Azure', '#3D7CC9'],
  ['Lavender', '#B9A9D6'], ['Lilac', '#CDB5DD'], ['Wisteria', '#A58BC7'], ['Amethyst', '#7D5BA6'], ['Plum', '#5C2E4F'],
  ['Aubergine', '#3F2238'], ['Orchid', '#B865A8'], ['Heather', '#A291A8'], ['Violet', '#6A4C93'], ['Mulberry', '#6B2D4E'],
  ['Bougainvillea', '#C2347A'], ['Lavender grey', '#B7B4C8'],
];

const NAME_LAB = NAMES.map(([name, hex]) => ({ name, lab: toOklab(hex) }));

export function colourName(hex: string): string {
  const [l, a, b] = toOklab(hex);
  let best = NAME_LAB[0], bestD = Infinity;
  for (const n of NAME_LAB) {
    // Hue and strength count for more than lightness: a light mauve is
    // still a mauve, not a grey of the same lightness.
    const d = (n.lab[0] - l) ** 2 + 4 * ((n.lab[1] - a) ** 2 + (n.lab[2] - b) ** 2);
    if (d < bestD) { bestD = d; best = n; }
  }
  return best.name;
}
