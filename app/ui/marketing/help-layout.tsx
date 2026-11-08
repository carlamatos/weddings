import { HELP_CATEGORIES, HELP_GUIDES } from '@/app/lib/marketing/help';
import { HelpSidebar } from './help-sidebar';

// The help centre's two columns: every topic in the left sidebar, the hub or
// the open guide on the right.

const strip = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '');

export const SIDEBAR_GUIDES = HELP_GUIDES.map((g) => ({
  slug: g.slug, title: g.title, category: g.category, plan: g.plan,
  text: strip([g.summary, g.intro ?? '', ...g.steps, ...(g.tips ?? [])].join(' ')),
}));

export function HelpLayout({ current, children }: { current?: string; children: React.ReactNode }) {
  return (
    <div className="wrap hc-layout">
      <aside className="hc-aside">
        <HelpSidebar guides={SIDEBAR_GUIDES} categories={HELP_CATEGORIES} current={current} />
      </aside>
      <div className="hc-main">{children}</div>
    </div>
  );
}
