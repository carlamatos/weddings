import { NextResponse } from 'next/server';
import { getSuperAdmin } from '@/app/lib/admin';
import { trashUnconfirmed } from '@/app/lib/unconfirmed';
import { PURGE_BATCH_LIMIT } from '@/app/lib/retention';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const maxDuration = 300;

// Moves never-confirmed accounts and their drafts to the trash. The caller
// sends the ids it previewed plus a typed phrase; the server re-checks each.
export async function POST(req: Request) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { userIds?: unknown; confirm?: unknown } | null;
  const ids = Array.isArray(body?.userIds)
    ? [...new Set(body.userIds.filter((id): id is string => typeof id === 'string' && UUID_RE.test(id)))]
    : [];
  if (ids.length === 0 || ids.length > PURGE_BATCH_LIMIT) {
    return NextResponse.json({ error: `Choose between 1 and ${PURGE_BATCH_LIMIT} accounts.` }, { status: 400 });
  }

  const expected = `remove ${ids.length} account${ids.length === 1 ? '' : 's'}`;
  if (typeof body?.confirm !== 'string' || body.confirm.trim().toLowerCase() !== expected) {
    return NextResponse.json({ error: 'The confirmation text does not match. Nothing was changed.' }, { status: 400 });
  }

  try {
    const outcomes = await trashUnconfirmed(ids, admin.email);
    const done = outcomes.filter((o) => o.trashed);
    const skipped = outcomes.filter((o) => !o.trashed);
    return NextResponse.json({
      ok: true,
      outcomes,
      message:
        `Moved ${done.length} account${done.length === 1 ? '' : 's'} and their drafts to the trash. You can restore them from the Trash tab.` +
        (skipped.length ? ` ${skipped.length} skipped: ${skipped.map((o) => `${o.email ?? o.userId} — ${o.reason}`).join(' • ')}` : ''),
    });
  } catch (error) {
    console.error('Unconfirmed cleanup failed:', error);
    return NextResponse.json({ error: `The cleanup could not run (${error instanceof Error ? error.message : 'unknown error'}). Nothing was changed.` }, { status: 500 });
  }
}
