import { randomBytes } from 'crypto';
import { sql } from '@vercel/postgres';

// Cloudflare Turnstile bridge for event pages on a host's custom domain.
//
// A Turnstile site key only works on the hostnames listed for it in
// Cloudflare (mygala.ca), so a custom-domain page can't render the widget
// itself. It embeds this tiny page from mygala.ca instead: the check runs
// here, on a listed hostname, and the resulting token is posted to the
// parent page, which sends it with the RSVP (verified in /api/rsvp).
//
// Lives under /api so the proxy (auth, construction gate) never touches it,
// and is excluded from the site-wide headers in next.config.ts because it
// sets its own: only the verified custom domain in ?parent= may frame it,
// and the token is posted to that origin only.

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const notFound = () => new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain', 'X-Frame-Options': 'DENY' } });

export async function GET(request: Request) {
  const parent = (new URL(request.url).searchParams.get('parent') ?? '').toLowerCase();
  // A bare hostname, optionally with www. — nothing that could break out of
  // the CSP header or the postMessage origin below.
  if (!SITE_KEY || !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(parent)) return notFound();

  // Any domain that serves an event page (app/site/[host] doesn't check the
  // plan or DNS status either), so every page that shows an RSVP form can
  // complete the check.
  const bare = parent.replace(/^www\./, '');
  try {
    const page = await sql`
      SELECT 1 FROM user_page
      WHERE lower(regexp_replace(custom_domain, '^www\\.', '')) = ${bare}
        AND COALESCE(status, 'active') <> 'inactive'
      LIMIT 1`;
    if (!page.rows.length) return notFound();
  } catch {
    return notFound();
  }

  const origin = `https://${parent}`;
  const nonce = randomBytes(16).toString('base64');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Security check</title>
<style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style>
</head><body>
<div id="cf"></div>
<script nonce="${nonce}">
  var target = ${JSON.stringify(origin)};
  function send(token) { parent.postMessage({ type: 'mygala-turnstile', token: token }, target); }
  window.onTurnstileLoad = function () {
    turnstile.render('#cf', {
      sitekey: ${JSON.stringify(SITE_KEY)},
      action: 'rsvp',
      callback: function (t) { send(t); },
      'expired-callback': function () { send(''); },
      'error-callback': function () { send(''); }
    });
  };
  window.addEventListener('message', function (e) {
    if (e.origin === target && e.data && e.data.type === 'mygala-turnstile-reset' && window.turnstile) turnstile.reset();
  });
</script>
<script nonce="${nonce}" src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit" async defer></script>
</body></html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': [
        "default-src 'none'",
        `script-src 'nonce-${nonce}' https://challenges.cloudflare.com`,
        "style-src 'unsafe-inline'",
        'frame-src https://challenges.cloudflare.com',
        'connect-src https://challenges.cloudflare.com',
        `frame-ancestors https://${bare} https://www.${bare}`,
        "base-uri 'none'",
        "form-action 'none'",
      ].join('; '),
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  });
}
