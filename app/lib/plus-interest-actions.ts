'use server';

import { auth } from '@/auth';
import { fetchOwnedPage, parsePageId } from './data';
import { plusSection, recordPlusInterest } from './plus-interest';

// The Live Party box opened on one of the host's own free pages
// (app/ui/dashboard/plus-gate.tsx). Nothing comes back: it's only recorded.
export async function markPlusBoxOpened(pageId: unknown, section: unknown): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  const id = parsePageId(pageId);
  if (!userId || id === null) return;
  const page = await fetchOwnedPage(userId, id).catch(() => null);
  if (!page || page.plan_type === 'paid') return;
  await recordPlusInterest(userId, id, 'box', plusSection(section));
}
