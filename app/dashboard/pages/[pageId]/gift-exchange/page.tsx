import { auth } from '@/auth';
import { fetchGiftParticipants, fetchGuests, fetchPageSettings } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { giftExchangeDetails, isGiftExchangeOn } from '@/app/lib/gift-exchange';
import { giftRevealUrl } from '@/app/lib/gift-token';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { PlusUpgradePrompt } from '@/app/ui/dashboard/plus-upgrade-prompt';
import { GiftExchangeManager, type GiftRow } from '@/app/ui/dashboard/gift-exchange-manager';

export default async function GiftExchangePage({ params }: { params: Promise<{ pageId: string }> }) {
  const page = await requireOwnedPage(params);
  const pageId = Number(page.id);

  if (page.plan_type !== 'paid') {
    return (
      <PlusUpgradePrompt
        page={page}
        title="Gift Exchange"
        pitch="The Gift Exchange is a Plus feature. Upgrade to run a Secret Santa: guests join from your page, MyGala draws names so nobody gets themselves, and everyone finds out who they’re buying for by email, text or WhatsApp."
      />
    );
  }

  const [settings, participants, guests] = await Promise.all([fetchPageSettings(pageId), fetchGiftParticipants(pageId), fetchGuests(pageId)]);
  const byId = new Map(participants.map((p) => [p.id, p]));
  const drawn = participants.some((p) => p.giftee_id);
  const inExchange = new Set(participants.map((p) => p.guest_id).filter(Boolean));
  const emails = new Set(participants.map((p) => p.email?.toLowerCase()).filter(Boolean));

  const rows: GiftRow[] = participants.map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    phone: p.phone,
    wishlist: p.wishlist,
    fromGuestList: !!p.guest_id,
    gifteeName: p.giftee_id ? byId.get(p.giftee_id)?.name ?? null : null,
    revealUrl: p.giftee_id ? giftRevealUrl(p.id) : null,
    notifiedAt: p.notified_at,
    notifiedVia: p.notified_via,
  }));

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Gift Exchange</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          Run a Secret Santa: guests join from your page, you draw names, and everyone finds out who they&rsquo;re buying a gift
          for — by email, text or WhatsApp. Nobody draws their own name. The section appears on your page right after the RSVP.
        </p>
      </div>
      <SectionToggle pageId={pageId} settingName="show_gift_exchange" initialOn={isGiftExchangeOn(settings)} />
      <GiftExchangeManager
        pageId={pageId}
        initialDetails={giftExchangeDetails(settings)}
        participants={rows}
        guests={guests.map((g) => ({ id: g.id, name: g.name, email: g.email, inExchange: inExchange.has(g.id) || (!!g.email && emails.has(g.email.toLowerCase())) }))}
        drawn={drawn}
        eventName={page.heading || 'the event'}
        language={page.language}
        hostName={(await auth())?.user?.name?.trim() || ''}
      />
    </div>
  );
}
