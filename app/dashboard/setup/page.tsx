import SubscribeForm from "@/app/ui/subscribe-form";
import { auth } from "@/auth";

export default async function Page() {
    const session = await auth();

    return (
        <main className='p-6'>
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1">
                <SubscribeForm />
            </div>

        </main>
    )
}