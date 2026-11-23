import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getSuperAdmin } from '@/app/lib/admin';
import { ensureNewsletterTable } from '@/app/lib/newsletter';

// Admin → Newsletter → Remove: takes the address off the newsletter list
// entirely (the row, with its consent record, is deleted). They can join again
// later by ticking the box or using the footer form.
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await ctx.params;
  if (!/^\d{1,9}$/.test(id)) return NextResponse.json({ error: 'Invalid subscriber id.' }, { status: 400 });

  await ensureNewsletterTable();
  const res = await sql`DELETE FROM newsletter_subscribers WHERE id = ${Number(id)} RETURNING email`;
  const email = res.rows[0]?.email as string | undefined;
  if (!email) return NextResponse.json({ error: 'Subscriber not found. They may already have been removed.' }, { status: 404 });

  console.log(`Newsletter: ${admin.email} removed ${email}`);
  return NextResponse.json({ ok: true, message: `${email} was removed from the newsletter.` });
}
