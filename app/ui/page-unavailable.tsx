// Shown to guests instead of a wedding page an admin has deactivated.
export default function PageUnavailable() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF9F7',
        fontFamily: 'system-ui, sans-serif',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <p style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#9A8F8C', margin: '0 0 16px' }}>
          Page unavailable
        </p>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 700, color: '#241F2B', margin: '0 0 14px', lineHeight: 1.15 }}>
          This page is currently unavailable
        </h1>
        <p style={{ fontSize: 16, color: '#6B6470', margin: 0, lineHeight: 1.7 }}>
          The host has temporarily turned this page off. Please check back later.
        </p>
      </div>
    </div>
  );
}
