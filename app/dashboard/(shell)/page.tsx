import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { fetchUserPlan, listOwnedPages } from '@/app/lib/data';
import { pagePath } from '@/app/lib/dashboard';
import PlanPicker from '@/app/ui/dashboard/PlanPicker';

// /dashboard: no page -> plan picker / create-your-page, one page -> straight
// to it (the same experience single-page users always had), several -> a list.
export default async function DashboardIndex() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/login');

  const [pages, userPlan] = await Promise.all([listOwnedPages(userId), fetchUserPlan(userId)]);

  if (pages.length === 1) redirect(pagePath(pages[0].id));

  if (pages.length === 0) {
    if (userPlan?.plan_type === 'paid') {
      return (
        <div style={{ padding: '60px 24px', maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EAF2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>✓</div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#241F2B', margin: '0 0 10px' }}>Premium plan active</h1>
          <p style={{ fontSize: 14, color: '#6B6470', margin: '0 0 28px', lineHeight: 1.6 }}>
            Your payment was confirmed. Now let&apos;s create your wedding website.
          </p>
          <Link
            href="/dashboard/setup"
            style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 999, background: '#8c9eac', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
          >
            Create your event page →
          </Link>
        </div>
      );
    }
    return <PlanPicker />;
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Your pages</h1>
      <p style={{ fontSize: 14, color: '#6B6470', margin: '0 0 24px' }}>Choose a page to edit.</p>
      <div style={{ display: 'grid', gap: 12 }}>
        {pages.map((p) => (
          <Link
            key={p.id}
            href={pagePath(p.id)}
            style={{ display: 'block', padding: '16px 20px', background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, textDecoration: 'none', color: '#241F2B' }}
          >
            <div style={{ fontWeight: 600 }}>{p.heading || 'Untitled'}</div>
            <div style={{ fontSize: 13, color: '#6B6470' }}>/{p.slug}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
