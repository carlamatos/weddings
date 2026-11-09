import { cookies, headers } from 'next/headers';
import { DASH_LANG_COOKIE, isDashLang, type DashLang } from './langs';
import { en, type DashText } from './en';
import { fr } from './fr';
import { es } from './es';

const TEXT: Record<DashLang, DashText> = { en, fr, es };

// The host's choice, or else the browser's first language we have.
export async function getDashLang(): Promise<DashLang> {
  const saved = (await cookies()).get(DASH_LANG_COOKIE)?.value;
  if (isDashLang(saved)) return saved;
  const accept = (await headers()).get('accept-language') ?? '';
  for (const part of accept.split(',')) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (isDashLang(code)) return code;
  }
  return 'en';
}

// The dashboard text for server components; client components use
// useDashText() (app/ui/dashboard/dash-text.tsx).
export async function getDashText(): Promise<DashText> {
  return TEXT[await getDashLang()];
}

// From a server action at sign-up: the French or Spanish sign-up page starts
// the dashboard in that language, unless this browser already chose one.
export async function rememberDashLang(lang: string | undefined) {
  if (lang !== 'fr' && lang !== 'es') return;
  const jar = await cookies();
  if (isDashLang(jar.get(DASH_LANG_COOKIE)?.value)) return;
  jar.set(DASH_LANG_COOKIE, lang, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
}

// The language this browser chose or brought from the sign-up page, if any
// (not the browser's own language): for emails sent during sign-in.
export async function savedDashLang(): Promise<DashLang> {
  try {
    const saved = (await cookies()).get(DASH_LANG_COOKIE)?.value;
    return isDashLang(saved) ? saved : 'en';
  } catch {
    return 'en'; // outside a request
  }
}
