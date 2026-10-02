import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { DBUser } from './definitions';
import { markPasswordChanged } from './session-revocation';

// Server-only helpers for user rows. Deliberately NOT in actions.ts: every
// export of a 'use server' file is callable from the browser, and creating
// pre-verified accounts must only ever happen inside the sign-in flow.

const OAuthUser = z.object({
  name: z.string().max(200),
  email: z.string().email().max(320),
  given_name: z.string().max(100),
  family_name: z.string().max(100),
  provider: z.string().max(40),
  provider_id: z.string().max(200),
  picture: z.string().max(2000),
});

// First sign-in through Google / Apple / Facebook. The provider has already
// proven control of the email address, so the account starts verified.
export async function createOAuthUser(user: Omit<DBUser, 'id' | 'password'>): Promise<void> {
  const parsed = OAuthUser.safeParse({ ...user, picture: user.picture ?? '' });
  if (!parsed.success) {
    console.error('OAuth user rejected:', parsed.error.flatten().fieldErrors);
    return;
  }
  const { name, email, given_name, family_name, provider, provider_id, picture } = parsed.data;
  const date = new Date().toISOString().split('T')[0];
  try {
    await sql`
      INSERT INTO users (name, email, date, given_name, family_name, provider, provider_id, picture, email_verified_at)
      VALUES (${name}, ${email}, ${date}, ${given_name}, ${family_name}, ${provider}, ${provider_id}, ${picture}, NOW())
    `;
  } catch (error) {
    console.error('Failed to create OAuth user:', error);
  }
}

// An OAuth sign-in for an email that already has an unverified password
// account: someone else may have registered that address first (they never
// proved they own it). The provider just proved the real owner does, so
// verify the account and drop the unproven password — otherwise whoever set
// it could keep signing in alongside the owner.
export async function claimUnverifiedAccount(email: string): Promise<void> {
  const result = await sql`
    UPDATE users SET password = '', email_verified_at = NOW()
    WHERE email = ${email} AND email_verified_at IS NULL
  `;
  // ...and sign out whoever was using that password.
  if (result.rowCount) await markPasswordChanged({ email });
}
