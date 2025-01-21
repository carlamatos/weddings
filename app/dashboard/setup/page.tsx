import SubscribeForm from "@/app/ui/subscribe-form";


export default async function Page() {


    return (
        <main className='p-6'>
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1">
                <SubscribeForm />
            </div>

        </main>
    )
}