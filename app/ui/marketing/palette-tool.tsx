'use client';

import { useEffect, useMemo, useState } from 'react';
import { LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';
import {
  FEELS, FOURTH_USES, MIX_LABELS, PALETTE_STYLES, ROLES, SEASONS, VENUES,
  buildPalette, colourName, contrast, isDark, normalizeHex, softerVersion, stylePalette, suggestStyles,
  type Feel, type Palette, type PaletteStyle, type Season, type Venue,
} from '@/app/lib/marketing/wedding-palettes';

// The wedding colour palette tool in the colour palette guide: three
// optional questions suggest a style, the couple picks a style and a main
// colour, and the tool builds the rest of the palette around it (see
// app/lib/marketing/wedding-palettes.ts), with a preview on an invitation
// and the wedding party. A palette can be shared with a link
// (#palette=style.HEX-HEX-HEX-HEX-HEX).

const DEFAULT_STYLE = PALETTE_STYLES[0];

function Chips<T extends string>({ label, options, value, onChange }: {
  label: string; options: { id: T; label: string }[]; value: T | null; onChange: (v: T | null) => void;
}) {
  return (
    <fieldset className="pt-question">
      <legend>{label}</legend>
      <div className="pt-chips">
        {options.map((o) => (
          <button key={o.id} type="button" className="pt-chip" aria-pressed={value === o.id}
            onClick={() => onChange(value === o.id ? null : o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Strip({ colors }: { colors: readonly string[] }) {
  return (
    <span className="pt-strip" aria-hidden="true">
      {colors.map((c, i) => <span key={i} style={{ background: c }} />)}
    </span>
  );
}

function Flower({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  const centre = isDark(color) ? '#F3E6C8' : '#7A5C4A';
  return (
    <g>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i * Math.PI) / 3;
        // Rounded, so the server and the browser draw the same numbers.
        const at = (v: number) => Math.round(v * 100) / 100;
        return <circle key={i} cx={at(x + Math.cos(a) * r * 0.55)} cy={at(y + Math.sin(a) * r * 0.55)} r={r * 0.5} fill={color} />;
      })}
      <circle cx={x} cy={y} r={r * 0.28} fill={centre} opacity={0.8} />
    </g>
  );
}

function Leaf({ x, y, angle, color }: { x: number; y: number; angle: number; color: string }) {
  return <ellipse cx={x} cy={y} rx={16} ry={6} fill={color} transform={`rotate(${angle} ${x} ${y})`} />;
}

// The palette on an invitation: names in the most readable colour, a posy
// of flowers in the main, second and accent colours, greenery in the fourth.
function InvitationPreview({ colors, metal, fourthIsGreen }: { colors: string[]; metal: string; fourthIsGreen: boolean }) {
  const [main, second, accent, fourth, neutral] = colors;
  const text = [accent, main, second, fourth].reduce(
    (best, c) => (contrast(c, neutral) > contrast(best, neutral) ? c : best),
    isDark(neutral) ? '#FFFFFF' : '#241F2B',
  );
  const ink = contrast(text, neutral) >= 4.5 ? text : isDark(neutral) ? '#FFFFFF' : '#241F2B';
  const leaf = fourthIsGreen ? fourth : '#8A9A6F';
  return (
    <svg viewBox="0 0 240 320" className="pt-invite" role="img" aria-label="Your palette on a wedding invitation">
      <rect x="0" y="0" width="240" height="320" rx="6" fill={neutral} />
      <rect x="12" y="12" width="216" height="296" rx="2" fill="none" stroke={metal} strokeWidth="1.5" />
      <g>
        <Leaf x={92} y={70} angle={-30} color={leaf} />
        <Leaf x={150} y={66} angle={25} color={leaf} />
        <Leaf x={120} y={44} angle={-80} color={leaf} />
        <Leaf x={78} y={92} angle={10} color={leaf} />
        <Leaf x={162} y={92} angle={-15} color={leaf} />
        <Flower x={104} y={78} r={20} color={main} />
        <Flower x={138} y={74} r={15} color={second} />
        <Flower x={124} y={100} r={10} color={accent} />
        {!fourthIsGreen && <Flower x={84} y={60} r={9} color={fourth} />}
      </g>
      <text x="120" y="150" textAnchor="middle" fontSize="8.5" letterSpacing="1.6" fill={ink} fontFamily="system-ui, sans-serif">TOGETHER WITH THEIR FAMILIES</text>
      <text x="120" y="190" textAnchor="middle" fontSize="28" fill={ink} fontFamily="Georgia, serif" fontStyle="italic">Emma &amp; Liam</text>
      <line x1="90" y1="208" x2="150" y2="208" stroke={metal} strokeWidth="1.2" />
      <text x="120" y="232" textAnchor="middle" fontSize="11" fill={ink} fontFamily="system-ui, sans-serif">SATURDAY, JUNE 12, 2027</text>
      <text x="120" y="250" textAnchor="middle" fontSize="10" fill={ink} opacity={0.8} fontFamily="system-ui, sans-serif">Four o’clock in the afternoon</text>
      <rect x="80" y="268" width="80" height="22" rx="11" fill={main} />
      <text x="120" y="283" textAnchor="middle" fontSize="9" letterSpacing="1.5" fill={isDark(main) ? '#FFFFFF' : '#241F2B'} fontFamily="system-ui, sans-serif">RSVP</text>
    </svg>
  );
}

const DRESS = 'M23 10 L21 30 Q20 42 23 54 L8 116 Q30 122 52 116 L37 54 Q40 42 39 30 L37 10 Q30 22 23 10 Z';

function PartyPreview({ colors }: { colors: string[] }) {
  const [main, second, accent] = colors;
  const dresses = [second, main, main, main, second];
  return (
    <svg viewBox="0 0 300 130" className="pt-party" role="img" aria-label="Your main and second colours on the wedding party">
      {dresses.map((c, i) => (
        <g key={i} transform={`translate(${i * 58 + 6} 4)`}>
          <path d={DRESS} fill={c} stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
          <rect x="22" y="52" width="16" height="3" rx="1.5" fill={accent} opacity={0.9} />
        </g>
      ))}
    </svg>
  );
}

const SHARES = [25, 15, 5, 10, 45]; // main, second, accent, fourth, neutral (%)

export default function PaletteTool() {
  const [season, setSeason] = useState<Season | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [feel, setFeel] = useState<Feel | null>(null);
  const [style, setStyle] = useState<PaletteStyle>(DEFAULT_STYLE);
  const [main, setMain] = useState(DEFAULT_STYLE.palette[0]);
  const [palette, setPalette] = useState<Palette>(() => stylePalette(DEFAULT_STYLE));
  const [locked, setLocked] = useState<boolean[]>([false, false, false, false, false]);
  const [mixIndex, setMixIndex] = useState(0);
  const [copied, setCopied] = useState<'colours' | 'link' | null>(null);

  const suggested = useMemo(() => suggestStyles(season, venue, feel), [season, venue, feel]);
  const softer = softerVersion(style, main);
  const colors = palette.colors;

  // A shared palette link opens with that palette.
  useEffect(() => {
    const m = /^#palette=([a-z-]+)\.((?:[0-9A-Fa-f]{6}-){4}[0-9A-Fa-f]{6})$/.exec(window.location.hash);
    const shared = m && PALETTE_STYLES.find((s) => s.id === m[1]);
    if (!m || !shared) return;
    const hexes = m[2].split('-').map((h) => normalizeHex(h)!);
    /* eslint-disable react-hooks/set-state-in-effect -- reading the URL once on load */
    setStyle(shared);
    setMain(hexes[0]);
    setPalette({ colors: hexes as Palette['colors'], mix: null });
    setLocked([true, true, true, true, true]);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function chooseStyle(s: PaletteStyle) {
    setStyle(s);
    setMain(s.palette[0]);
    setPalette(stylePalette(s));
    setLocked([false, false, false, false, false]);
    setMixIndex(0);
  }

  function chooseMain(hex: string) {
    setMain(hex);
    if (hex === style.palette[0] && !locked.some(Boolean)) {
      setPalette(stylePalette(style));
      return;
    }
    setPalette(buildPalette(style, hex, style.mixes[mixIndex % style.mixes.length], 0, locked, colors));
  }

  function tryAnother() {
    const next = mixIndex + 1;
    setMixIndex(next);
    setPalette(buildPalette(style, main, style.mixes[next % style.mixes.length], 10, locked, colors));
  }

  function editColour(i: number, hex: string) {
    if (i === 0) return chooseMain(hex.toUpperCase());
    const next = [...colors] as Palette['colors'];
    next[i] = hex.toUpperCase();
    setPalette({ ...palette, colors: next });
    setLocked((l) => l.map((v, j) => (j === i ? true : v)));
  }

  async function copy(kind: 'colours' | 'link') {
    const text = kind === 'colours'
      ? colors.map((c, i) => `${i === 3 ? style.fourth : ROLES[i].label}: ${colourName(c)} ${c}`).concat(`Metal: ${style.metal.name}`).join('\n')
      : `${window.location.origin}${window.location.pathname}#palette=${style.id}.${colors.map((c) => c.slice(1)).join('-')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard blocked: nothing to do.
    }
  }

  return (
    <div className="pt" id="palette-tool">
      <div className="pt-step">
        <p className="pt-step-title"><span>1</span> Tell us about your wedding <em>(optional)</em></p>
        <p className="pt-help">Three quick questions, and we’ll suggest the styles that suit it.</p>
        <Chips label="When is it?" options={SEASONS} value={season} onChange={setSeason} />
        <Chips label="Where is it?" options={VENUES} value={venue} onChange={setVenue} />
        <Chips label="How should it feel?" options={FEELS} value={feel} onChange={setFeel} />
        {suggested.length > 0 && (
          <div className="pt-suggest" aria-live="polite">
            <p>Suggested for you:</p>
            <div className="pt-suggest-list">
              {suggested.map((s) => (
                <button key={s.id} type="button" className="pt-suggest-card" aria-pressed={style.id === s.id} onClick={() => chooseStyle(s)}>
                  <Strip colors={s.palette} />
                  <strong>{s.name}</strong>
                  <span>{s.blurb}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-step">
        <p className="pt-step-title"><span>2</span> Choose a style</p>
        <div className="pt-styles">
          {PALETTE_STYLES.map((s) => (
            <button key={s.id} type="button" className="pt-style" aria-pressed={style.id === s.id} onClick={() => chooseStyle(s)}>
              <Strip colors={s.palette} />
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-step">
        <p className="pt-step-title"><span>3</span> Pick your main colour</p>
        <p className="pt-help">Start with a colour you love: a flower, the bridesmaid dresses, your venue. These suit {style.name.toLowerCase()}:</p>
        <div className="pt-starters">
          {style.starters.map((c) => (
            <button key={c} type="button" className="pt-starter" aria-pressed={main === c} onClick={() => chooseMain(c)}
              aria-label={`${colourName(c)} ${c}`} title={colourName(c)}>
              <span style={{ background: c }} />
              <small>{colourName(c)}</small>
            </button>
          ))}
          <label className="pt-starter pt-starter--custom" title="Any colour">
            <input type="color" value={main.toLowerCase()} onChange={(e) => chooseMain(e.target.value.toUpperCase())} />
            <span className="pt-custom-swatch" aria-hidden="true" />
            <small>Any colour</small>
          </label>
        </div>
        {softer && (
          <p className="pt-hint">
            This shade is brighter than most {style.name.toLowerCase()} palettes. It can work as a small accent, but as the main colour a softer version is easier to match.{' '}
            <button type="button" onClick={() => chooseMain(softer)}>
              <span style={{ background: softer }} aria-hidden="true" /> Try {colourName(softer).toLowerCase()} instead
            </button>
          </p>
        )}
      </div>

      <div className="pt-step pt-result">
        <p className="pt-step-title"><span>4</span> Your palette</p>
        <p className="pt-help">
          {palette.mix ? MIX_LABELS[palette.mix] : `The ${style.name.toLowerCase()} palette`}. Click a colour to change it, or lock the ones you love and try another mix.
        </p>
        <ul className="pt-swatches">
          {colors.map((c, i) => {
            const label = i === 3 ? style.fourth : ROLES[i].label;
            const use = i === 3 ? FOURTH_USES[style.fourth] : ROLES[i].use;
            return (
              <li key={i} className="pt-swatch">
                <label className="pt-swatch-colour" style={{ background: c, color: isDark(c) ? '#fff' : '#241F2B' }}>
                  <input type="color" value={c.toLowerCase()} onChange={(e) => editColour(i, e.target.value)} aria-label={`Change the ${label.toLowerCase()}`} />
                  <span className="pt-swatch-edit" aria-hidden="true">Change</span>
                </label>
                <div className="pt-swatch-text">
                  <span className="pt-swatch-role">{label}</span>
                  <strong>{colourName(c)}</strong>
                  <code>{c}</code>
                  <span className="pt-swatch-use">{use}</span>
                </div>
                <button type="button" className="pt-lock" aria-pressed={locked[i]} onClick={() => setLocked((l) => l.map((v, j) => (j === i ? !v : v)))}
                  aria-label={`${locked[i] ? 'Unlock' : 'Lock'} the ${label.toLowerCase()}`} title={locked[i] ? 'Locked' : 'Lock this colour'}>
                  {locked[i] ? <LockClosedIcon /> : <LockOpenIcon />}
                </button>
              </li>
            );
          })}
          <li className="pt-swatch pt-swatch--metal">
            <span className="pt-swatch-colour pt-metal" style={{ background: `linear-gradient(135deg, ${style.metal.hex}, #ffffffaa 45%, ${style.metal.hex} 70%)` }} />
            <div className="pt-swatch-text">
              <span className="pt-swatch-role">Metal</span>
              <strong>{style.metal.name}</strong>
              <span className="pt-swatch-use">Cutlery, candle holders, frames</span>
            </div>
          </li>
        </ul>

        <div className="pt-actions">
          <button type="button" className="pt-btn pt-btn--main" onClick={tryAnother}>Try another mix</button>
          <button type="button" className="pt-btn" onClick={() => copy('colours')}>{copied === 'colours' ? 'Copied!' : 'Copy colours'}</button>
          <button type="button" className="pt-btn" onClick={() => copy('link')}>{copied === 'link' ? 'Link copied!' : 'Copy link to this palette'}</button>
        </div>

        <div className="pt-share" aria-label="How much of each colour">
          <p className="pt-share-title">How much of each</p>
          <div className="pt-share-bar">
            {colors.map((c, i) => <span key={i} style={{ background: c, flexGrow: SHARES[i] }} title={`${colourName(c)}: about ${SHARES[i]}%`} />)}
          </div>
          <p className="pt-share-note">Mostly neutral, then your main colour, with the accent in small touches.</p>
        </div>

        <div className="pt-previews">
          <figure>
            <InvitationPreview colors={colors} metal={style.metal.hex} fourthIsGreen={style.fourth === 'Greenery'} />
            <figcaption>On your invitation</figcaption>
          </figure>
          <figure>
            <PartyPreview colors={colors} />
            <figcaption>On your wedding party</figcaption>
          </figure>
        </div>

        <p className="pt-tip"><strong>{style.name} tip:</strong> {style.tip}</p>
      </div>
    </div>
  );
}
