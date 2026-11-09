'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { ownsPage, parsePageId } from './data';
import { pagePath } from './dashboard';
import {
  blankBudget, budgetFromHash, cleanBudget, guestPlanFromHash, parsePlanLink, PLAN_TOOLS, readBudget, readRsvpTimeline,
  rsvpTimelineFromHash, BUDGET_AMOUNT_MAX, type PlanTool,
} from './saved-plans';
import { deletePlanRow, fetchPlan, writePlan } from './saved-plans-data';
import { isCurrency } from './marketing/tool-money';

// Server actions for saved plans (saved-plans.ts). Every one checks that the
// page belongs to the signed-in user.

async function ownedPageId(pageId: unknown): Promise<number | null> {
  const session = await auth();
  const pid = parsePageId(pageId);
  if (!session?.user?.id || pid === null || !(await ownsPage(session.user.id, pid))) return null;
  return pid;
}

// "Save to my MyGala" (the /dashboard/save-plan screen): saves the tool's
// plan to the chosen page and opens the screen where it lives.
export async function savePlanFromLink(formData: FormData) {
  const pid = await ownedPageId(formData.get('pageId'));
  const link = parsePlanLink(String(formData.get('plan') ?? ''));
  if (pid === null || !link) redirect('/dashboard');
  const previous = await fetchPlan(pid, link.tool);
  let data: unknown = null;
  if (link.tool === 'budget') data = budgetFromHash(link.hash, readBudget(previous?.data));
  else if (link.tool === 'rsvp') data = rsvpTimelineFromHash(link.hash, readRsvpTimeline(previous?.data));
  else data = guestPlanFromHash(link.hash);
  if (!data) redirect('/dashboard');
  await writePlan(pid, link.tool, data);
  revalidatePath(pagePath(pid, PLAN_TOOLS[link.tool].screen));
  redirect(`${pagePath(pid, PLAN_TOOLS[link.tool].screen)}?saved=${link.tool}`);
}

// The budget tracker saves as the host edits.
export async function saveBudget(pageId: number, input: unknown): Promise<boolean> {
  const pid = await ownedPageId(pageId);
  const plan = cleanBudget(input);
  if (pid === null || !plan) return false;
  try {
    const previous = readBudget((await fetchPlan(pid, 'budget'))?.data);
    await writePlan(pid, 'budget', { ...plan, hash: previous?.hash, sent: previous?.sent ?? [] });
    return true;
  } catch (error) {
    console.error('Failed to save the budget:', error);
    return false;
  }
}

export async function startBudget(pageId: number, total: number, currency: string): Promise<boolean> {
  const pid = await ownedPageId(pageId);
  const amount = Math.round(Number(total));
  if (pid === null || !Number.isFinite(amount) || amount < 100 || amount > BUDGET_AMOUNT_MAX || !isCurrency(currency)) return false;
  await writePlan(pid, 'budget', blankBudget(amount, currency));
  revalidatePath(pagePath(pid, '/budget'));
  return true;
}

// Timeline: tick a step off, or turn the reminder emails on or off.
export async function updateTimeline(pageId: number, change: { done?: { id: string; on: boolean }; reminders?: boolean; eventDate?: string }): Promise<boolean> {
  const pid = await ownedPageId(pageId);
  if (pid === null) return false;
  const plan = readRsvpTimeline((await fetchPlan(pid, 'rsvp'))?.data);
  if (!plan) return false;
  if (change.done && /^[a-z]{1,20}$/.test(change.done.id)) {
    plan.done = change.done.on ? [...new Set([...plan.done, change.done.id])] : plan.done.filter((d) => d !== change.done!.id);
  }
  if (typeof change.reminders === 'boolean') plan.reminders = change.reminders;
  let next = plan;
  if (typeof change.eventDate === 'string') {
    // The page's date changed: the same plan, worked out from the new date.
    const moved = rsvpTimelineFromHash(`#rsvp=${change.eventDate}.${plan.type}.${plan.finalCountDays}.${plan.seating ? 1 : 0}`, plan);
    if (!moved) return false;
    next = { ...moved, sent: [] };
  }
  await writePlan(pid, 'rsvp', next);
  revalidatePath(pagePath(pid, '/timeline'));
  return true;
}

export async function deletePlan(pageId: number, tool: PlanTool): Promise<boolean> {
  const pid = await ownedPageId(pageId);
  if (pid === null || !(tool in PLAN_TOOLS)) return false;
  await deletePlanRow(pid, tool);
  revalidatePath(pagePath(pid, PLAN_TOOLS[tool].screen));
  return true;
}
