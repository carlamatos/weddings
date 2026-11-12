import { greatVibes } from '@/app/ui/fonts';
import Link from 'next/link';
import '@/app/ui/marketing.css';
import MarketingReveal from '@/app/ui/marketing-reveal';
import ThemeFilter from '@/app/ui/theme-filter';
import { auth } from '@/auth';
import SiteTopbar from '@/app/ui/site-topbar';
import { ThemePagePicture } from '@/app/ui/marketing/theme-page-picture';
import type { Metadata } from 'next';
import { PLAN_PRICE_PLUS_TAX, PLAN_TERM_MONTHS } from '@/app/lib/plans';
import { PricingCards } from '@/app/ui/marketing/pricing-cards';
import { faqPageJsonLd, marketingMetadata, organizationJsonLd, productJsonLd, videoObjectJsonLd, webSiteJsonLd } from '@/app/lib/marketing/seo';
import { JsonLd } from '@/app/ui/marketing/json-ld';
import { appHref } from '@/app/lib/app-url';
import { getEventType } from '@/app/lib/marketing/events';
import SiteFooter from '@/app/ui/marketing/site-footer';
import { FreeToolsStrip } from '@/app/ui/marketing/free-tools-strip';
import HeroThemeWall from '@/app/ui/marketing/hero-theme-wall';
import { HomeVideo } from '@/app/ui/marketing/home-video';
import type { Video } from '@/app/lib/marketing/types';

const learnMore = (slug: string) => getEventType(slug)?.learnMoreLabel ?? 'Learn more';

const HOME_SEO = {
  title: 'MyGala — Event Websites with RSVPs, Invitations & Photos',
  description: `Create an event website in minutes: RSVPs, guest list, invitations, guest photos, livestream and reminders. Free to start.`,
};

// The title already leads with the brand, so marketingMetadata adds no " | MyGala".
export const metadata: Metadata = marketingMetadata(HOME_SEO, '/');

// Shown on the page and marked up as FAQPage for search engines and AI assistants.
const HOME_FAQS = [
  { q: 'Can I switch themes after I’ve started?', a: 'Yes. Your content stays put — switching themes only changes how it looks, any time, as many times as you like.' },
  { q: 'Do my guests need an account to RSVP or upload photos?', a: 'No. Guests just visit your link. No sign-up, no app, no friction.' },
  { q: 'What happens to my page after the event?', a: `It stays live as a keepsake. Free pages remain viewable indefinitely; Live Party pages stay fully featured for ${PLAN_TERM_MONTHS} months from your purchase, then you can extend for another ${PLAN_TERM_MONTHS} with a single payment.` },
  { q: 'Is Live Party a subscription?', a: `No — it’s a single one-time payment of ${PLAN_PRICE_PLUS_TAX} per event that unlocks every feature for that event for ${PLAN_TERM_MONTHS} months. No recurring charge, and no card kept on file.` },
];

// "How MyGala works", right after the hero: the steps and the features in a minute.
const HOME_VIDEO: Video = {
  src: '/videos/mygala-how-it-works.mp4',
  poster: '/videos/mygala-how-it-works.webp',
  title: 'How MyGala works',
  description: 'Pick a theme, get your event website, send invitations, collect RSVPs, and on the day share guest photos, find your table, request songs and watch live. All in one minute.',
  caption: 'Pick a theme, send invitations, collect RSVPs, and party. All in one minute.',
  width: 1280,
  height: 720,
  duration: 'PT1M',
  uploadDate: '2026-11-02',
};

export default async function Page() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className={`marketing-page ${greatVibes.variable}`}>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      <JsonLd data={productJsonLd()} />
      <JsonLd data={faqPageJsonLd(HOME_FAQS)} />
      <JsonLd data={videoObjectJsonLd(HOME_VIDEO, '/')} />

      {/* TOP BAR */}
      <SiteTopbar isLoggedIn={isLoggedIn} />

      {/* HERO */}
      <div className="hero">
        <HeroThemeWall />
        <div className="hero-wash" />
        <p className="hero-eyebrow hero-badge"><span className="hero-badge-free">Free</span><span>Event websites for weddings, birthdays &amp; every celebration</span></p>
        <p className="hero-tagline">A page as considered as the celebration itself.</p>
        <h1 className="hero-headline">Set up your event in minutes.</h1>
        <p className="hero-sub">Pick a theme, add your details, and share one link with everyone you love. Invitations, RSVPs, photos, and every detail, beautifully kept in one place.</p>
        <div className="hero-actions">
          <Link href={appHref('/register')} className="btn-primary" data-cta="hero">Create your free event page</Link>
          {/* Scrolls to the video below and starts it (home-video.tsx). */}
          <a href="#how-it-works" className="btn-secondary btn-demo" data-cta="hero-video">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M10 8.5l5.5 3.5-5.5 3.5z" fill="currentColor" />
            </svg>
            Watch how it works
          </a>
          {/* A full sample event page (wedding), built from the real theme. */}
          <Link href="/themes/the-day" className="btn-secondary btn-demo" data-cta="hero-demo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            See a live demo
          </Link>
        </div>
        <p className="hero-note"><span>Free to start</span> · <span>No credit card</span> · <span>No design skills needed</span></p>

      </div>

      {/* HOW IT WORKS VIDEO */}
      <div className="wrap" id="how-it-works">
        <div className="section home-video-section">
          <div className="reveal" style={{ maxWidth: '600px', marginBottom: '36px' }}>
            <p className="eyebrow">See it in a minute</p>
            <h2 className="section-title">From &ldquo;let&rsquo;s celebrate&rdquo; to party time.</h2>
          </div>
          <HomeVideo video={HOME_VIDEO} />
        </div>
      </div>

      {/* VALUE PROPS */}
      <div className="wrap">
        <div className="section">
          <div className="reveal" style={{ maxWidth: '600px', marginBottom: '50px' }}>
            <p className="eyebrow">Why hosts choose MyGala</p>
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
                  <ThemePagePicture slug="alegria" />
                  <div className="theme-info">
                    <p className="theme-name">Alegría</p>
                    <p className="theme-desc">Blush, lilac, and gold. Romantic and joyful — built for quinceañeras and sweet 16 celebrations.</p>
                  </div>
                </a>
                <a href="/themes/fun-party" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="fun-party" />
                  <div className="theme-info">
                    <p className="theme-name">Fun Party</p>
                    <p className="theme-desc">Hot pink, cyan, and neon yellow on a graffiti backdrop. Bold and rebellious — built for sweet 16s and quinceañeras that want to stand out.</p>
                  </div>
                </a>
                <a href="/themes/balloons" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="balloons" />
                  <div className="theme-info">
                    <p className="theme-name">Balloons</p>
                    <p className="theme-desc">Bright red, blue, and gold with floating balloons and confetti. Fun and festive — built for birthday parties and kids&apos; celebrations.</p>
                  </div>
                </a>
                <a href="/themes/baby-shower-girl" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-3" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="baby-shower-girl" />
                  <div className="theme-info">
                    <p className="theme-name">Girl Baby Shower</p>
                    <p className="theme-desc">Soft greys and blush pinks with a baby elephant, a flying stork, rising balloons and hearts — built for baby showers welcoming a little girl.</p>
                  </div>
                </a>
                <a href="/themes/baby-shower-neutral" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="baby-shower-neutral" />
                  <div className="theme-info">
                    <p className="theme-name">Neutral Baby Shower</p>
                    <p className="theme-desc">Whitewashed wood, soft blues and lavender with a baby elephant, a swinging crib mobile and little footprints — built for baby showers before the big reveal.</p>
                  </div>
                </a>
                <a href="/themes/baby-shower-boy" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="baby-shower-boy" />
                  <div className="theme-info">
                    <p className="theme-name">Boy Baby Shower</p>
                    <p className="theme-desc">Sky blues and warm caramel with a swimming whale, rising balloons and rolling waves — built for baby showers welcoming a little boy.</p>
                  </div>
                </a>
                <a href="/themes/christmas-party" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="christmas-party" />
                  <div className="theme-info">
                    <p className="theme-name">Christmas Party</p>
                    <p className="theme-desc">Forest green, bauble red and golden light with falling snow, twinkling string lights and a swinging bauble countdown — cozy and cute for holiday parties.</p>
                  </div>
                </a>
                <a href="/themes/white-christmas" target="_blank" rel="noopener noreferrer" className="theme-card reveal" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="white-christmas" />
                  <div className="theme-info">
                    <p className="theme-name">White Christmas</p>
                    <p className="theme-desc">Icy winter blues with gold stars, silver and pine, gold-framed cards and gently falling snow — classic and elegant for holiday celebrations.</p>
                  </div>
                </a>
                <a href="/themes/merry" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="merry" />
                  <div className="theme-info">
                    <p className="theme-name">Merry</p>
                    <p className="theme-desc">Midnight navy and snowflake gold with a red satin ribbon, a gold arch under hanging stars and swinging glass baubles — elegant for holiday parties.</p>
                  </div>
                </a>
                <a href="/themes/gnomes" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="gnomes" />
                  <div className="theme-info">
                    <p className="theme-name">Gnomes</p>
                    <p className="theme-desc">Watercolour gnomes in hat red, pine and sage with fairy lights and santa hats in the snow — cozy and cute for holiday parties.</p>
                  </div>
                </a>
                <a href="/themes/new-years-eve" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="new-years-eve" />
                  <div className="theme-info">
                    <p className="theme-name">New Year&rsquo;s Eve</p>
                    <p className="theme-desc">Espresso, champagne and gold with a sweep of gold sparkles, falling confetti and a countdown to midnight — elegant and festive for New Year&rsquo;s Eve parties.</p>
                  </div>
                </a>
                <a href="/themes/fireworks" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="fireworks" />
                  <div className="theme-info">
                    <p className="theme-name">Fireworks</p>
                    <p className="theme-desc">Night violet with coral, mint, lilac and champagne gold, fireworks bursting over sparklers and a countdown beside a midnight clock — festive for New Year&rsquo;s Eve and every night worth lighting up.</p>
                  </div>
                </a>
              </div>
              <Link href="/events/celebrations" className="learn-more-link">{learnMore('celebrations')} →</Link>
            </div>

            <div className="theme-category" id="theme-business" data-category="business">
              <h3 className="theme-category-title reveal">Business Events</h3>
              <div className="theme-grid">
                <a href="/themes/summit" target="_blank" rel="noopener noreferrer" className="theme-card reveal" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="summit" />
                  <div className="theme-info">
                    <p className="theme-name">Summit</p>
                    <p className="theme-desc">Cobalt and ink with a confident, modern edge — built for conferences, galas, and company celebrations.</p>
                  </div>
                </a>
                <a href="/themes/nexus" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="nexus" />
                  <div className="theme-info">
                    <p className="theme-name">Nexus</p>
                    <p className="theme-desc">Charcoal and amber with a teal accent. Professional and innovative — built for team offsites and summits.</p>
                  </div>
                </a>
                <a href="/themes/dinner-gala" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="dinner-gala" />
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
                  <ThemePagePicture slug="the-day" />
                  <div className="theme-info">
                    <p className="theme-name">The Day</p>
                    <p className="theme-desc">Ivory peonies and a white bouquet with sage-to-evergreen greenery and gold accents. Timeless and refined — built for classic, elegant weddings.</p>
                  </div>
                </a>
                <a href="/themes/love" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="love" />
                  <div className="theme-info">
                    <p className="theme-name">Love</p>
                    <p className="theme-desc">Blush, rose and raspberry with peach and soft greens. Romantic script, arched cards and rising hearts — built for warm, heartfelt weddings.</p>
                  </div>
                </a>
                <a href="/themes/nature" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="nature" />
                  <div className="theme-info">
                    <p className="theme-name">Nature</p>
                    <p className="theme-desc">Walnut, oak and leaf green with candlelight, coral and daisy-gold accents. Falling leaves and fireflies — built for forest, barn and outdoor weddings.</p>
                  </div>
                </a>
                <a href="/themes/wild-flores" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="wild-flores" />
                  <div className="theme-info">
                    <p className="theme-name">Wild Flowers</p>
                    <p className="theme-desc">Linen and sage green with marigold and lilac, pressed wildflowers and pastel blooms that change shape — whimsical and joyful for meadow and garden weddings.</p>
                  </div>
                </a>
                <a href="/themes/western" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="western" />
                  <div className="theme-info">
                    <p className="theme-name">Western</p>
                    <p className="theme-desc">Saddle leather, canvas and rust with brass-gold accents. Desert buttes at sundown and a nailed-up parchment RSVP — built for ranch, barn and country weddings.</p>
                  </div>
                </a>
              <a href="/themes/terracotta-harvest" target="_blank" rel="noopener noreferrer" className="theme-card reveal" style={{ textDecoration: 'none' }}>
                <ThemePagePicture slug="terracotta-harvest" />
                <div className="theme-info">
                  <p className="theme-name">Terracotta Harvest</p>
                  <p className="theme-desc">Warm rust, ochre, and linen. Golden-hour, earthy, and intimate — built for outdoor and orchard weddings.</p>
                </div>
              </a>
              <a href="/themes/midnight-botanical" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                <ThemePagePicture slug="midnight-botanical" />
                <div className="theme-info">
                  <p className="theme-name">Midnight Botanical</p>
                  <p className="theme-desc">Deep emerald and antique gold. Formal and candlelit — built for evening affairs and manor venues.</p>
                </div>
              </a>
              <a href="/themes/quiet-coastal" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                <ThemePagePicture slug="quiet-coastal" />
                <div className="theme-info">
                  <p className="theme-name">Quiet Coastal</p>
                  <p className="theme-desc">Sage, sand, and chalk. Airy and minimal — built for beach ceremonies and destination weddings.</p>
                </div>
              </a>
              <a href="/themes/vilma" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-3" style={{ textDecoration: 'none' }}>
                <ThemePagePicture slug="vilma" />
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
                  <ThemePagePicture slug="community" />
                  <div className="theme-info">
                    <p className="theme-name">Community Day</p>
                    <p className="theme-desc">Warm cream and navy with a rainbow of festival bunting. Fun and elegant at once — built for block parties, fairs, and neighborhood celebrations.</p>
                  </div>
                </a>
                <a href="/themes/antique-cars" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="antique-cars" />
                  <div className="theme-info">
                    <p className="theme-name">Antique Cars</p>
                    <p className="theme-desc">Teal, deep purple, and golden yellow with checkered flags, wire wheels, and a classic car cruising the page — built for antique and classic car shows.</p>
                  </div>
                </a>
                <a href="/themes/christmas-party" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="christmas-party" />
                  <div className="theme-info">
                    <p className="theme-name">Christmas Party</p>
                    <p className="theme-desc">Forest green, bauble red and golden light with falling snow, twinkling string lights and a swinging bauble countdown — cozy and cute for holiday parties.</p>
                  </div>
                </a>
                <a href="/themes/white-christmas" target="_blank" rel="noopener noreferrer" className="theme-card reveal" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="white-christmas" />
                  <div className="theme-info">
                    <p className="theme-name">White Christmas</p>
                    <p className="theme-desc">Icy winter blues with gold stars, silver and pine, gold-framed cards and gently falling snow — classic and elegant for holiday celebrations.</p>
                  </div>
                </a>
                <a href="/themes/gnomes" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="gnomes" />
                  <div className="theme-info">
                    <p className="theme-name">Gnomes</p>
                    <p className="theme-desc">Watercolour gnomes in hat red, pine and sage with fairy lights and santa hats in the snow — cozy and cute for holiday parties.</p>
                  </div>
                </a>
                <a href="/themes/merry" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="merry" />
                  <div className="theme-info">
                    <p className="theme-name">Merry</p>
                    <p className="theme-desc">Midnight navy and snowflake gold with a red satin ribbon, a gold arch under hanging stars and swinging glass baubles — elegant for holiday parties.</p>
                  </div>
                </a>
                <a href="/themes/new-years-eve" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-2" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="new-years-eve" />
                  <div className="theme-info">
                    <p className="theme-name">New Year&rsquo;s Eve</p>
                    <p className="theme-desc">Espresso, champagne and gold with a sweep of gold sparkles, falling confetti and a countdown to midnight — elegant and festive for New Year&rsquo;s Eve parties.</p>
                  </div>
                </a>
                <a href="/themes/fireworks" target="_blank" rel="noopener noreferrer" className="theme-card reveal delay-1" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="fireworks" />
                  <div className="theme-info">
                    <p className="theme-name">Fireworks</p>
                    <p className="theme-desc">Night violet with coral, mint, lilac and champagne gold, fireworks bursting over sparklers and a countdown beside a midnight clock — festive for New Year&rsquo;s Eve and every night worth lighting up.</p>
                  </div>
                </a>
                <a href="/themes/dia-de-los-muertos" target="_blank" rel="noopener noreferrer" className="theme-card reveal" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="dia-de-los-muertos" />
                  <div className="theme-info">
                    <p className="theme-name">Día de los Muertos</p>
                    <p className="theme-desc">Deep plum and marigold with hot pink and teal, swaying papel picado, falling petals and dancing sugar skulls — joyful and colourful for remembrance celebrations.</p>
                  </div>
                </a>
                <a href="/themes/halloween-party" target="_blank" rel="noopener noreferrer" className="theme-card reveal" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug="halloween-party" />
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
          <PricingCards reveal />
          <p style={{ textAlign: 'center', marginTop: 18 }}>
            <Link href="/pricing" className="learn-more-link">Compare the plans in detail →</Link>
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

      {/* FREE PLANNING TOOLS */}
      <div className="reveal">
        <FreeToolsStrip title="Planning something? Start here." sub="Work out your budget, guest count, RSVP deadline and colours in a few minutes. Free, no sign-up needed." />
      </div>

      {/* FINAL CTA */}
      <div className="final-cta reveal">
        <h2 className="section-title">Your story deserves a beautiful home.</h2>
        <p className="hero-sub">Start free today. Upgrade only if you need to.</p>
        <Link href={appHref('/register')} className="btn-primary" data-cta="footer">Create your free event page</Link>
      </div>

      {/* FOOTER */}
      <SiteFooter />

      <MarketingReveal />
    </div>
  );
}
