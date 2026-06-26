import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = await req.json();
  const correct = process.env.CONSTRUCTION_PASSWORD;

  if (!correct || password !== correct) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('site_bypass', correct, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  return res;
}
