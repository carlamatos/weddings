import { sql } from '@vercel/postgres';
import type { PlanTool } from './saved-plans';

// Saved plans (saved-plans.ts): one row per page and tool. The table is
// created on first use, so a new environment needs no setup step (it's also
// in /api/migrate).
let tableReady: Promise<unknown> | null = null;
export function ensurePlansTable(): Promise<unknown> {
  tableReady ??= sql`
    CREATE TABLE IF NOT EXISTS event_plans (
      user_page_id INTEGER NOT NULL REFERENCES user_page(id) ON DELETE CASCADE,
      tool TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_page_id, tool)
    )
  `.catch((error) => { tableReady = null; throw error; });
  return tableReady;
}

export async function fetchPlan(pageId: number, tool: PlanTool): Promise<{ data: unknown; updated_at: string } | null> {
  try {
    await ensurePlansTable();
    const { rows } = await sql<{ data: unknown; updated_at: string }>`
      SELECT data, updated_at FROM event_plans WHERE user_page_id = ${pageId} AND tool = ${tool}
    `;
    return rows[0] ?? null;
  } catch (error) {
    console.error('Failed to fetch a saved plan:', error);
    return null;
  }
}

export async function fetchPlanTools(pageId: number): Promise<PlanTool[]> {
  try {
    await ensurePlansTable();
    const { rows } = await sql<{ tool: PlanTool }>`SELECT tool FROM event_plans WHERE user_page_id = ${pageId}`;
    return rows.map((r) => r.tool);
  } catch {
    return [];
  }
}

// Callers check the page belongs to the user first.
export async function writePlan(pageId: number, tool: PlanTool, data: unknown): Promise<void> {
  await ensurePlansTable();
  const json = JSON.stringify(data);
  await sql`
    INSERT INTO event_plans (user_page_id, tool, data) VALUES (${pageId}, ${tool}, ${json}::jsonb)
    ON CONFLICT (user_page_id, tool) DO UPDATE SET data = ${json}::jsonb, updated_at = NOW()
  `;
}

export async function deletePlanRow(pageId: number, tool: PlanTool): Promise<void> {
  await ensurePlansTable();
  await sql`DELETE FROM event_plans WHERE user_page_id = ${pageId} AND tool = ${tool}`;
}
