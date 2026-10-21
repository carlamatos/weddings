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
  'https://google.com', 'https://*.google.com', 'https://www.google.ca',
].join(' ');

// The Pinterest tag (added in Tag Manager): its scripts and pixels come from
// s.pinimg.com and ct.pinterest.com, which also loads a hidden frame and
// receives the conversions.
const pinterestTag = 'https://s.pinimg.com https://ct.pinterest.com';

const securityHeaders = [
  // frame-src also lists the livestream players the Live Stream section embeds
  // (app/lib/livestream.ts); Facebook's is already allowed for sign-in.
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
      `frame-src https://accounts.google.com https://appleid.apple.com https://www.facebook.com https://www.google.com https://maps.googleapis.com https://challenges.cloudflare.com https://www.youtube-nocookie.com https://player.vimeo.com https://vimeo.com https://player.twitch.tv https://td.doubleclick.net https://www.googletagmanager.com https://ct.pinterest.com ${mainSite}${vercelLive('https://vercel.live')}`,
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

const nextConfig: NextConfig = {
  // CSS goes in the page's <head> instead of separate render-blocking files:
  // first visits (most ad traffic) paint ~0.2–0.4 s sooner on phones. Applies
  // to every page; the cost is no cross-page CSS caching.
  experimental: { inlineCss: true },
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
        // so verified custom domains can frame it (app/api/turnstile/frame).
        source: '/((?!api/turnstile/frame$).*)',
        headers: securityHeaders,
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
