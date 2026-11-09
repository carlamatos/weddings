import Link from 'next/link';
import { auth } from '@/auth';
import { fetchPageQuota, hasPrepaidPlus } from '@/app/lib/data';
import SubscribeForm from "@/app/ui/subscribe-form";
import ResendVerificationButton from '@/app/ui/dashboard/resend-verification-button';
import { greatVibes } from '@/app/ui/fonts';
import '@/app/ui/auth.css';
import { parseStartParams } from '@/app/lib/start-intent';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
import { fill } from '@/app/lib/dash-text/fill';
export const metadata: Metadata = { title: 'Create an event page' };

// Create an event page: one short form (app/ui/subscribe-form.tsx) — the
// rest is filled in afterwards on the page.
// A signed-in host coming from /design-your-invitation brings the theme,
// name and date chosen there in the address (app/lib/start-intent.ts).
export default async function Page({ searchParams }: { searchParams: Promise<{ start?: string; theme?: string; occasion?: string; name?: string; date?: string }> }) {
  const d = await getDashText();
    const params = await searchParams;
    const start = parseStartParams(params.start, params.theme, params.occasion, { name: params.name, date: params.date });
    const session = await auth();
    const userId = session?.user?.id;

    const [quota, prepaid] = userId
        ? await Promise.all([fetchPageQuota(userId), hasPrepaidPlus(userId)])
        : [{ count: 0, limit: 1 }, false];

    return (
        <div className={greatVibes.variable} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingTop: '16px', paddingBottom: '48px' }}>
            {quota.count > 0 && (
                <div style={{ width: '100%', maxWidth: 1180, marginBottom: 12 }}>
                    <Link href="/dashboard" style={{ fontSize: 14, color: '#6B6470', textDecoration: 'none' }}>{d.shellSetup.eventPages}</Link>
                </div>
            )}
            {!session?.user?.verifiedEmail && quota.count >= 1 ? (
                <div style={{ maxWidth: 520, textAlign: 'center', fontFamily: 'system-ui, sans-serif', padding: '40px 24px' }}>
                    <p style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', margin: '0 0 10px' }}>{d.shellSetup.verifyYourEmailToCreate}</p>
                    <p style={{ fontSize: 14, color: '#6B6470', margin: '0 0 18px', lineHeight: 1.6 }}>
                        {d.shellSetup.untilYourEmailIsVerified} {session?.user?.email ?? d.shellSetup.yourEmailAddress} {d.shellSetup.thenYouCanCreateMore}
                    </p>
                    <ResendVerificationButton />
                </div>
            ) : quota.count >= quota.limit ? (
                <div style={{ maxWidth: 520, textAlign: 'center', fontFamily: 'system-ui, sans-serif', padding: '40px 24px' }}>
                    <p style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', margin: '0 0 10px' }}>{fill(d.shellSetup.youVeReachedEventPages, { limit: quota.limit })}</p>
                    <p style={{ fontSize: 14, color: '#6B6470', margin: 0, lineHeight: 1.6 }}>
                        {d.shellSetup.thatSTheMostOne}
                    </p>
                </div>
            ) : (
                <SubscribeForm start={start} prepaid={prepaid} accountEmail={session?.user?.email ?? ''} />
            )}
        </div>
    );
}
