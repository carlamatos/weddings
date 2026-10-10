import { greatVibes } from '@/app/ui/fonts';
import Link from 'next/link';
import '@/app/ui/marketing.css';
import MarketingReveal from '@/app/ui/marketing-reveal';
import ThemeFilter from '@/app/ui/theme-filter';
import { auth } from '@/auth';
import SiteTopbar from '@/app/ui/site-topbar';
import ThemeHeroPreview from '@/app/ui/dashboard/ThemeHeroPreview';
import type { Metadata } from 'next';
import { PLAN_CURRENCY, PLAN_FEATURES, PLAN_ONE_TIME_PRICE, PLAN_PRICE_PLUS_TAX, PLAN_TERM_MONTHS } from '@/app/lib/plans';
import { faqPageJsonLd, marketingMetadata, organizationJsonLd, productJsonLd, webSiteJsonLd } from '@/app/lib/marketing/seo';
import { JsonLd } from '@/app/ui/marketing/json-ld';
import { appHref } from '@/app/lib/app-url';
import { getEventType } from '@/app/lib/marketing/events';
import SiteFooter from '@/app/ui/marketing/site-footer';

// New-theme showcase cards scale the theme's own real HeroPreview (280px
// tall) down to the marketing grid's 220px preview slot.
const NEW_THEME_PREVIEW_SCALE = 220 / 280;

const learnMore = (slug: string) => getEventType(slug)?.learnMoreLabel ?? 'Learn more';

const HOME_SEO = {
  title: 'MyGala — Event Websites with RSVPs, Invitations & Photos',
  description: `Create an event website in minutes: RSVPs, guest list, invitations, guest photos, livestream and reminders. Free to start; Plus is ${PLAN_PRICE_PLUS_TAX} per event.`,
};

export const metadata: Metadata = {
  ...marketingMetadata(HOME_SEO, '/'),
  // The homepage title already leads with the brand: no " | MyGala" suffix.
  title: { absolute: HOME_SEO.title },
};

// Shown on the page and marked up as FAQPage for search engines and AI assistants.
const HOME_FAQS = [
  { q: 'Can I switch themes after I’ve started?', a: 'Yes. Your content stays put — switching themes only changes how it looks, any time, as many times as you like.' },
  { q: 'Do my guests need an account to RSVP or upload photos?', a: 'No. Guests just visit your link. No sign-up, no app, no friction.' },
  { q: 'What happens to my page after the event?', a: `It stays live as a keepsake. Free pages remain viewable indefinitely; Plus pages stay fully featured for ${PLAN_TERM_MONTHS} months from your purchase, then you can extend for another ${PLAN_TERM_MONTHS} with a single payment.` },
  { q: 'Is Plus a subscription?', a: `No — it’s a single one-time payment of ${PLAN_PRICE_PLUS_TAX} per event that unlocks every feature for that event for ${PLAN_TERM_MONTHS} months. No recurring charge, and no card kept on file.` },
];

export default async function Page() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className={`marketing-page ${greatVibes.variable}`}>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      <JsonLd data={productJsonLd()} />
      <JsonLd data={faqPageJsonLd(HOME_FAQS)} />

      {/* TOP BAR */}
      <SiteTopbar isLoggedIn={isLoggedIn} />

      {/* HERO */}
      <div className="hero">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/home-hero-poster.jpg"
          src="/videos/home-hero.mp4"
        />
        <div className="hero-overlay" />
        <p className="hero-eyebrow reveal">For every celebration that deserves it done right</p>
        <h1 className="hero-headline reveal delay-1">A page as considered as the celebration itself.</h1>
        <p className="hero-sub reveal delay-2">Pick a theme, add your details, and share one link with everyone you love. RSVPs, photos, and every detail, beautifully kept in one place.</p>
        <div className="hero-actions reveal delay-2">
          <Link href={appHref('/login')} className="btn-primary">Start your event page</Link>
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
            <p className="eyebrow">Why hosts choose Gala</p>
            <h2 className="section-title">Everything your event page needs, nothing it doesn&apos;t.</h2>
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
              <p className="eyebrow">A theme for every occasion</p>
              <h2 className="section-title">Pick the theme that feels like your day.</h2>
              <p className="section-sub">Every theme includes the same full set of tools — RSVP, countdown, gallery, livestream, and more. Only the mood changes.</p>
            </div>
            <ThemeFilter>
            <div className="theme-category" id="theme-birthdays" data-category="birthdays">
              <h3 className="theme-category-title reveal">Celebrations</h3>
              <div className="theme-grid">
                <a href="/themes/alegria" target="_blank" rel="noopener noreferrer" className="theme-card reveal" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#FFF8F3' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="alegria" heading="Quinceañera" eventDate="2027-06-12" city="San Antonio" country="TX" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">Alegría</p>
                    <p className="theme-desc">Blush, lilac, and gold. Romantic and joyful — built for quinceañeras and sweet 16 celebrations.</p>
                  </div>
                </a>
                <a href="/themes/fun-party" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#1A0B2E' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="fun-party" heading="The Big Sweet 16" eventDate="2027-08-08" city="Miami" country="FL" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">Fun Party</p>
                    <p className="theme-desc">Hot pink, cyan, and neon yellow on a graffiti backdrop. Bold and rebellious — built for sweet 16s and quinceañeras that want to stand out.</p>
                  </div>
                </a>
                <a href="/themes/balloons" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: 'linear-gradient(135deg, #FFFDF6 0%, #EAF4FF 100%)' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="balloons" heading="Birthday Bash" eventDate="2026-11-14" city="Austin" country="TX" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">Balloons</p>
                    <p className="theme-desc">Bright red, blue, and gold with floating balloons and confetti. Fun and festive — built for birthday parties and kids&apos; celebrations.</p>
                  </div>
                </a>
                <a href="/themes/baby-shower-girl" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-3" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#F5D7DF' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="baby-shower-girl" heading="Baby Shower" eventDate="2027-04-17" city="Vancouver" country="BC" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">Girl Baby Shower</p>
                    <p className="theme-desc">Soft greys and blush pinks with a baby elephant, a flying stork, rising balloons and hearts — built for baby showers welcoming a little girl.</p>
                  </div>
                </a>
                <a href="/themes/baby-shower-neutral" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#E3E5E8' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="baby-shower-neutral" heading="Baby Shower" eventDate="2027-05-22" city="Victoria" country="BC" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">Neutral Baby Shower</p>
                    <p className="theme-desc">Whitewashed wood, soft blues and lavender with a baby elephant, a swinging crib mobile and little footprints — built for baby showers before the big reveal.</p>
                  </div>
                </a>
                <a href="/themes/baby-shower-boy" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#8DC8F0' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="baby-shower-boy" heading="Baby Shower" eventDate="2027-06-12" city="Calgary" country="AB" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">Boy Baby Shower</p>
                    <p className="theme-desc">Sky blues and warm caramel with a swimming whale, rising balloons and rolling waves — built for baby showers welcoming a little boy.</p>
                  </div>
                </a>
              </div>
              <Link href="/events/celebrations" className="learn-more-link">{learnMore('celebrations')} →</Link>
            </div>

            <div className="theme-category" id="theme-business" data-category="business">
              <h3 className="theme-category-title reveal">Business Events</h3>
              <div className="theme-grid">
                <a href="/themes/summit" target="_blank" rel="noopener noreferrer" className="theme-card reveal" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#14171C' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="summit" heading="Annual Leadership Summit" eventDate="2027-04-14" city="Austin" country="TX" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">Summit</p>
                    <p className="theme-desc">Cobalt and ink with a confident, modern edge — built for conferences, galas, and company celebrations.</p>
                  </div>
                </a>
                <a href="/themes/nexus" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#1D2124' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="nexus" heading="Nexus Team Offsite 2027" eventDate="2027-05-20" city="Seattle" country="WA" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">Nexus</p>
                    <p className="theme-desc">Charcoal and amber with a teal accent. Professional and innovative — built for team offsites and summits.</p>
                  </div>
                </a>
                <a href="/themes/dinner-gala" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#0a1420' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="dinner-gala" heading="The Annual Gala Dinner" eventDate="2027-03-20" city="Toronto" country="CA" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">Dinner Gala</p>
                    <p className="theme-desc">Deep navy and warm gold, sober and refined — built for galas, fundraisers, and formal corporate dinners.</p>
                  </div>
                </a>
              </div>
              <Link href="/events/business-events" className="learn-more-link">{learnMore('business-events')} →</Link>
            </div>

            <div className="theme-category" id="theme-wedding" data-category="wedding">
              <h3 className="theme-category-title reveal">Weddings</h3>
              <div className="theme-grid">
                <a href="/themes/the-day" target="_blank" rel="noopener noreferrer" className="theme-card reveal" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#F6F2E9' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="the-day" heading="Charlotte & James" eventDate="2027-09-18" city="Niagara-on-the-Lake" country="ON" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">The Day</p>
                    <p className="theme-desc">Ivory peonies and a white bouquet with sage-to-evergreen greenery and gold accents. Timeless and refined — built for classic, elegant weddings.</p>
                  </div>
                </a>
                <a href="/themes/love" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#F6C4C3' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="love" heading="Isabella & Mateo" eventDate="2027-06-05" city="Kelowna" country="BC" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">Love</p>
                    <p className="theme-desc">Blush, rose and raspberry with peach and soft greens. Romantic script, arched cards and rising hearts — built for warm, heartfelt weddings.</p>
                  </div>
                </a>
              <a href="/themes/terracotta-harvest" target="_blank" rel="noopener noreferrer" className="theme-card reveal" style={{ textDecoration: 'none' }}>
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
              <a href="/themes/midnight-botanical" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
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
              <a href="/themes/quiet-coastal" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
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
              <a href="/themes/vilma" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-3" style={{ textDecoration: 'none' }}>
                <div className="theme-preview" style={{ background: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <radialGradient id="mk-g1" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#d2c3d6" stopOpacity="0.4"/><stop offset="100%" stopColor="#d2c3d6" stopOpacity="0"/></radialGradient>
                      <radialGradient id="mk-g2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f4e3b5" stopOpacity="0.5"/><stop offset="100%" stopColor="#f4e3b5" stopOpacity="0"/></radialGradient>
                    </defs>
                    <ellipse cx="200" cy="110" rx="200" ry="110" fill="url(#mk-g1)"/>
                    <ellipse cx="200" cy="110" rx="120" ry="80" fill="url(#mk-g2)"/>
                    <circle cx="60" cy="30" r="3" fill="#f8ac4c" opacity="0.5"/>
                    <circle cx="340" cy="40" r="2.5" fill="#f8ac4c" opacity="0.4"/>
                    <circle cx="30" cy="180" r="4" fill="#d2c3d6" opacity="0.5"/>
                    <circle cx="370" cy="190" r="3" fill="#92946f" opacity="0.35"/>
                  </svg>
                  <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #d2c3d6', background: 'radial-gradient(circle, rgba(244,227,181,0.5) 0%, transparent 70%)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 15, height: 15, borderRadius: '50%', border: '0.5px solid rgba(248,172,76,0.4)' }} />
                    </div>
                    <p style={{ fontSize: '9px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#92946f', fontWeight: 600, margin: '0 0 6px', fontFamily: 'system-ui' }}>Together with their families</p>
                    <p style={{ fontFamily: 'Georgia, cursive', fontSize: '30px', color: '#8c9eac', margin: '0 0 6px', fontWeight: 400, lineHeight: 1.1 }}>Isabella &amp; William</p>
                    <div style={{ width: 28, height: 1.5, background: '#f8ac4c', margin: '0 auto 6px', border: 'none' }} />
                    <p style={{ fontSize: '9px', letterSpacing: '2px', color: '#92946f', margin: 0, fontFamily: 'system-ui', textTransform: 'uppercase' }}>June 14, 2026</p>
                  </div>
                </div>
                <div className="theme-info">
                  <p className="theme-name">Vilma</p>
                  <p className="theme-desc">Watercolour washes, steel blue, and amber accents. Soft and romantic — built for garden and manor weddings.</p>
                </div>
              </a>
              </div>
              <Link href="/events/weddings" className="learn-more-link">{learnMore('weddings')} →</Link>
            </div>

            <div className="theme-category" id="theme-community" data-category="community">
              <h3 className="theme-category-title reveal">General Events</h3>
              <div className="theme-grid">
                <a href="/themes/community" target="_blank" rel="noopener noreferrer" className="theme-card reveal" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#F6E0BD' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="community" heading="Maple Street Block Party" eventDate="2027-06-19" city="Portland" country="OR" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">Community Day</p>
                    <p className="theme-desc">Warm cream and navy with a rainbow of festival bunting. Fun and elegant at once — built for block parties, fairs, and neighborhood celebrations.</p>
                  </div>
                </a>
                <a href="/themes/antique-cars" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#57C0B9' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="antique-cars" heading="Classic Car Show" eventDate="2027-06-19" city="Maple Ridge" country="BC" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">Antique Cars</p>
                    <p className="theme-desc">Teal, deep purple, and golden yellow with checkered flags, wire wheels, and a classic car cruising the page — built for antique and classic car shows.</p>
                  </div>
                </a>
                <a href="/themes/christmas-party" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#2C3138' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="christmas-party" heading="Christmas Party" eventDate="2026-12-19" city="Banff" country="AB" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">Christmas Party</p>
                    <p className="theme-desc">Forest green, bauble red and golden light with falling snow, twinkling string lights and a swinging bauble countdown — cozy and cute for holiday parties.</p>
                  </div>
                </a>
                <a href="/themes/white-christmas" target="_blank" rel="noopener noreferrer" className="theme-card reveal" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#DAE4F0' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="white-christmas" heading="White Christmas" eventDate="2026-12-12" city="Lake Louise" country="AB" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">White Christmas</p>
                    <p className="theme-desc">Icy winter blues with gold stars, silver and pine, gold-framed cards and gently falling snow — classic and elegant for holiday celebrations.</p>
                  </div>
                </a>
                <a href="/themes/dia-de-los-muertos" target="_blank" rel="noopener noreferrer" className="theme-card reveal" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#FBB813' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="dia-de-los-muertos" heading="Día de los Muertos" eventDate="2026-11-01" city="Toronto" country="ON" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">Día de los Muertos</p>
                    <p className="theme-desc">Deep plum and marigold with hot pink and teal, swaying papel picado, falling petals and dancing sugar skulls — joyful and colourful for remembrance celebrations.</p>
                  </div>
                </a>
                <a href="/themes/halloween-party" target="_blank" rel="noopener noreferrer" className="theme-card reveal" style={{ textDecoration: 'none' }}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: '#1F1D1E' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / NEW_THEME_PREVIEW_SCALE}%`, transform: `scale(${NEW_THEME_PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug="halloween-party" heading="Halloween Party" eventDate="2026-10-31" city="Niagara-on-the-Lake" country="ON" />
                    </div>
                  </div>
                  <div className="theme-info">
                    <p className="theme-name">Halloween Party</p>
                    <p className="theme-desc">Midnight charcoal and pumpkin orange with flying bats, dangling spiders, rolling fog and a creeping witch&rsquo;s hand — scary, but fun.</p>
                  </div>
                </a>
              </div>
              <Link href="/events/general-events" className="learn-more-link">{learnMore('general-events')} →</Link>
            </div>
            </ThemeFilter>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div className="wrap" id="pricing">
        <div className="section">
          <div className="reveal" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 10px' }}>
            <p className="eyebrow" style={{ textAlign: 'center' }}>Simple pricing</p>
            <h2 className="section-title">Start free. Upgrade when you&apos;re ready.</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>One payment, no recurring charges, no surprises as your event gets closer.</p>
          </div>
          <div className="pricing-grid">
            <div className="price-card reveal">
              <p className="price-tier">Free</p>
              <p className="price-amount">$0</p>
              <p className="price-desc">Everything you need to get started.</p>
              <ul className="price-features">
                {PLAN_FEATURES.free.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <Link href={appHref('/login')} className="btn-secondary" style={{ textAlign: 'center' }}>Get started free</Link>
            </div>
            <div className="price-card featured reveal delay-1">
              <span className="price-badge">Most popular</span>
              <p className="price-tier">Plus</p>
              <p className="price-amount">${PLAN_ONE_TIME_PRICE}<span className="per"> {PLAN_CURRENCY} + tax, one-time, per event</span></p>
              <p className="price-desc">Get all the perks from mygala.</p>
              <ul className="price-features">
                {PLAN_FEATURES.plus.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <Link href={appHref('/login')} className="btn-primary" style={{ textAlign: 'center' }}>Start your event page</Link>
            </div>
          </div>
          {/* What Stripe and card networks expect next to a price: who processes
              payment, accepted cards, the currency, and the refund policy. */}
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.7, margin: '28px auto 0', maxWidth: 640 }}>
            🔒 Secure checkout by Stripe · Visa, Mastercard and American Express accepted · Prices in Canadian dollars ({PLAN_CURRENCY}); GST/HST and provincial sales tax are added at checkout.{' '}
            <Link href="/terms#refunds" style={{ color: 'var(--rose)' }}>Refund &amp; cancellation policy</Link>
          </p>
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
            {HOME_FAQS.map((f) => (
              <div className="faq-item" key={f.q}>
                <p className="faq-q">{f.q}</p>
                <p className="faq-a">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="final-cta reveal">
        <h2 className="section-title">Your story deserves a beautiful home.</h2>
        <p className="hero-sub">Start free today. Upgrade only if you need to.</p>
        <Link href={appHref('/login')} className="btn-primary">Start your event page</Link>
      </div>

      {/* FOOTER */}
      <SiteFooter />

      <MarketingReveal />
    </div>
  );
}
