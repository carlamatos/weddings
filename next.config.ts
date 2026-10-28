import type { NextConfig } from 'next';

// Vercel injects its Live feedback toolbar into preview deployments (staging),
// so allow its origins there only. Production's policy is unchanged.
const isPreviewDeploy =
  process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_GIT_COMMIT_REF === 'staging';
const vercelLive = (sources: string) => (isPreviewDeploy ? ` ${sources}` : '');

// The main domain's origins. Custom-domain event pages embed MyGala's
// Turnstile bridge (/api/turnstile/frame) from it, and dashboard screens on
// app.mygala.ca show its images (e.g. the reminder email preview's banner).
const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'mygala.ca';
const mainSite = `https://${rootDomain} https://www.${rootDomain}`;

// Google Analytics 4 and Google Ads (loaded by Tag Manager): where the tags
// send hits and fetch pixels, per Google's CSP guide
// (developers.google.com/tag-platform/security/guides/csp). Wildcards, since
// the hosts vary — GA4 Signals uses stats.g.doubleclick.net, Ads uses both
// google.com and www.google.com, and Analytics has regional servers.
const googleTags = [
  'https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://analytics.google.com',
  'https://*.googletagmanager.com',
  'https://*.g.doubleclick.net', 'https://ad.doubleclick.net', 'https://www.googleadservices.com',
  'https://google.com', 'https://*.google.com',
  // Ads also pings the visitor's own country's Google (www.google.<tld>),
  // which CSP can't wildcard: the countries visitors come from.
  ...['ca', 'co.uk', 'com.au', 'co.nz', 'ie', 'fr', 'de', 'es', 'it', 'nl', 'be', 'ch', 'pt', 'com.br', 'com.mx', 'co.in', 'com.ph']
    .map((tld) => `https://www.google.${tld}`),
].join(' ');

// The Pinterest tag (added in Tag Manager): its scripts and pixels come from
// s.pinimg.com and ct.pinterest.com, which also loads a hidden frame and
// receives the conversions.
const pinterestTag = 'https://s.pinimg.com https://ct.pinterest.com';

const securityHeaders = [
  // frame-src also lists the livestream players the Live Stream section embeds
  // (app/lib/livestream.ts); Facebook's is already allowed for sign-in.
  // 'self': the live theme previews (app/(frame)/theme-preview).
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://*.googletagmanager.com https://www.google-analytics.com https://challenges.cloudflare.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com ${pinterestTag}${vercelLive('https://vercel.live')}`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.typekit.net https://p.typekit.net${vercelLive('https://vercel.live')}`,
      `font-src 'self' https://fonts.gstatic.com https://use.typekit.net https://p.typekit.net${vercelLive('https://vercel.live https://assets.vercel.com')}`,
      `img-src 'self' data: blob: ${mainSite} https://*.googleusercontent.com https://maps.gstatic.com https://maps.googleapis.com https://*.blob.vercel-storage.com ${googleTags} ${pinterestTag}${vercelLive('https://vercel.live https://vercel.com')}`,
      "media-src 'self' blob: https://*.blob.vercel-storage.com",
      // The HEIC photo decoder (heic-to, app/lib/compress-image.ts) runs in a
      // Web Worker it creates from a blob: URL — only scripts already on the
      // page can create those.
      "worker-src 'self' blob:",
      `connect-src 'self' https://maps.googleapis.com https://accounts.google.com https://vercel.com https://*.blob.vercel-storage.com ${googleTags} https://pagead2.googlesyndication.com ${pinterestTag}${vercelLive('https://vercel.live wss://ws-us3.pusher.com')}`,
      `frame-src 'self' https://accounts.google.com https://appleid.apple.com https://www.facebook.com https://www.google.com https://maps.googleapis.com https://challenges.cloudflare.com https://www.youtube-nocookie.com https://player.vimeo.com https://vimeo.com https://player.twitch.tv https://td.doubleclick.net https://www.googletagmanager.com https://ct.pinterest.com ${mainSite}${vercelLive('https://vercel.live')}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com https://appleid.apple.com https://www.facebook.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
];

// The live theme previews (app/(frame)/theme-preview) are shown inside our
// own "design your invitation" pages, so they may be framed by this site
// only; everything else can't be framed at all.
const framedByUsHeaders = [
  ...securityHeaders.map((h) =>
    h.key === 'Content-Security-Policy' ? { ...h, value: h.value.replace("frame-ancestors 'none'", "frame-ancestors 'self'") }
      : h.key === 'X-Frame-Options' ? { ...h, value: 'SAMEORIGIN' }
      : h),
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
];

const nextConfig: NextConfig = {
  // CSS goes in the page's <head> instead of separate render-blocking files:
  // first visits (most ad traffic) paint ~0.2–0.4 s sooner on phones. Applies
  // to every page; the cost is no cross-page CSS caching.
  // globalNotFound: the 404 for unmatched addresses (app/global-not-found.tsx),
  // needed because the site has two root layouts (English and French).
  experimental: { inlineCss: true, globalNotFound: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    minimumCacheTTL: 2678400, // 31 days — blob files are immutable (unique per upload)
    qualities: [75, 90], // 90 for photo thumbnails/lightbox — Next 16 defaults to [75] only
    // AVIF where the browser supports it (~40% smaller than WebP for photos), else WebP.
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        // Everything except the Turnstile bridge, which sets its own headers
        // so verified custom domains can frame it (app/api/turnstile/frame),
        // and the live theme previews (below).
        source: '/((?!api/turnstile/frame$|theme-preview/).*)',
        headers: securityHeaders,
      },
      {
        source: '/theme-preview/:slug',
        headers: framedByUsHeaders,
      },
      {
        // Sign-up, sign-in and account screens stay out of search results:
        // /register alone is linked with dozens of ?start=&theme= variants,
        // all the same page. Links on them are still followed.
        source: '/:path(register|login|forgot-password|reset-password|check-email|email-verified|verify-email-pending|verify-2fa|construction)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }],
      },
    ];
  },
  async redirects() {
    return [
      // Theme previews used to be standalone HTML files; they're now rendered
      // from the real theme components at /themes/<slug>.
      {
        source: '/themes/:slug([a-z-]+)\\.html',
        destination: '/themes/:slug',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        destination: '/images/:path*',
      },
    ];
  },
};

export default nextConfig;
