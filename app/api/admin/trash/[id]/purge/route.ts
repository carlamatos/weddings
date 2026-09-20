import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { del } from '@vercel/blob';
import { getSuperAdmin } from '@/app/lib/admin';
import { collectBlobUrls, type Snapshot } from '@/app/lib/trash-core';

// The one irreversible step: delete the user's files from Blob storage and
// remove the archive. Files go first; if any can't be deleted the archive is
// kept, so the user can still be restored and this can simply be retried.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const trashId = Number((await ctx.params).id);
  if (!Number.isInteger(trashId) || trashId <= 0) {
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as { confirmEmail?: unknown } | null;

  let trashed;
  try {
    const found = await sql`SELECT email, snapshot FROM deleted_users WHERE id = ${trashId} AND restored_at IS NULL`;
    trashed = found.rows[0];
  } catch (err) {
    console.error('Trash lookup failed:', err);
    return NextResponse.json(
      { error: `Could not read the trash (${err instanceof Error ? err.message : 'unknown error'}). If this is a new environment, run the schema setup first (POST /api/db-setup).` },
      { status: 500 },
    );
  }
  if (!trashed) return NextResponse.json({ error: 'This item is no longer in the trash.' }, { status: 404 });

  const email = String(trashed.email);
  if (typeof body?.confirmEmail !== 'string' || body.confirmEmail.trim().toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: 'The email you typed does not match. Nothing was deleted.' }, { status: 400 });
  }

  const urls = collectBlobUrls(trashed.snapshot as Snapshot);
  try {
    for (let i = 0; i < urls.length; i += 50) {
      await del(urls.slice(i, i + 50));
    }
  } catch (err) {
    console.error('Blob deletion failed:', err);
    return NextResponse.json(
      {
        error: `Could not delete their files from storage (${err instanceof Error ? err.message : 'unknown error'}). The user is still in the trash and nothing else was removed — you can try again.`,
      },
      { status: 500 },
    );
  }

  try {
    await sql`DELETE FROM deleted_users WHERE id = ${trashId}`;
  } catch (err) {
    console.error('Trash record deletion failed:', err);
    return NextResponse.json(
      { error: `Files were deleted from storage but the trash record could not be removed (${err instanceof Error ? err.message : 'unknown error'}). Try again.` },
      { status: 500 },
    );
  }
  return NextResponse.json({
    ok: true,
    message: `${email} was permanently deleted, along with ${urls.length} stored file${urls.length === 1 ? '' : 's'}.`,
  });
}
