import { cookies } from 'next/headers';
import { PAGE_CREATED_COOKIE, SIGNUP_COOKIE } from './signup-cookie';

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

// The same for a new event page: its event type, theme and plan (free or
// plus), for an "event_page_created" event. Nothing personal either.
export async function markPageCreated(page: { eventType: string; theme: string; plan: 'free' | 'plus' }): Promise<void> {
  try {
    (await cookies()).set(PAGE_CREATED_COOKIE, JSON.stringify(page), {
      maxAge: 60 * 60, // long enough to come back from Plus checkout
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
    });
  } catch (error) {
    console.error('Could not mark page created:', error);
  }
}
