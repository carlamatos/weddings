import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await sql`
    SELECT given_name, family_name, email, phone FROM users WHERE id = ${userId} LIMIT 1
  `;
  if (!result.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { given_name, family_name, email, phone } = await request.json();

  if (!given_name?.trim() || !family_name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
  }

  const name = `${given_name.trim()} ${family_name.trim()}`;

  await sql`
    UPDATE users
    SET given_name = ${given_name.trim()},
        family_name = ${family_name.trim()},
        name = ${name},
        email = ${email.trim()},
        phone = ${phone?.trim() || null}
    WHERE id = ${userId}
  `;

  return NextResponse.json({ ok: true, name });
}
