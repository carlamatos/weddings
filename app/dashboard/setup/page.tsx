import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { fetchUserPageById } from '@/app/lib/data';
import SubscribeForm from "@/app/ui/subscribe-form";
import { greatVibes } from '@/app/ui/fonts';
import '@/app/ui/auth.css';

export default async function Page() {
    const session = await auth();
    const userId = session?.user?.id;

    if (userId) {
        const userPage = await fetchUserPageById(userId);
        if (userPage) redirect('/dashboard');
    }

    return (
        <div className={greatVibes.variable} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingTop: '16px', paddingBottom: '48px' }}>
            <SubscribeForm />
        </div>
    );
}
