import Link from 'next/link';
import { Mascot } from '@/app/ui/mascot';

// The "Page not found" message: for addresses that match no page
// (app/global-not-found.tsx) and for pages that call notFound()
// (app/(site)/not-found.tsx). Glo the firefly, a little lost, lights the
// way back (app/ui/mascot.tsx).
export function NotFoundContent() {
  return (
    <main className="mk-hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="wrap" style={{ textAlign: 'center' }}>
        <Link href="/" className="wordmark" style={{ fontSize: 44 }}>My<span className="accent">Gala</span></Link>
        <Mascot pose="glo-lost" size={190} eager style={{ display: 'block', margin: '18px auto -6px', maxWidth: '52vw', height: 'auto' }} />
        <h1 className="mk-h1" style={{ marginTop: 8 }}>Page not found</h1>
        <p className="mk-lead" style={{ margin: '0 auto 28px' }}>Glo looked everywhere with its little lantern, but this page doesn’t exist, or it has moved. Let it light your way back.</p>
        <p style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-primary">Go to the home page</Link>
          <Link href="/features/event-templates" className="ilp-link">See the themes</Link>
        </p>
      </div>
    </main>
  );
}
