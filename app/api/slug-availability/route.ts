import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';
import { overRateLimit } from '@/app/lib/rate-limit';
import { isReservedSlug } from '@/app/lib/reserved-slugs';

const MAX_SLUGS = 12;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Which of the setup form's suggested page addresses are already taken (by
// another page, or reserved by the site). Signed-in users only; the create
// action re-checks, so this is a convenience, not the enforcement point.
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (await overRateLimit(`slug-check:${userId}`, 120, 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const slugs = Array.isArray(body?.slugs)
    ? [...new Set((body.slugs as unknown[]).filter((s): s is string => typeof s === 'string' && s.length <= 100 && SLUG_RE.test(s)))].slice(0, MAX_SLUGS)
    : [];
  if (!slugs.length) return NextResponse.json({ taken: [] });

  const used = await sql.query('SELECT slug FROM user_page WHERE lower(slug) = ANY($1::text[])', [slugs]);
  const usedSet = new Set(used.rows.map((r) => String(r.slug).toLowerCase()));
  return NextResponse.json({ taken: slugs.filter((s) => usedSet.has(s) || isReservedSlug(s)) });
}
