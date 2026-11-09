import { getHelpGuide } from '@/app/lib/marketing/help';
import { siteHref } from '@/app/lib/app-url';

import { getDashText } from '@/app/lib/dash-text/server';
import { fill } from '@/app/lib/dash-text/fill';
// "How does this work?" at the end of a dashboard screen's description: opens
// that screen's help centre guide (/help/<slug>) in a new tab so the
// dashboard stays put. Same idea as PlanningToolTip, for the how-to.
export async function HelpLink({ guide }: { guide: string }) {
  const d = await getDashText();
  const g = getHelpGuide(guide);
  if (!g) return null;
  return (
    <a href={siteHref(`/help/${g.slug}`)} target="_blank" rel="noopener" title={fill(d.helpLink.helpCentre, { title: g.title })}
      style={{ color: '#B6584A', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
      {d.helpLink.howDoesThisWork}
    </a>
  );
}
