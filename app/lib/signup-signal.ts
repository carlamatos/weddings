import { cookies } from 'next/headers';
import { SIGNUP_COOKIE } from './signup-cookie';

// Leaves a short-lived, script-readable note that an account was just
// created, so the next page the new user sees can report a "sign_up" event
// to Google Analytics / Ads (see app/ui/signup-tracker.tsx). Holds only the
// sign-up method — no personal information.
export async function markSignUp(method: 'email' | 'google' | 'apple' | 'facebook'): Promise<void> {
  try {
    (await cookies()).set(SIGNUP_COOKIE, method, {
      maxAge: 10 * 60,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
    });
  } catch (error) {
    // Only possible outside a request that can set cookies; analytics only.
    console.error('Could not mark sign-up:', error);
  }
}
