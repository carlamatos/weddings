import { PLAN_TOOLS, type PlanTool } from '@/app/lib/saved-plans';
import { ClearPendingPlan } from './pending-plan';

import { getDashText } from '@/app/lib/dash-text/server';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
// "Saved!" on the screen a plan from a free tool was just saved to.
export async function SavedPlanNotice({ saved }: { saved?: string }) {
  const d = await getDashText();
  if (!saved || !(saved in PLAN_TOOLS)) return null;
  const tool = PLAN_TOOLS[saved as PlanTool];
  return (
    <div role="status" style={{ background: '#EEF4EF', border: '1px solid #CFE0D3', color: '#2F5638', borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.55, marginBottom: 20 }}>
      <ClearPendingPlan />
      {rich(fill(d.savedPlanNotice.yourIsSavedItS, { thing: tool.thing }), { t0: (s) => <strong>{s}</strong> })}
    </div>
  );
}
