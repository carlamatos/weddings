import { fetchPageSettings } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { areGuestMessagesOn, GUEST_MESSAGES_SETTING } from '@/app/lib/guest-messages';
import { fetchGuestMessages } from '@/app/lib/guest-messages-data';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { PlusSetupNote } from '@/app/ui/dashboard/plus-gate';
import { MessagesManager } from '@/app/ui/dashboard/messages-manager';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
export const metadata: Metadata = { title: 'Messages Wall' };

// The live messages wall (Live Party): guests leave a short message from the
// photo section of the page; it rotates on the venue slideshow. The host
// switches it on here and can hide or delete any message.
export default async function MessagesPage({ params }: { params: Promise<{ pageId: string }> }) {
  const d = await getDashText();
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);
  const [settings, messages] = await Promise.all([fetchPageSettings(pageId), fetchGuestMessages(pageId, true, 500)]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <PlusSetupNote section="/messages" />
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.screens.messagesWall}</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 640, lineHeight: 1.6 }}>{d.messagesWall.intro}</p>
      </div>
      <SectionToggle pageId={pageId} settingName={GUEST_MESSAGES_SETTING} plusSection="/messages" initialOn={areGuestMessagesOn(settings)} />
      <MessagesManager initialMessages={messages} />
    </div>
  );
}
