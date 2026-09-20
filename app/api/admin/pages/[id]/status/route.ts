import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getSuperAdmin } from '@/app/lib/admin';

// Deactivate / reactivate a page. Inactive pages show "unavailable" to guests.
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const pageId = Number((await ctx.params).id);
  if (!Number.isInteger(pageId) || pageId <= 0) {
    return NextResponse.json({ error: 'Invalid page id.' }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as { status?: unknown } | null;
  if (body?.status !== 'active' && body?.status !== 'inactive') {
    return NextResponse.json({ error: "status must be 'active' or 'inactive'." }, { status: 400 });
  }

  try {
    const result = await sql`UPDATE user_page SET status = ${body.status}, status_changed_at = NOW() WHERE id = ${pageId} RETURNING id`;
    if (!result.rows[0]) return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, status: body.status });
  } catch (err) {
    console.error('Page status update failed:', err);
    return NextResponse.json(
      { error: `Could not update the page (${err instanceof Error ? err.message : 'unknown error'}). If this is a new environment, run the schema setup first (POST /api/db-setup).` },
      { status: 500 },
    );
  }
}
