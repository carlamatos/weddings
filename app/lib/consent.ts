import { RESERVED_SLUGS } from './reserved-slugs';

// Cookie consent for Google's tags (Tag Manager: Analytics, Google Ads, and
// the Pinterest tag inside the container). MyGala's own cookies (sign-in,
// language, a page's password, the staging preview, the short sign-up and
// page-made notes for Google Ads) are needed for the site to work and don't
// ask. Shared by app/ui/root-document.tsx (consent defaults, then Tag
// Manager) and app/ui/cookie-banner.tsx.
//
// Google Consent Mode v2: in Quebec (Law 25), the EU/EEA, the UK and
// Switzerland, analytics and ad storage stay off until the visitor accepts;
// elsewhere they're on, and Reject turns them off. Google applies the
// region rule from the visitor's location.
//
// Guests' pages (hosts' event pages, /i/ invitation links and hosts' own
// domains) load no Google tags and show no banner: guests didn't sign up for
// MyGala, and MyGala's own visit counts there use no cookies. Nor does the
// admin area: its visits aren't MyGala's audience, and its addresses can
// hold hosts' details (a search for an email).

export const CONSENT_COOKIE = 'mg_consent';
export type ConsentChoice = 'all' | 'none';
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // a year
export const CONSENT_SETTINGS_EVENT = 'mygala:cookie-settings';

// ISO 3166 codes where tracking waits for "Accept".
export const OPT_IN_REGIONS = [
  // EU
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // EEA, UK, Switzerland, Quebec
  'IS', 'LI', 'NO', 'GB', 'CH', 'CA-QC',
];

// The first part of every MyGala page's address (the rest are hosts' pages),
// except /i/, the invitation links, which guests open.
const SITE_SECTIONS = [...RESERVED_SLUGS].filter((s) => s !== 'i');
// MyGala's own sections that load no Google tags either.
const NO_TAG_SECTIONS = ['admin'];

// MyGala's own hostnames; any other is a host's custom domain.
const OWN_HOST = /(^|\.)mygala\.ca$|^localhost$|^127\.0\.0\.1$|\.vercel\.app$/;

export function isGuestPath(hostname: string, pathname: string): boolean {
  if (!OWN_HOST.test(hostname)) return true;
  const first = (pathname.split('/')[1] ?? '').toLowerCase();
  return first !== '' && !SITE_SECTIONS.includes(first);
}

// No Google tags and no banner: guests' pages and the admin area.
export function isTagFreePath(hostname: string, pathname: string): boolean {
  const first = (pathname.split('/')[1] ?? '').toLowerCase();
  return isGuestPath(hostname, pathname) || (OWN_HOST.test(hostname) && NO_TAG_SECTIONS.includes(first));
}

// The script that runs first on every page (before React): the consent
// defaults and the visitor's saved choice, then, unless this is a guest's
// page, Tag Manager once the browser is idle. gtmId null: nothing loads (not
// the live site), but gtag() still queues, for the conversion events.
export function tagsBootScript(gtmId: string | null, adsId: string): string {
  const denied = "{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'}";
  const granted = "{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'}";
  return `(function(){
window.dataLayer=window.dataLayer||[];
window.gtag=function(){dataLayer.push(arguments);};
var D=${denied},G=${granted};
gtag('consent','default',Object.assign({wait_for_update:500,region:${JSON.stringify(OPT_IN_REGIONS)}},D));
gtag('consent','default',G);
var m=document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=(all|none)/);
if(m)gtag('consent','update',m[1]==='all'?G:D);
gtag('set','ads_data_redaction',true);
var h=location.hostname,f=(location.pathname.split('/')[1]||'').toLowerCase();
var own=${OWN_HOST.toString()}.test(h);
var guest=!own||(f!==''&&${JSON.stringify(SITE_SECTIONS)}.indexOf(f)<0);
window.__mgGuestPage=guest;
if(guest||${JSON.stringify(NO_TAG_SECTIONS)}.indexOf(f)>=0||!${JSON.stringify(gtmId)})return;
dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
gtag('js',new Date());
gtag('config',${JSON.stringify(adsId)});
var load=function(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id='+${JSON.stringify(gtmId)};document.head.appendChild(s);};
if(document.readyState==='complete'){('requestIdleCallback' in window)?requestIdleCallback(load):setTimeout(load,1);}
else addEventListener('load',function(){('requestIdleCallback' in window)?requestIdleCallback(load):setTimeout(load,1);});
})();`;
}

// Saves the visitor's choice (for www.mygala.ca and app.mygala.ca alike)
// and tells Google's tags.
export function saveConsent(choice: ConsentChoice) {
  const host = window.location.hostname;
  const domain = /(^|\.)mygala\.ca$/.test(host) ? '; domain=.mygala.ca' : '';
  document.cookie = `${CONSENT_COOKIE}=${choice}; path=/; max-age=${CONSENT_MAX_AGE}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}${domain}`;
  const on = choice === 'all' ? 'granted' : 'denied';
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  w.gtag?.('consent', 'update', { ad_storage: on, ad_user_data: on, ad_personalization: on, analytics_storage: on });
}

export function savedConsent(): ConsentChoice | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(all|none)`));
  return m ? (m[1] as ConsentChoice) : null;
}
