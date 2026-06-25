import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { fetchUserPageById } from '@/app/lib/data';
import SubscribeForm from "@/app/ui/subscribe-form";
import { greatVibes } from '@/app/ui/fonts';
import Link from 'next/link';
import '@/app/ui/auth.css';

export default async function Page() {
    const session = await auth();
    const userId = session?.user?.id;

    if (userId) {
        const userPage = await fetchUserPageById(userId);
        if (userPage) redirect('/dashboard');
    }

    return (
        <main className={`auth-page ${greatVibes.variable}`} style={{ justifyContent: 'flex-start', paddingTop: '48px', paddingBottom: '48px' }}>
            <Link href="/" className="auth-wordmark">
                My<span className="accent">Gala</span>
            </Link>
            <SubscribeForm />
        </main>
    )
}