import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import { getSuperAdmin } from '@/app/lib/admin';
import { restoreFromTrash, runInTransaction } from '@/app/lib/trash-core';

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const trashId = Number((await ctx.params).id);
  if (!Number.isInteger(trashId) || trashId <= 0) {
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  }

  const client = await db.connect();
  try {
    const result = await runInTransaction(client, () => restoreFromTrash(client, trashId));
    if (!result.ok) {
      if ('notFound' in result) {
        return NextResponse.json({ error: 'This item is no longer in the trash.' }, { status: 404 });
      }
      return NextResponse.json(
        { error: `Cannot restore: ${result.conflicts.join(' ')} Nothing was changed.` },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true, message: `${result.email} was restored with all their data.` });
  } catch (err) {
    console.error('Restore failed:', err);
    return NextResponse.json(
      { error: `Restore failed (${err instanceof Error ? err.message : 'unknown error'}). Nothing was changed.` },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
