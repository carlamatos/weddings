import Link from 'next/link';
import { pagePath } from '@/app/lib/dashboard';
import { hasExpiredPlan } from '@/app/lib/plans';
import type { UserPage } from '@/app/lib/definitions';

// Shown in place of a Plus-only dashboard page for free (or lapsed) pages.
export function PlusUpgradePrompt({ page, title, pitch }: { page: UserPage; title: string; pitch: string }) {
  const expired = hasExpiredPlan(page);
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 520, padding: '60px 24px', textAlign: 'center', margin: '0 auto' }}>
      <p style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', marginBottom: 10 }}>{title}</p>
      <p style={{ fontSize: 14, color: '#6B6470', marginBottom: 24 }}>
        {expired ? `Your Plus term has ended. Extend to bring ${title} back.` : pitch}
      </p>
      <Link href={pagePath(page.id, '/domain')} style={{ display: 'inline-block', padding: '10px 24px', background: '#B6584A', color: '#fff', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
        {expired ? 'Extend Plus' : 'Upgrade to Plus'}
      </Link>
    </div>
  );
}
