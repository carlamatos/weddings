'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clearPendingPlan, PLAN_TOOLS, planParam, readPendingPlan, savePendingPlan, type PlanLink } from '@/app/lib/saved-plans';

// A plan from a free planning tool that's waiting to be saved (the visitor
// signed up first): the dashboard offers to save it to the event on screen.
export function PendingPlanBanner({ pageId }: { pageId: number }) {
  const [plan, setPlan] = useState<PlanLink | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser storage is only readable after hydration
    setPlan(readPendingPlan());
  }, []);
  if (!plan) return null;
  const tool = PLAN_TOOLS[plan.tool];
  return (
    <div role="status" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap',
      background: '#EEF4EF', border: '1px solid #CFE0D3', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, lineHeight: 1.55,
    }}>
      <span style={{ color: '#241F2B' }}>
        <strong>You made a {tool.thing} with our {tool.name.toLowerCase()}.</strong> Save it to this event to keep it in your dashboard.
      </span>
      <span style={{ display: 'flex', gap: 8 }}>
        <Link href={`/dashboard/save-plan?plan=${planParam(plan.hash)}&page=${pageId}`}
          style={{ padding: '8px 16px', borderRadius: 8, background: '#3D6B46', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Save it
        </Link>
        <button type="button" onClick={() => { clearPendingPlan(); setPlan(null); }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #CFE0D3', background: 'transparent', color: '#3D6B46', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Not now
        </button>
      </span>
    </div>
  );
}

// On the save screen when the account has no event page yet: the plan waits
// in this browser while they make one.
export function KeepPendingPlan({ plan }: { plan: PlanLink }) {
  useEffect(() => { savePendingPlan(plan); }, [plan]);
  return null;
}

// After saving: the plan no longer needs to wait.
export function ClearPendingPlan() {
  useEffect(() => { clearPendingPlan(); }, []);
  return null;
}
