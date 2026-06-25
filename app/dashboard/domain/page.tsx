import { auth } from '@/auth';
import { fetchUserPageById } from '@/app/lib/data';
import DomainForm from './DomainForm';

export default async function DomainPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const userPage = userId ? await fetchUserPageById(userId) : undefined;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 640 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Custom Domain</h1>
      <p style={{ fontSize: 14, color: '#6B6470', margin: '0 0 32px' }}>
        Point your own domain to your event page. Guests will see your domain instead of mygala.ca.
      </p>
      <DomainForm initialDomain={userPage?.custom_domain ?? null} isPaid={userPage?.plan_type === 'paid'} />
      <div style={{ marginTop: 36, padding: '16px 20px', background: '#F5F3F0', borderRadius: 10, fontSize: 13, color: '#6B6470', lineHeight: 1.6 }}>
        <strong style={{ color: '#241F2B' }}>How it works:</strong> After adding your domain and configuring DNS,
        visitors who go to your domain will see your event page. Vercel provisions SSL within minutes of DNS verification.
      </div>
      {userPage?.plan_type !== 'paid' && (
        <button style={{
          marginTop: 20, padding: '11px 28px', borderRadius: 8, border: 'none',
          background: '#B6584A', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          Upgrade
        </button>
      )}
    </div>
  );
}
