import { auth } from '@/auth';

// Super admins are configured with SUPER_ADMIN_EMAILS (comma-separated).
// Unset means nobody is an admin.
export function isSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  const allowed = (process.env.SUPER_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

// For pages and API routes: returns the admin's identity, or null if the
// current session isn't a super admin. Every admin route calls this itself —
// a parent layout check doesn't protect API routes.
export async function getSuperAdmin(): Promise<{ id: string | undefined; email: string } | null> {
  // auth() already treats a session that still owes its 2FA code as signed
  // out; the email must also be verified, so an unproven signup using an
  // admin's address can never pass.
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !session?.user?.verifiedEmail || !isSuperAdmin(email)) return null;
  return { id: session.user?.id, email };
}
