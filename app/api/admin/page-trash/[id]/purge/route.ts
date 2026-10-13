import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getSuperAdmin } from '@/app/lib/admin';
import { purgeDeletedPage } from '@/app/lib/page-trash';

// Empties one page from the trash now, instead of waiting for its 30 days.
// The admin must type the page's address; the server re-checks it.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const trashId = Number((await ctx.params).id);
  if (!Number.isInteger(trashId) || trashId <= 0) {
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  }
  const body = (await req.json().catch(() => null)) as { confirmEmail?: unknown } | null;

  const found = await sql`SELECT slug FROM deleted_pages WHERE id = ${trashId} AND restored_at IS NULL`;
  const slug = found.rows[0]?.slug as string | undefined;
  if (!slug) return NextResponse.json({ error: 'This page is no longer in the trash.' }, { status: 404 });
  if (typeof body?.confirmEmail !== 'string' || body.confirmEmail.trim().toLowerCase() !== slug.toLowerCase()) {
    return NextResponse.json({ error: 'The page address you typed does not match. Nothing was deleted.' }, { status: 400 });
  }

  const result = await purgeDeletedPage(trashId, admin.email ?? 'admin');
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.notFound ? 404 : 500 });
  return NextResponse.json({
    ok: true,
    message: `/${result.slug} was permanently deleted, along with ${result.files} stored file${result.files === 1 ? '' : 's'}.`,
  });
}
