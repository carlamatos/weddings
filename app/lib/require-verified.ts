import { auth } from '@/auth';
import type { Session } from 'next-auth';

// Mirrors getSuperAdmin()'s pattern (app/lib/admin.ts): a parent layout check
// doesn't protect API routes, so any sensitive route calls this itself.
export async function requireEmailVerified(): Promise<{ id: string; email: string } | null> {
  const session = await auth();
  const id = session?.user?.id;
  const email = session?.user?.email;
  if (!id || !email || !session?.user?.verifiedEmail) return null;
  return { id, email };
}

// Until its email is verified an account can build everything — pages,
// invitations, its guest list — but nothing that reaches anyone else:
// publishing a page (new pages stay drafts), sending emails (invitations,
// tests, Secret Santa), texting invitation links, connecting a domain, or
// uploading more than a few photos. Each of those calls this and answers
// with VERIFY_EMAIL_FIRST.
export async function isEmailVerified(): Promise<boolean> {
  const session = await auth();
  return !!session?.user?.verifiedEmail;
}

export const VERIFY_EMAIL_FIRST = 'Please verify your email address first. Check your inbox for our link, or send a new one from the banner at the top of your dashboard.';

// Photos an unverified account may upload in a day.
export const UNVERIFIED_UPLOADS_PER_DAY = 20;

// True once the account has 2FA enabled but hasn't completed the challenge
// for this session (or it's stale — see auth.ts's TOTP_VERIFIED_TTL_MS).
// Unlike email verification there's no soft/grace period: an account that
// opted into 2FA is never allowed partial access without it.
export function needsTotpChallenge(session: Session | null): boolean {
  return !!session?.user?.totpEnabled && !session?.user?.totpVerified;
}
