import Link from 'next/link';
import { ADMIN_PAGE_SIZE } from '@/app/lib/admin-data';
import { buttonBase, c } from './styles';

export function parseOffset(raw: string | string[] | undefined): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

export default function Pagination({
  path,
  params,
  offset,
  hasMore,
  pageSize = ADMIN_PAGE_SIZE,
}: {
  path: string;
  params: Record<string, string>;
  offset: number;
  hasMore: boolean;
  pageSize?: number; // rows per page (default ADMIN_PAGE_SIZE)
}) {
  if (offset === 0 && !hasMore) return null;

  const href = (o: number) => {
    const sp = new URLSearchParams(params);
    if (o > 0) sp.set('offset', String(o));
    const qs = sp.toString();
    return qs ? `${path}?${qs}` : path;
  };

  const link = { ...buttonBase, textDecoration: 'none', display: 'inline-block' };
  const off = { ...link, opacity: 0.4, pointerEvents: 'none' as const };

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16, fontSize: 12, color: c.soft }}>
      {offset > 0 ? (
        <Link href={href(Math.max(0, offset - pageSize))} style={link}>← Previous</Link>
      ) : (
        <span style={off}>← Previous</span>
      )}
      <span>Page {Math.floor(offset / pageSize) + 1}</span>
      {hasMore ? (
        <Link href={href(offset + pageSize)} style={link}>Next →</Link>
      ) : (
        <span style={off}>Next →</span>
      )}
    </div>
  );
}
