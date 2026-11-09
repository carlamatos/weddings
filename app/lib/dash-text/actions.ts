'use server';

import { cookies } from 'next/headers';
import { DASH_LANG_COOKIE, isDashLang } from './langs';

// Saves the dashboard language for this browser for a year.
export async function setDashLang(lang: string) {
  if (!isDashLang(lang)) return;
  (await cookies()).set(DASH_LANG_COOKIE, lang, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
}
