import { verifyUnsubscribe } from '@/app/lib/unsubscribe-token';
import { guestEventName, unsubscribeGuest } from '@/app/lib/unsubscribe';
import { greatVibes } from '@/app/ui/fonts';
import '@/app/ui/auth.css';

export const metadata = { title: 'Unsubscribe', robots: { index: false, follow: false } };

// Linked from the footer of reminder emails. Asks for a click rather than
// unsubscribing on page load, so link-scanning mail filters can't do it.
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ g?: string; t?: string; done?: string }> }) {
  const { g, t, done } = await searchParams;
  const guestId = verifyUnsubscribe(g ?? null, t ?? null);
  const guest = guestId ? await guestEventName(guestId) : null;

  async function confirm() {
    'use server';
    if (guestId) await unsubscribeGuest(guestId);
    const { redirect } = await import('next/navigation');
    redirect(`/unsubscribe?g=${g}&t=${t}&done=1`);
  }

  let body: React.ReactNode;
  if (!guest) {
    body = <p className="auth-subheading">This unsubscribe link isn&apos;t valid anymore. If you keep getting emails you didn&apos;t ask for, reply to one of them and we&apos;ll sort it out.</p>;
  } else if (done || !guest.subscribed) {
    body = <p className="auth-subheading">You won&apos;t receive any more emails about <strong>{guest.heading}</strong>.</p>;
  } else {
    body = (
      <>
        <p className="auth-subheading">Stop receiving reminder and update emails about <strong>{guest.heading}</strong>?</p>
        <form action={confirm}>
          <button className="auth-btn" type="submit">Unsubscribe</button>
        </form>
      </>
    );
  }

  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <div className="auth-card" style={{ maxWidth: 440, textAlign: 'center' }}>
        <p className="auth-wordmark">My<span className="accent">Gala</span></p>
        <h1 className="auth-heading">Email preferences</h1>
        {body}
      </div>
    </main>
  );
}
