import { verifyUnsubscribe } from '@/app/lib/unsubscribe-token';
import { guestEventName, unsubscribeGuest } from '@/app/lib/unsubscribe';
import { isNewsletterSubscriber, unsubscribeFromNewsletter, verifyNewsletterUnsubscribe } from '@/app/lib/newsletter';
import { greatVibes } from '@/app/ui/fonts';
import '@/app/ui/auth.css';

export const metadata = { title: 'Unsubscribe', robots: { index: false, follow: false } };

// Linked from the footer of reminder emails (?g=<guest id>) and newsletter
// emails (?n=<email>). Asks for a click rather than
// unsubscribing on page load, so link-scanning mail filters can't do it.
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ g?: string; n?: string; t?: string; done?: string }> }) {
  const { g, n, t, done } = await searchParams;
  if (n !== undefined) return <NewsletterUnsubscribe n={n} t={t} done={!!done} />;
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

async function NewsletterUnsubscribe({ n, t, done }: { n: string; t?: string; done: boolean }) {
  const email = verifyNewsletterUnsubscribe(n, t ?? null);
  const subscribed = email ? await isNewsletterSubscriber(email) : false;

  async function confirm() {
    'use server';
    if (email) await unsubscribeFromNewsletter(email);
    const { redirect } = await import('next/navigation');
    redirect(`/unsubscribe?n=${encodeURIComponent(n)}&t=${t}&done=1`);
  }

  let body: React.ReactNode;
  if (!email) {
    body = <p className="auth-subheading">This unsubscribe link isn&apos;t valid anymore. If you keep getting emails you didn&apos;t ask for, write to us at info@mygala.ca and we&apos;ll sort it out.</p>;
  } else if (done || !subscribed) {
    body = <p className="auth-subheading"><strong>{email}</strong> won&apos;t receive the MyGala newsletter anymore.</p>;
  } else {
    body = (
      <>
        <p className="auth-subheading">Stop sending the MyGala newsletter to <strong>{email}</strong>?</p>
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
