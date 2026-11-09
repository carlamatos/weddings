'use client';

import { createContext, useContext } from 'react';
import type { DashText } from '@/app/lib/dash-text/en';

// The dashboard text in the host's language, handed down from the shell
// (app/ui/dashboard/shell.tsx) so client components don't load every language.
const Ctx = createContext<DashText | null>(null);

export function DashTextProvider({ text, children }: { text: DashText; children: React.ReactNode }) {
  return <Ctx.Provider value={text}>{children}</Ctx.Provider>;
}

export function useDashText(): DashText {
  const text = useContext(Ctx);
  if (!text) throw new Error('useDashText() outside the dashboard shell');
  return text;
}
