import type { CSSProperties } from 'react';

// Same palette the dashboard pages use inline.
export const c = {
  ink: '#241F2B',
  soft: '#6B6470',
  muted: '#9A8F8C',
  line: '#EDE8E3',
  paper: '#FAF9F7',
  accent: '#B6584A',
  green: '#3D6B46',
  greenBg: '#EAF2EC',
  amber: '#8A6800',
  amberBg: '#FFF8E7',
  red: '#8B3A2A',
  redBg: '#FBEDEA',
  grey: '#6B6470',
  greyBg: '#F0EDE8',
};

export const tableWrap: CSSProperties = {
  background: '#fff',
  border: `1px solid ${c.line}`,
  borderRadius: 12,
  overflowX: 'auto',
};

export const table: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };

export const th: CSSProperties = {
  textAlign: 'left',
  padding: '10px 14px',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: c.muted,
  borderBottom: `1px solid ${c.line}`,
  background: c.paper,
  whiteSpace: 'nowrap',
};

export const td: CSSProperties = {
  padding: '12px 14px',
  borderBottom: `1px solid ${c.line}`,
  verticalAlign: 'top',
};

export const buttonBase: CSSProperties = {
  padding: '6px 12px',
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  background: '#fff',
  border: `1px solid ${c.line}`,
  color: c.ink,
};

export const dangerButton: CSSProperties = { ...buttonBase, color: c.red, borderColor: '#E0D5D0' };

export const disabledButton: CSSProperties = { ...buttonBase, opacity: 0.45, cursor: 'not-allowed' };

export const alertError: CSSProperties = {
  background: c.redBg,
  border: '1px solid #E8C9C2',
  color: c.red,
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 13,
  lineHeight: 1.5,
};

export const alertOk: CSSProperties = {
  background: c.greenBg,
  border: '1px solid #B2D4B8',
  color: c.green,
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 13,
  lineHeight: 1.5,
};
