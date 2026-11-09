import Link from 'next/link';

// The "Page not found" message: for addresses that match no page
// (app/global-not-found.tsx) and for pages that call notFound()
// (app/(site)/not-found.tsx).
export function NotFoundContent() {
  return (
    <main className="mk-hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="wrap" style={{ textAlign: 'center' }}>
        <Link href="/" className="wordmark" style={{ fontSize: 44 }}>My<span className="accent">Gala</span></Link>
        <h1 className="mk-h1" style={{ marginTop: 24 }}>Page not found</h1>
        <p className="mk-lead" style={{ margin: '0 auto 28px' }}>This page doesn’t exist, or it has moved.</p>
        <p style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-primary">Go to the home page</Link>
          <Link href="/features/event-templates" className="ilp-link">See the themes</Link>
        </p>
      </div>
    </main>
  );
}
