import { Fragment, type ReactNode } from 'react';
import Link from 'next/link';
import { LIVE_PARTY_PATH } from '@/app/lib/marketing/live-party';

// Renders the light markup marketing copy uses: [link text](/path) and
// **bold**. `liveParty` links the first mention of "Live Party" to the Live
// Party page (the Spanish one on /es pages); pass false on that page itself.
export function Rich({ text, liveParty = LIVE_PARTY_PATH }: { text: string; liveParty?: string | false }) {
  const source = liveParty ? linkLiveParty(text, liveParty) : text;
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*/g;
  let last = 0;
  for (let m = re.exec(source); m; m = re.exec(source)) {
    if (m.index > last) parts.push(source.slice(last, m.index));
    if (m[1] !== undefined) {
      // Links can hold bold text, e.g. **[Invitations](/features/invitations)**.
      parts.push(<Link key={m.index} href={m[2]}>{m[1]}</Link>);
    } else {
      parts.push(<strong key={m.index}><Rich text={m[3]} liveParty={false} /></strong>);
    }
    last = m.index + m[0].length;
  }
  if (last < source.length) parts.push(source.slice(last));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}

// Turns the first "Live Party" that isn't already inside a [link](…) into a
// link to `href`. Text that already links to the page is left as it is.
export function linkLiveParty(text: string, href: string): string {
  if (text.includes(`](${href})`)) return text;
  const links = [...text.matchAll(/\[[^\]]*\]\([^)]*\)/g)].map((m) => [m.index!, m.index! + m[0].length]);
  const re = /Live Party/g;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const at = m.index;
    if (links.some(([a, b]) => at >= a && at < b)) continue;
    return `${text.slice(0, at)}[Live Party](${href})${text.slice(at + m[0].length)}`;
  }
  return text;
}
