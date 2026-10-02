import type { NextConfig } from 'next';

// Vercel injects its Live feedback toolbar into preview deployments (staging),
// so allow its origins there only. Production's policy is unchanged.
const isPreviewDeploy =
  process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_GIT_COMMIT_REF === 'staging';
const vercelLive = (sources: string) => (isPreviewDeploy ? ` ${sources}` : '');

const securityHeaders = [
  // frame-src also lists the livestream players the Live Stream section embeds
  // (app/lib/livestream.ts); Facebook's is already allowed for sign-in.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com https://challenges.cloudflare.com${vercelLive('https://vercel.live')}`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.typekit.net https://p.typekit.net${vercelLive('https://vercel.live')}`,
      `font-src 'self' https://fonts.gstatic.com https://use.typekit.net https://p.typekit.net${vercelLive('https://vercel.live https://assets.vercel.com')}`,
      `img-src 'self' data: blob: https://*.googleusercontent.com https://maps.gstatic.com https://maps.googleapis.com https://*.blob.vercel-storage.com${vercelLive('https://vercel.live https://vercel.com')}`,
      "media-src 'self' blob: https://*.blob.vercel-storage.com",
      `connect-src 'self' https://maps.googleapis.com https://accounts.google.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://vercel.com https://*.blob.vercel-storage.com${vercelLive('https://vercel.live wss://ws-us3.pusher.com')}`,
      `frame-src https://accounts.google.com https://appleid.apple.com https://www.facebook.com https://www.google.com https://maps.googleapis.com https://challenges.cloudflare.com https://www.youtube-nocookie.com https://player.vimeo.com https://vimeo.com https://player.twitch.tv${vercelLive('https://vercel.live')}`,
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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    minimumCacheTTL: 2678400, // 31 days — blob files are immutable (unique per upload)
    qualities: [75, 90], // 90 for photo thumbnails/lightbox — Next 16 defaults to [75] only
  },
  async headers() {
    return [
      {
        source: '/(.*)',
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
