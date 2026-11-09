import { PLAN_TOOLS, type PlanTool } from '@/app/lib/saved-plans';
import { ClearPendingPlan } from './pending-plan';

// "Saved!" on the screen a plan from a free tool was just saved to.
export function SavedPlanNotice({ saved }: { saved?: string }) {
  if (!saved || !(saved in PLAN_TOOLS)) return null;
  const tool = PLAN_TOOLS[saved as PlanTool];
  return (
    <div role="status" style={{ background: '#EEF4EF', border: '1px solid #CFE0D3', color: '#2F5638', borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.55, marginBottom: 20 }}>
      <ClearPendingPlan />
      <strong>Your {tool.thing} is saved.</strong> It&rsquo;s here whenever you need it, and you can change it any time.
    </div>
  );
}
