import { getHelpGuide } from '@/app/lib/marketing/help';
import { siteHref } from '@/app/lib/app-url';

// "How does this work?" at the end of a dashboard screen's description: opens
// that screen's help centre guide (/help/<slug>) in a new tab so the
// dashboard stays put. Same idea as PlanningToolTip, for the how-to.
export function HelpLink({ guide }: { guide: string }) {
  const g = getHelpGuide(guide);
  if (!g) return null;
  return (
    <a href={siteHref(`/help/${g.slug}`)} target="_blank" rel="noopener" title={`Help centre: ${g.title}`}
      style={{ color: '#B6584A', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
      How does this work? ↗
    </a>
  );
}
