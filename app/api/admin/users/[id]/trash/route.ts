import { NextResponse } from 'next/server';
import { db, sql } from '@vercel/postgres';
import { getSuperAdmin, isSuperAdmin } from '@/app/lib/admin';
import { checkUserDeletable } from '@/app/lib/subscriptions';
import { moveUserToTrash, runInTransaction } from '@/app/lib/trash-core';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// "Delete" a user = move them to the trash (fully restorable). Refused while
// they have an active Stripe subscription.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Invalid user id.' }, { status: 400 });

  const body = (await req.json().catch(() => null)) as { confirmEmail?: unknown } | null;

  const found = await sql`SELECT id, email FROM users WHERE id = ${id}`;
  const user = found.rows[0];
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

  const email = String(user.email);
  if (typeof body?.confirmEmail !== 'string' || body.confirmEmail.trim().toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: 'The email you typed does not match. Nothing was changed.' }, { status: 400 });
  }
  if (admin.id === id || isSuperAdmin(email)) {
    return NextResponse.json({ error: 'Super admin accounts cannot be deleted.' }, { status: 400 });
  }

  const check = await checkUserDeletable(id);
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 409 });

  const client = await db.connect();
  try {
    await runInTransaction(client, () => moveUserToTrash(client, id, admin.email));
  } catch (err) {
    console.error('Move to trash failed:', err);
    return NextResponse.json(
      { error: `Could not move the user to the trash (${err instanceof Error ? err.message : 'unknown error'}). Nothing was changed.` },
      { status: 500 },
    );
  } finally {
    client.release();
  }

  return NextResponse.json({
    ok: true,
    message: `${email} was moved to the trash. You can restore them any time from the Trash tab.`,
  });
}
