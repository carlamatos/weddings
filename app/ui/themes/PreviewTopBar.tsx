import Link from 'next/link';

// MyGala top bar (logo, login/dashboard) on live event pages. No
// "Back to themes" link here: guests and owners land on a real event page,
// not the theme showcase — that link lives only on the static
// public/themes/*.html previews the homepage links to.
export function PreviewTopBar({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        background: 'rgba(246,242,237,0.94)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #DCD3C5',
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      <Link
        href="/"
        style={{ fontFamily: "'Great Vibes', cursive", fontSize: 28, fontWeight: 400, color: '#241F2B', letterSpacing: 0.5, textDecoration: 'none', lineHeight: 1 }}
      >
        My<span style={{ color: '#B6584A' }}>Gala</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.3, padding: '8px 18px', borderRadius: 999, border: 'none', background: '#B6584A', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.3, padding: '8px 18px', borderRadius: 999, border: '1.5px solid #241F2B', background: 'transparent', color: '#241F2B', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Log in
            </Link>
            <Link
              href="/login"
              style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.3, padding: '8px 18px', borderRadius: 999, border: 'none', background: '#B6584A', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Start your event page
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
