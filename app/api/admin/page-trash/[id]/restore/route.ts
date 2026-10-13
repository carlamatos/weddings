import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import { getSuperAdmin } from '@/app/lib/admin';
import { runInTransaction } from '@/app/lib/trash-core';
import { restorePageFromTrash } from '@/app/lib/page-trash-core';

// Puts a page an owner deleted back exactly as it was, under its owner.
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const trashId = Number((await ctx.params).id);
  if (!Number.isInteger(trashId) || trashId <= 0) {
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  }

  const client = await db.connect();
  try {
    const result = await runInTransaction(client, () => restorePageFromTrash(client, trashId));
    if (!result.ok) {
      if ('notFound' in result) {
        return NextResponse.json({ error: 'This page is no longer in the trash.' }, { status: 404 });
      }
      return NextResponse.json({ error: `Cannot restore: ${result.conflicts.join(' ')} Nothing was changed.` }, { status: 409 });
    }
    return NextResponse.json({
      ok: true,
      message: `/${result.slug} was restored with all its data${result.ownerEmail ? ` for ${result.ownerEmail}` : ''}.`,
    });
  } catch (err) {
    console.error('Page restore failed:', err);
    return NextResponse.json(
      { error: `Restore failed (${err instanceof Error ? err.message : 'unknown error'}). Nothing was changed.` },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
