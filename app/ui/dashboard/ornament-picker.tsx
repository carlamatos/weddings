'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ORNAMENTS,
  ORNAMENT_OCCASIONS,
  findOrnament,
  ornamentSvg,
  type Ornament,
  type OrnamentKind,
  type OrnamentOccasion,
} from '@/app/lib/invitation-ornaments';

// Invitations → Decorations: one row per kind (divider, frame). The button
// shows what's on the card (or an example when nothing is) and opens a
// popup of every design, grouped by occasion with the theme's first. Below
// it, the theme's colours and any colour.

const COPY: Record<OrnamentKind, { title: string; choose: string; change: string; none: string; remove: string; intro: string }> = {
  divider: {
    title: 'Divider',
    choose: 'Add a divider',
    change: 'Change divider',
    none: 'No divider',
    remove: 'Remove divider',
    intro: 'A decoration under the event name, in place of the plain line.',
  },
  frame: {
    title: 'Frame',
    choose: 'Add a frame',
    change: 'Change frame',
    none: 'No frame',
    remove: 'Remove frame',
    intro: 'A decorative border around the edge of your invitation.',
  },
};

const btn: React.CSSProperties = { padding: '8px 14px', borderRadius: 8, border: '1px solid #DDD5CE', background: '#fff', color: '#241F2B', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };

function Preview({ kind, ornament, color, background, faded }: { kind: OrnamentKind; ornament: Ornament; color: string; background: string; faded?: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={kind === 'frame'
        ? { width: '100%', aspectRatio: '5 / 7', background, color, borderRadius: 3, opacity: faded ? 0.45 : 1 }
        : { width: '100%', background, color, padding: '10% 8%', boxSizing: 'border-box', borderRadius: 3, opacity: faded ? 0.45 : 1 }}
      dangerouslySetInnerHTML={{ __html: ornamentSvg(kind, ornament) }}
    />
  );
}

export function OrnamentField({
  kind,
  value,
  color,
  palette,
  occasion,
  background,
  onChange,
  onColor,
}: {
  kind: OrnamentKind;
  value: string;
  color: string;
  palette: string[];
  occasion: OrnamentOccasion;
  background: string; // the card's colour, behind the previews
  onChange: (id: string) => void;
  onColor: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const t = COPY[kind];
  const current = findOrnament(kind, value);
  const example = current ?? ORNAMENTS[kind].find((o) => o.occasion === occasion) ?? ORNAMENTS[kind][0];
  const id = `inv-${kind}`;

  return (
    <div style={{ marginTop: kind === 'frame' ? 18 : 4 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#6B6470', margin: '0 0 4px' }}>{t.title}</p>
      <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 10px', lineHeight: 1.5 }}>{t.intro}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          style={{ ...btn, display: 'flex', alignItems: 'center', gap: 10, padding: 6, paddingRight: 14 }}
        >
          <span style={{ width: kind === 'frame' ? 40 : 84, flex: 'none', border: '1px solid #EDE8E3', borderRadius: 4, overflow: 'hidden' }}>
            <Preview kind={kind} ornament={example} color={current ? color : '#9A8F8C'} background={current ? background : '#FAF8F6'} faded={!current} />
          </span>
          <span>{current ? `${t.change} · ${current.name}` : t.choose}</span>
        </button>
        {current && (
          <button type="button" style={{ ...btn, border: 'none', background: 'transparent', color: '#B6584A', padding: '8px 4px' }} onClick={() => onChange('')}>
            {t.remove}
          </button>
        )}
      </div>

      {current && (
        <div style={{ marginTop: 12 }}>
          <p id={`${id}-colours`} style={{ fontSize: 12, fontWeight: 600, color: '#6B6470', margin: '0 0 6px' }}>{t.title} colour</p>
          <div role="radiogroup" aria-labelledby={`${id}-colours`} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {palette.map((c) => {
              const on = c.toUpperCase() === color.toUpperCase();
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={c}
                  title={c}
                  onClick={() => onColor(c)}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', padding: 0, border: '1px solid rgba(36,31,43,0.18)', boxShadow: on ? '0 0 0 2px #fff, 0 0 0 4px #241F2B' : 'none' }}
                />
              );
            })}
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#241F2B', marginLeft: 4, cursor: 'pointer' }}>
              <input type="color" value={color} onChange={(e) => onColor(e.target.value)} style={{ width: 34, height: 28, border: '1px solid #EDE8E3', borderRadius: 6, padding: 2, background: '#fff', cursor: 'pointer' }} />
              Any colour
            </label>
          </div>
        </div>
      )}

      {open && (
        <OrnamentDialog
          kind={kind}
          value={value}
          color={color}
          occasion={occasion}
          background={background}
          onPick={(v) => { onChange(v); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function OrnamentDialog({
  kind,
  value,
  color,
  occasion,
  background,
  onPick,
  onClose,
}: {
  kind: OrnamentKind;
  value: string;
  color: string;
  occasion: OrnamentOccasion;
  background: string;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const t = COPY[kind];
  const current = findOrnament(kind, value);
  const tabs = [...ORNAMENT_OCCASIONS].sort((a, b) => Number(b.key === occasion) - Number(a.key === occasion));
  const [tab, setTab] = useState<OrnamentOccasion>(current?.occasion ?? occasion);
  const dialogRef = useRef<HTMLDivElement>(null);
  const items = ORNAMENTS[kind].filter((o) => o.occasion === tab);

  useEffect(() => {
    const root = dialogRef.current;
    (root?.querySelector<HTMLButtonElement>('[data-tile][aria-pressed="true"]') ?? root?.querySelector<HTMLButtonElement>('[data-tile]'))?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const tile = (on: boolean): React.CSSProperties => ({
    display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch', padding: 8, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
    background: '#fff', border: on ? '2px solid #B6584A' : '1px solid #EDE8E3', margin: on ? 0 : 1, fontSize: 13, color: '#241F2B', textAlign: 'center',
  });

  return createPortal(
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`ornament-${kind}-title`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 760, maxHeight: '88vh', overflowY: 'auto', padding: '26px 24px' }}
      >
        <button className="profile-modal-close" onClick={onClose} aria-label="Close">×</button>
        <h2 id={`ornament-${kind}-title`} style={{ marginBottom: 6 }}>{current ? t.change : t.choose}</h2>
        <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 16px', lineHeight: 1.5 }}>{t.intro} You can change its colour after choosing.</p>

        <div role="tablist" aria-label="Occasion" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {tabs.map((o) => (
            <button
              key={o.key}
              type="button"
              role="tab"
              aria-selected={tab === o.key}
              onClick={() => setTab(o.key)}
              style={{ ...btn, padding: '6px 14px', borderRadius: 999, fontSize: 13, ...(tab === o.key ? { background: '#241F2B', color: '#fff', borderColor: '#241F2B' } : {}) }}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${kind === 'frame' ? 130 : 200}px, 1fr))`, gap: 12 }}>
          <button type="button" data-tile aria-pressed={!current} style={tile(!current)} onClick={() => onPick('')}>
            <div style={{ flex: 1, minHeight: kind === 'frame' ? 120 : 52, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F6', borderRadius: 3, color: '#9A8F8C', fontSize: 22 }} aria-hidden="true">⌀</div>
            {t.none}
          </button>
          {items.map((o) => (
            <button key={o.id} type="button" data-tile aria-pressed={o.id === value} style={tile(o.id === value)} onClick={() => onPick(o.id)}>
              <Preview kind={kind} ornament={o} color={color} background={background} />
              {o.name}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
