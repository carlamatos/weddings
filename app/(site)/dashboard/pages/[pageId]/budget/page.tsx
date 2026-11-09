import { requireOwnedPage } from '@/app/lib/dashboard';
import { siteHref } from '@/app/lib/app-url';
import { readBudget } from '@/app/lib/saved-plans';
import { fetchPlan } from '@/app/lib/saved-plans-data';
import { BudgetTracker } from '@/app/ui/dashboard/budget-tracker';
import { SavedPlanNotice } from '@/app/ui/dashboard/saved-plan-notice';
import { HelpLink } from '@/app/ui/dashboard/help-link';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
export const metadata: Metadata = { title: 'Budget' };

// Planning → Budget: the budget tracker (saved-plans.ts). Free.
export default async function BudgetPage({ params, searchParams }: { params: Promise<{ pageId: string }>; searchParams: Promise<{ saved?: string }> }) {
  const d = await getDashText();
  const [page, { saved }] = await Promise.all([requireOwnedPage(params), searchParams]);
  const pageId = Number(page.id);
  const plan = readBudget((await fetchPlan(pageId, 'budget'))?.data);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <SavedPlanNotice saved={saved} />
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.budget.budget}</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          {d.budget.keepYourBudgetNextTo}
          {' '}<HelpLink guide="track-your-budget" />
        </p>
      </div>
      <BudgetTracker pageId={pageId} initial={plan} calculatorHref={siteHref(`/wedding-budget-calculator${plan?.hash ?? ''}`)} />
    </div>
  );
}
