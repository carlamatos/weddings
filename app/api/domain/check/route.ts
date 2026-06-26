import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@vercel/postgres';

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const result = await sql`SELECT custom_domain FROM user_page WHERE user_id = ${userId}`;
  const domain = result.rows[0]?.custom_domain;
  if (!domain) return NextResponse.json({ status: 'none' });

  const projectId = process.env.VERCEL_PROJECT_ID;
  const token = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!projectId || !token) return NextResponse.json({ status: 'pending', domain });

  const qs = teamId ? `?teamId=${teamId}` : '';
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}${qs}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) return NextResponse.json({ status: 'pending', domain });

  const data = await res.json();

  if (data.verified) {
    await sql`UPDATE user_page SET domain_status = 'active' WHERE user_id = ${userId}`;
    return NextResponse.json({ status: 'active', domain });
  }

  return NextResponse.json({ status: 'pending', domain });
}
