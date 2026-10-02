import Link from 'next/link';
import { auth } from '@/auth';
import { fetchPageQuota, hasPrepaidPlus } from '@/app/lib/data';
import SubscribeForm from "@/app/ui/subscribe-form";
import { greatVibes } from '@/app/ui/fonts';
import '@/app/ui/auth.css';

// Create an event page. Every new event goes through the full setup — type,
// name, dates, location, theme, address and its own Free/Plus choice.
export default async function Page() {
    const session = await auth();
    const userId = session?.user?.id;

    const [quota, prepaid] = userId
        ? await Promise.all([fetchPageQuota(userId), hasPrepaidPlus(userId)])
        : [{ count: 0, limit: 1 }, false];

    return (
        <div className={greatVibes.variable} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingTop: '16px', paddingBottom: '48px' }}>
            {quota.count > 0 && (
                <div style={{ width: '100%', maxWidth: 620, marginBottom: 12 }}>
                    <Link href="/dashboard" style={{ fontSize: 14, color: '#6B6470', textDecoration: 'none' }}>← Event pages</Link>
                </div>
            )}
            {quota.count >= quota.limit ? (
                <div style={{ maxWidth: 520, textAlign: 'center', fontFamily: 'system-ui, sans-serif', padding: '40px 24px' }}>
                    <p style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', margin: '0 0 10px' }}>You&rsquo;ve reached {quota.limit} event pages</p>
                    <p style={{ fontSize: 14, color: '#6B6470', margin: 0, lineHeight: 1.6 }}>
                        That&rsquo;s the most one account can have — contact us at info@mygala.ca if you need more.
                    </p>
                </div>
            ) : (
                <SubscribeForm prepaid={prepaid} />
            )}
        </div>
    );
}
