import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { fetchUserPageById } from '@/app/lib/data';
import SubscribeForm from "@/app/ui/subscribe-form";

export default async function Page() {
    const session = await auth();
    const userId = session?.user?.id;

    if (userId) {
        const userPage = await fetchUserPageById(userId);
        if (userPage) redirect('/dashboard');
    }

    return (
        <main className='p-6'>
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1">
                <SubscribeForm />
            </div>
        </main>
    )
}