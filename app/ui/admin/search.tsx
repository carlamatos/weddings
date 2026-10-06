import Link from 'next/link';
import { ADMIN_SEARCH_MAX } from '@/app/lib/admin-data';
import { buttonBase, c } from './styles';

// Search box for an admin table: a plain GET form, so the results page can be
// bookmarked and paginated (the term travels as ?q=).
export default function AdminSearch({ path, value, placeholder }: { path: string; value: string; placeholder: string }) {
  return (
    <form method="get" action={path} role="search" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
      <input
        type="search"
        name="q"
        defaultValue={value}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={ADMIN_SEARCH_MAX}
        style={searchInput}
      />
      <button type="submit" style={{ ...buttonBase, padding: '8px 16px', background: c.ink, color: '#fff' }}>Search</button>
      {value && <Link href={path} style={{ fontSize: 12, color: c.soft }}>Clear</Link>}
    </form>
  );
}

export const searchInput: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 8,
  border: `1px solid ${c.line}`,
  background: '#fff',
  fontSize: 13,
  color: c.ink,
  width: 320,
  maxWidth: '100%',
};
