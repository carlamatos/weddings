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
  // Admins must have a verified email and 2FA turned on, and this session
  // must have passed the 2FA challenge — a stolen admin password alone (or
  // an unproven signup using an admin's address) can never pass.
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !session?.user?.verifiedEmail || !isSuperAdmin(email)) return null;
  if (!session.user.totpEnabled || !session.user.totpVerified) return null;
  return { id: session.user?.id, email };
}
