'use client';

import { ArrowDownIcon, LinkIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useDashText } from '@/app/ui/dashboard/dash-text';
import { DraftNote, ShareLinkButtons } from '@/app/ui/dashboard/quick-share';

// The empty guest list's start (Guests & RSVPs): hosts often think they must type in every
// guest before anyone can RSVP. Sharing the link is enough (guests who RSVP
// join the list by themselves); the list is for personal invitations,
// reminders and seeing who hasn't replied. With "Only guests on my guest
// list can RSVP" on, the list comes first, so only that way is offered.
export function GuestListStart({ pageId, url, title, draft, listOnly }: { pageId: number; url: string; title: string; draft: boolean; listOnly: boolean }) {
  const d = useDashText();
  const t = d.guestListStart;
  return (
    <section style={{ border: '1px solid #E6D3CD', borderRadius: 12, padding: '18px 20px', marginBottom: 24, background: '#FBF5F3' }}>
      {listOnly ? (
        <>
          <h2 style={heading}>{t.onlyGuestsOnYourList}</h2>
          <p style={{ ...text, margin: '0 0 14px' }}>{t.youVeTurnedOn}</p>
          <a href="#add-guests" style={addBtn}>{t.addGuests}<ArrowDownIcon style={arrow} /></a>
        </>
      ) : (
        <>
          <h2 style={{ ...heading, marginBottom: 16 }}>{t.twoWaysToCollectYour}</h2>
          <div style={way}>
            <span style={badge} aria-hidden="true"><LinkIcon style={badgeIcon} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={wayTitle}>1. {t.shareYourLinkQuickest}</h3>
              <p style={{ ...text, margin: '0 0 12px' }}>{t.postYourPageInA}</p>
              {draft && <DraftNote />}
              <ShareLinkButtons pageId={pageId} url={url} title={title} />
            </div>
          </div>
          <div style={{ ...way, borderTop: '1px solid #EAD9D3', paddingTop: 16, marginTop: 18 }}>
            <span style={badge} aria-hidden="true"><UserPlusIcon style={badgeIcon} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={wayTitle}>2. {t.addYourGuestsHere}</h3>
              <p style={{ ...text, margin: '0 0 12px' }}>{t.usefulIfYouWantTo}</p>
              <a href="#add-guests" style={addBtn}>{t.addGuests}<ArrowDownIcon style={arrow} /></a>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

const heading: React.CSSProperties = { fontSize: 17, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' };
const text: React.CSSProperties = { fontSize: 14, color: '#6B6470', lineHeight: 1.6, maxWidth: 640 };
const way: React.CSSProperties = { display: 'flex', gap: 14, alignItems: 'flex-start' };
const wayTitle: React.CSSProperties = { fontSize: 15, fontWeight: 600, color: '#241F2B', margin: '4px 0 4px' };
const badge: React.CSSProperties = { flexShrink: 0, display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: '50%', background: '#fff', border: '1px solid #E6D3CD', color: '#B6584A' };
const badgeIcon = { width: 17, height: 17 };
const arrow = { width: 15, height: 15 };
const addBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 8, background: '#fff', color: '#241F2B',
  border: '1px solid #DDD5CE', fontSize: 14, fontWeight: 600, textDecoration: 'none',
};
