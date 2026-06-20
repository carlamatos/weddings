import { greatVibes } from '@/app/ui/fonts';
import Link from 'next/link';
import '@/app/ui/marketing.css';
import MarketingReveal from '@/app/ui/marketing-reveal';

export default function Page() {
  return (
    <div className={`marketing-page ${greatVibes.variable}`}>

      {/* TOP BAR */}
      <div className="topbar">
        <Link href="/" className="wordmark">My<span className="accent">Gala</span></Link>
        <Link href="/login" className="topbar-cta">Start your wedding page</Link>
      </div>

      {/* HERO */}
      <div className="hero">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          src="/videos/couples_kissing.mp4"
        />
        <div className="hero-overlay" />
        <p className="hero-eyebrow reveal">For couples who want it done right</p>
        <h1 className="hero-headline reveal delay-1">A wedding page as considered as the wedding itself.</h1>
        <p className="hero-sub reveal delay-2">Pick a theme, add your details, and share one link with everyone you love. RSVPs, photos, and the whole day, beautifully kept in one place.</p>
        <div className="hero-actions reveal delay-2">
          <Link href="/login" className="btn-primary">Start your wedding page</Link>
          <a href="#themes" className="btn-secondary">See the themes</a>
        </div>

        <div className="fan-wrap reveal delay-3">
          <div className="mock-card card-left">
            <div className="mock-browser-bar"><span></span><span></span><span></span></div>
            <div className="mock-screen mock-tc">
              <p className="mock-eyebrow">Together with their families</p>
              <p className="mock-name">Elena &amp; Marcus</p>
              <p className="mock-date">SEPT 20, 2026 · MAPLE RIDGE</p>
              <div className="mock-band">
                <span style={{ background: '#BC5A38' }}></span>
                <span style={{ background: '#CC9A3E' }}></span>
                <span style={{ background: '#EFCBA3' }}></span>
                <span style={{ background: '#F7F1E6' }}></span>
                <span style={{ background: '#A9C4DE' }}></span>
                <span style={{ background: '#D8D2C2' }}></span>
              </div>
            </div>
          </div>
          <div className="mock-card card-center">
            <div className="mock-browser-bar"><span></span><span></span><span></span></div>
            <div className="mock-screen mock-mb">
              <p className="mock-eyebrow">Save the date</p>
              <p className="mock-name">Sofia &amp; James</p>
              <p className="mock-date">November 7, 2026</p>
              <div className="mock-rule"></div>
            </div>
          </div>
          <div className="mock-card card-right">
            <div className="mock-browser-bar"><span></span><span></span><span></span></div>
            <div className="mock-screen mock-qc">
              <p className="mock-eyebrow">together with their families</p>
              <p className="mock-name">Nora + Theo</p>
              <p className="mock-date">june 13, 2027 · tofino</p>
              <div className="mock-hairline"></div>
            </div>
          </div>
        </div>
      </div>

{/* VALUE PROPS */}
      <div className="wrap">
        <div className="section">
          <div className="reveal" style={{ maxWidth: '600px', marginBottom: '50px' }}>
            <p className="eyebrow">Why couples choose Gala</p>
            <h2 className="section-title">Everything your wedding website needs, nothing it doesn&apos;t.</h2>
          </div>
          <div className="props-grid">
            <div className="prop-card reveal">
              <p className="prop-num">01</p>
              <h3 className="prop-title">Set up in minutes</h3>
              <p className="prop-copy">Choose a theme, add your names and date, and your page is live. No designer, no developer, no waiting.</p>
            </div>
            <div className="prop-card reveal delay-1">
              <p className="prop-num">02</p>
              <h3 className="prop-title">Everything in one place</h3>
              <p className="prop-copy">RSVPs, the schedule, the registry, your story, guest photos, even song requests — all on one page you control.</p>
            </div>
            <div className="prop-card reveal delay-2">
              <p className="prop-num">03</p>
              <h3 className="prop-title">Built to be shared</h3>
              <p className="prop-copy">One clean link works everywhere — texts, invitations, Instagram bios. Your guests always know where to look.</p>
            </div>
          </div>
        </div>
      </div>

      {/* THEME SHOWCASE */}
      <div className="theme-showcase" id="themes">
        <div className="wrap">
          <div className="section">
            <div className="reveal" style={{ maxWidth: '600px' }}>
              <p className="eyebrow">Three ways to set the mood</p>
              <h2 className="section-title">Pick the theme that feels like your day.</h2>
              <p className="section-sub">Every theme includes the same full set of tools — RSVP, countdown, gallery, livestream, and more. Only the mood changes.</p>
            </div>
            <div className="theme-grid">
              <a href="/themes/terracotta-harvest.html" target="_blank" rel="noopener noreferrer" className="theme-card reveal" style={{ textDecoration: 'none' }}>
                <div className="theme-preview tc">
                  <div style={{ textAlign: 'center', padding: '0 20px' }}>
                    <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#BC5A38', fontWeight: 600, margin: '0 0 8px' }}>Together with their families</p>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: '#3D2B1F', margin: '0 0 8px' }}>Elena &amp; Marcus</p>
                    <p style={{ fontSize: '10px', letterSpacing: '1px', color: '#7A6451', margin: 0 }}>SEPT 20, 2026</p>
                  </div>
                </div>
                <div className="theme-info">
                  <p className="theme-name">Terracotta Harvest</p>
                  <p className="theme-desc">Warm rust, ochre, and linen. Golden-hour, earthy, and intimate — built for outdoor and orchard weddings.</p>
                </div>
              </a>
              <a href="/themes/midnight-botanical.html" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                <div className="theme-preview mb">
                  <div style={{ textAlign: 'center', padding: '0 20px' }}>
                    <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#C9A75D', fontWeight: 600, margin: '0 0 8px' }}>Save the date</p>
                    <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '26px', color: '#F2EAD3', margin: '0 0 8px' }}>Sofia &amp; James</p>
                    <p style={{ fontSize: '10px', letterSpacing: '1px', color: '#9CB3A4', margin: 0, textTransform: 'uppercase' }}>November 7, 2026</p>
                  </div>
                </div>
                <div className="theme-info">
                  <p className="theme-name">Midnight Botanical</p>
                  <p className="theme-desc">Deep emerald and antique gold. Formal and candlelit — built for evening affairs and manor venues.</p>
                </div>
              </a>
              <a href="/themes/quiet-coastal.html" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                <div className="theme-preview qc">
                  <div style={{ textAlign: 'center', padding: '0 20px' }}>
                    <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'lowercase', color: '#8C9A93', fontWeight: 500, margin: '0 0 8px' }}>together with their families</p>
                    <p style={{ fontSize: '28px', color: '#3F4A45', margin: '0 0 8px', letterSpacing: '-1px', fontWeight: 400 }}>Nora + Theo</p>
                    <p style={{ fontSize: '10px', letterSpacing: '1px', color: '#7C8B86', margin: 0, textTransform: 'lowercase' }}>june 13, 2027</p>
                  </div>
                </div>
                <div className="theme-info">
                  <p className="theme-name">Quiet Coastal</p>
                  <p className="theme-desc">Sage, sand, and chalk. Airy and minimal — built for beach ceremonies and destination weddings.</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div className="wrap" id="pricing">
        <div className="section">
          <div className="reveal" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 10px' }}>
            <p className="eyebrow" style={{ textAlign: 'center' }}>Simple pricing</p>
            <h2 className="section-title">Start free. Upgrade when you&apos;re ready.</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>No hidden fees, no surprise charges as your wedding gets closer.</p>
          </div>
          <div className="pricing-grid">
            <div className="price-card reveal">
              <p className="price-tier">Free</p>
              <p className="price-amount">$0</p>
              <p className="price-desc">Everything you need to get started.</p>
              <ul className="price-features">
                <li>1 wedding page</li>
                <li>All 3 themes</li>
                <li>RSVP &amp; guest count</li>
                <li>Countdown &amp; event details</li>
                <li>Up to 20 guest photo uploads</li>
                <li>Gala subdomain (yourname.mygala.ca)</li>
              </ul>
              <Link href="/login" className="btn-secondary" style={{ textAlign: 'center' }}>Get started free</Link>
            </div>
            <div className="price-card featured reveal delay-1">
              <span className="price-badge">Most popular</span>
              <p className="price-tier">Plus</p>
              <p className="price-amount">$15<span className="per"> / month</span></p>
              <p className="price-desc">For couples who want it all, exactly their way.</p>
              <ul className="price-features">
                <li>Everything in Free</li>
                <li>Unlimited photo uploads</li>
                <li>Livestream link &amp; song requests</li>
                <li>Custom domain support</li>
                <li>Remove Gala branding</li>
                <li>Priority support</li>
              </ul>
              <Link href="/login" className="btn-primary" style={{ textAlign: 'center' }}>Start your wedding page</Link>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="wrap">
        <div className="section" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="reveal" style={{ marginBottom: '40px' }}>
            <p className="eyebrow">A few questions</p>
            <h2 className="section-title">Good to know</h2>
          </div>
          <div className="reveal">
            <div className="faq-item">
              <p className="faq-q">Can I switch themes after I&apos;ve started?</p>
              <p className="faq-a">Yes. Your content stays put — switching themes only changes how it looks, any time, as many times as you like.</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">Do my guests need an account to RSVP or upload photos?</p>
              <p className="faq-a">No. Guests just visit your link. No sign-up, no app, no friction.</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">What happens to my page after the wedding?</p>
              <p className="faq-a">It stays live as a keepsake. Free pages remain viewable indefinitely; Plus pages keep every feature active for as long as you&apos;re subscribed.</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">Can I cancel anytime?</p>
              <p className="faq-a">Yes, with no long-term contract. Cancel whenever you like and your page reverts to the Free plan limits.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="final-cta reveal">
        <h2 className="section-title">Your story deserves a beautiful home.</h2>
        <p className="hero-sub">Start free today. Upgrade only if you need to.</p>
        <Link href="/login" className="btn-primary">Start your wedding page</Link>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <p className="footer-wordmark">My<span className="accent">Gala</span></p>
        <p style={{ marginTop: '6px' }}>mygala.ca</p>
      </div>

      <MarketingReveal />
    </div>
  );
}
