'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setDashLang } from '@/app/lib/dash-text/actions';
import { DASH_LANGS } from '@/app/lib/dash-text/langs';
import { useDashText } from '@/app/ui/dashboard/dash-text';

// The dashboard's own language, in the account menu. Saved for this browser;
// each event page keeps its own language for guests.
export function DashLanguagePicker() {
  const d = useDashText();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="dash-user-menu-picker">
      <label className="mobile-menu-theme-label" htmlFor="dash-language" style={{ display: 'block' }}>{d.userMenu.dashboardLanguage}</label>
      <select
        id="dash-language"
        value={d.meta.lang}
        disabled={pending}
        onChange={(e) => {
          const lang = e.target.value;
          startTransition(async () => {
            await setDashLang(lang);
            router.refresh();
          });
        }}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: '#fff', font: 'inherit', fontSize: 14 }}
      >
        {DASH_LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </div>
  );
}
