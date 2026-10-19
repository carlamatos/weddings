import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';
import { cleanPhone, isValidOptionalPhone, PHONE_INVALID_MESSAGE } from '@/app/lib/phone';

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await sql`
    SELECT given_name, family_name, email, phone,
           (password IS NOT NULL AND password != '') AS has_password,
           (totp_enabled_at IS NOT NULL) AS totp_enabled
    FROM users WHERE id = ${userId} LIMIT 1
  `;
  if (!result.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const given_name = str(body?.given_name).slice(0, 100);
  const family_name = str(body?.family_name).slice(0, 100);
  const phone = str(body?.phone);

  if (!given_name.trim() || !family_name.trim()) {
    return NextResponse.json({ error: 'Please enter your first and last name.' }, { status: 400 });
  }
  if (!isValidOptionalPhone(phone)) {
    return NextResponse.json({ error: PHONE_INVALID_MESSAGE }, { status: 400 });
  }

  const name = `${given_name.trim()} ${family_name.trim()}`;

  await sql`
    UPDATE users
    SET given_name = ${given_name.trim()},
        family_name = ${family_name.trim()},
        name = ${name},
        phone = ${cleanPhone(phone)}
    WHERE id = ${userId}
  `;

  return NextResponse.json({ ok: true, name });
}
