'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { c } from './styles';

const links = [
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/trash', label: 'Trash' },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav style={{ display: 'flex', gap: 4, padding: '0 20px', borderBottom: `1px solid ${c.line}`, background: '#fff' }}>
      {links.map((l) => {
        const active = pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            style={{
              padding: '12px 16px',
              fontSize: 14,
              fontWeight: active ? 600 : 500,
              color: active ? c.ink : c.soft,
              textDecoration: 'none',
              borderBottom: `2px solid ${active ? c.accent : 'transparent'}`,
            }}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
