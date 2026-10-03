import type { Guest } from '@/app/lib/definitions';

// Shared look for the Guest List and Invitations screens.

export const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: '1px solid #DDD5CE', background: '#fff', color: '#241F2B', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', textDecoration: 'none' };
export const primary: React.CSSProperties = { ...btn, border: 'none', background: '#B6584A', color: '#fff' };
export const input: React.CSSProperties = { padding: '8px 10px', border: '1px solid #EDE8E3', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', color: '#241F2B', minWidth: 0 };
export const cell: React.CSSProperties = { padding: '11px 14px', borderBottom: '1px solid #F0ECE8', fontSize: 14, color: '#241F2B', textAlign: 'left', verticalAlign: 'top' };
export const headCell: React.CSSProperties = { ...cell, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470' };
export const card: React.CSSProperties = { background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: 22 };

export const STATUS: Record<Guest['status'], [string, React.CSSProperties]> = {
  attending: ['Attending', { background: '#EAF2EC', color: '#3D6B46' }],
  not_attending: ['Declining', { background: '#F5EDEA', color: '#8B3A2A' }],
  invited: ['Invited', { background: '#EEF0F8', color: '#4A5296' }],
};

export const statusPill: React.CSSProperties = { display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 };
