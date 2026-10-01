import Link from 'next/link';

// MyGala top bar (logo, login/dashboard). Live event pages show it without
// the "Back to themes" link — guests land on a real event page, not the
// showcase; theme previews (/themes/<slug>) pass backToThemes.
export function PreviewTopBar({ isLoggedIn, backToThemes }: { isLoggedIn?: boolean; backToThemes?: boolean }) {
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
      <div className="mg-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {/* Phones show only "Log in" + "Sign up" (or "Dashboard"); "Back to
            themes" and "Start your event page" are desktop-only. */}
        <style>{'.mg-sign-up { display: none !important; } @media (max-width: 480px) { .mg-back-to-themes, .mg-start-page { display: none !important; } .mg-sign-up { display: inline-block !important; } .mg-topbar-actions { gap: 8px !important; } .mg-topbar-actions a { padding: 7px 14px !important; } }'}</style>
        {backToThemes && (
          <>
            <Link
              href="/#themes"
              className="mg-back-to-themes"
              style={{ fontSize: 13, fontWeight: 600, color: '#6B6470', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              &larr; Back to themes
            </Link>
          </>
        )}
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
              className="mg-start-page"
              style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.3, padding: '8px 18px', borderRadius: 999, border: 'none', background: '#B6584A', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Start your event page
            </Link>
            <Link
              href="/register"
              className="mg-sign-up"
              style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.3, padding: '8px 18px', borderRadius: 999, border: 'none', background: '#B6584A', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
