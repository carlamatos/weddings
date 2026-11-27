import { COMPANY } from '@/app/lib/company';

// MyGala's own profiles (COMPANY.profiles) as round icons in the site
// footer: soft outline in the page's ink, filling with rose on hover. Only
// profiles with an icon here are shown; add a network below to show its own.

type Network = { name: string; match: RegExp; icon: React.ReactNode };

const NETWORKS: Network[] = [
  {
    name: 'YouTube',
    match: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    match: /(^|\.)instagram\.com$/,
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    match: /(^|\.)facebook\.com$/,
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.86.25-1.45 1.5-1.45h1.5V4.5a20 20 0 0 0-2.2-.12c-2.2 0-3.7 1.34-3.7 3.8v2.32H8.1v3h2.5V21h2.9Z" />
      </svg>
    ),
  },
  {
    name: 'Pinterest',
    match: /(^|\.)pinterest\.[a-z.]+$/,
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M12 2.5a9.5 9.5 0 0 0-3.46 18.35c-.08-.75-.16-1.9.03-2.72l1.13-4.8s-.29-.58-.29-1.43c0-1.34.78-2.34 1.75-2.34.82 0 1.22.62 1.22 1.36 0 .83-.53 2.07-.8 3.22-.23.96.48 1.75 1.43 1.75 1.72 0 3.04-1.81 3.04-4.43 0-2.32-1.67-3.94-4.04-3.94-2.75 0-4.37 2.06-4.37 4.2 0 .83.32 1.72.72 2.2.08.1.09.18.07.28l-.27 1.1c-.04.18-.14.22-.33.13-1.2-.56-1.96-2.32-1.96-3.74 0-3.04 2.21-5.84 6.38-5.84 3.35 0 5.95 2.39 5.95 5.58 0 3.33-2.1 6.01-5.01 6.01-.98 0-1.9-.51-2.21-1.11l-.6 2.29c-.22.84-.81 1.9-1.2 2.54A9.5 9.5 0 1 0 12 2.5Z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    match: /(^|\.)tiktok\.com$/,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M16.6 3h-3.1v12.2a2.7 2.7 0 1 1-2.7-2.7c.28 0 .55.04.8.12V9.45a5.9 5.9 0 1 0 5 5.83V9.1a7.6 7.6 0 0 0 4.4 1.4V7.4a4.4 4.4 0 0 1-4.4-4.4Z" />
      </svg>
    ),
  },
];

function networkOf(url: string): Network | undefined {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return NETWORKS.find((n) => n.match.test(host));
  } catch {
    return undefined;
  }
}

const FOLLOW = { en: 'MyGala on', fr: 'MyGala sur', es: 'MyGala en' } as const;

export default function SocialLinks({ lang = 'en' }: { lang?: keyof typeof FOLLOW }) {
  const links = COMPANY.profiles.map((url) => ({ url, network: networkOf(url) })).filter((l) => l.network);
  if (!links.length) return null;
  return (
    <div className="footer-social">
      {links.map(({ url, network }) => (
        <a key={url} href={url} target="_blank" rel="noopener noreferrer me" aria-label={`${FOLLOW[lang]} ${network!.name}`} title={network!.name}>
          {network!.icon}
        </a>
      ))}
    </div>
  );
}
