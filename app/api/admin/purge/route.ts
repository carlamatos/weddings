import { NextResponse } from 'next/server';
import { getSuperAdmin } from '@/app/lib/admin';
import { parsePageId } from '@/app/lib/data';
import { purgePages } from '@/app/lib/purge';
import { PURGE_BATCH_LIMIT } from '@/app/lib/retention';

// Deleting files and rows for up to PURGE_BATCH_LIMIT pages can take a while.
export const maxDuration = 300;

// Permanently deletes long-offline pages of free-plan owners. The caller sends
// the ids it previewed plus a typed phrase; the server re-checks each page.
export async function POST(req: Request) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { pageIds?: unknown; confirm?: unknown } | null;
  const ids = Array.isArray(body?.pageIds)
    ? [...new Set(body.pageIds.map(parsePageId).filter((n): n is number => n !== null))]
    : [];
  if (ids.length === 0 || ids.length > PURGE_BATCH_LIMIT) {
    return NextResponse.json({ error: `Choose between 1 and ${PURGE_BATCH_LIMIT} pages.` }, { status: 400 });
  }

  const expected = `delete ${ids.length} page${ids.length === 1 ? '' : 's'}`;
  if (typeof body?.confirm !== 'string' || body.confirm.trim().toLowerCase() !== expected) {
    return NextResponse.json({ error: 'The confirmation text does not match. Nothing was deleted.' }, { status: 400 });
  }

  try {
    const outcomes = await purgePages(ids, admin.email);
    const purged = outcomes.filter((o) => o.purged);
    const skipped = outcomes.filter((o) => !o.purged);
    const files = purged.reduce((sum, o) => sum + o.files, 0);
    return NextResponse.json({
      ok: true,
      purged: purged.length,
      skipped: skipped.length,
      files,
      outcomes,
      message:
        `Permanently deleted ${purged.length} page${purged.length === 1 ? '' : 's'} and ${files} stored file${files === 1 ? '' : 's'}.` +
        (skipped.length
          ? ` ${skipped.length} skipped: ${skipped.map((o) => `${o.slug ? '/' + o.slug : 'page ' + o.pageId} — ${o.reason}`).join(' • ')}`
          : ''),
    });
  } catch (error) {
    console.error('Purge run failed:', error);
    return NextResponse.json(
      { error: `The purge could not run (${error instanceof Error ? error.message : 'unknown error'}). If this is a new environment, run the schema setup first (POST /api/db-setup).` },
      { status: 500 },
    );
  }
}
