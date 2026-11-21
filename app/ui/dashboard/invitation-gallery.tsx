'use client';

import { useMemo, useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import type { InvitationDesign, InvitationDetails } from '@/app/lib/invitation';
import { DESIGN_GROUPS, INVITATION_CATALOG, applyLook, designGroupOf, sameLook, type CatalogDesign, type DesignGroup, type InvitationLook } from '@/app/lib/invitation-designs';
import { InvitationCard } from '@/app/ui/dashboard/invitation-card';
import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';

// Invitations → Choose a design: the catalog (app/lib/invitation-designs.ts)
// as small cards showing the host's own event and words, filtered by occasion,
// with the designs that match their website first. Plus "Upload your own" for
// a finished invitation from elsewhere.

// How many cards show before "Show all" (the upload card makes it 8).
const FIRST = 7;

export function InvitationGallery({ design, details, themeSlug, onPick, onUploadOwn, uploading }: {
  design: InvitationDesign;
  details: InvitationDetails;
  themeSlug: string | null;
  onPick: (look: InvitationLook) => void;
  onUploadOwn: () => void;
  uploading: boolean;
}) {
  const d = useDashText();
  const t = d.invitationDesigner;
  const [group, setGroup] = useState<DesignGroup | 'all'>(designGroupOf(themeSlug));
  const [showAll, setShowAll] = useState(false);

  const list = useMemo(() => {
    const inGroup = INVITATION_CATALOG.filter((x) => group === 'all' || x.group === group);
    return [...inGroup.filter((x) => x.theme === themeSlug), ...inGroup.filter((x) => x.theme !== themeSlug)];
  }, [group, themeSlug]);
  const shown = showAll ? list : list.slice(0, FIRST);

  const groupLabel: Record<DesignGroup | 'all', string> = {
    all: t.groupAll, wedding: t.groupWedding, party: t.groupParty, baby: t.groupBaby, holiday: t.groupHoliday, business: t.groupBusiness,
  };
  const variantLabel = (x: CatalogDesign) =>
    x.variant === 'photo' ? t.variantPhoto : x.variant === 'monogram' ? t.variantMonogram : x.variant === 'framed' ? t.variantFramed : '';

  return (
    <div>
      <div role="group" aria-label={t.chooseADesign} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {(['all', ...DESIGN_GROUPS] as const).map((g) => (
          <button key={g} type="button" aria-pressed={group === g} onClick={() => { setGroup(g); setShowAll(false); }}
            style={{ padding: '5px 12px', borderRadius: 999, border: `1px solid ${group === g ? '#B6584A' : '#DDD5CE'}`, background: group === g ? '#B6584A' : '#fff', color: group === g ? '#fff' : '#241F2B', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {groupLabel[g]}
          </button>
        ))}
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))', gap: 14 }}>
        <li>
          <button type="button" onClick={onUploadOwn} disabled={uploading} title={t.uploadYourOwnHint}
            style={{ width: '100%', aspectRatio: '5 / 7', border: `2px dashed ${design.layout === 'own' ? '#B6584A' : '#D9CFC8'}`, borderRadius: 6, background: '#FBF9F7', color: '#6B6470', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: 8 }}>
            <ArrowUpTrayIcon style={{ width: 22, height: 22 }} />
            {uploading ? t.uploading : t.uploadYourOwn}
          </button>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: design.layout === 'own' ? '#B6584A' : '#6B6470', fontWeight: design.layout === 'own' ? 700 : 500 }}>
            {design.layout === 'own' ? `✓ ${t.ownDesign}` : t.ownDesign}
          </p>
        </li>
        {shown.map((x) => {
          const picked = sameLook(design, x.look);
          const matches = x.theme === themeSlug;
          return (
            <li key={x.id}>
              <button type="button" aria-pressed={picked} onClick={() => onPick(x.look)}
                aria-label={`${x.themeName}${variantLabel(x) ? ` · ${variantLabel(x)}` : ''}`}
                style={{ display: 'block', width: '100%', padding: 0, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6, outline: picked ? '3px solid #B6584A' : 'none', outlineOffset: 3 }}>
                <div aria-hidden="true" style={{ pointerEvents: 'none' }}>
                  <InvitationCard design={applyLook(design, x.look)} details={details} nameAs="p" bgImage={{ loading: 'lazy', decoding: 'async' }} />
                </div>
              </button>
              <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.35, color: '#241F2B', fontWeight: picked ? 700 : 500 }}>
                {picked && <span style={{ color: '#B6584A' }}>✓ </span>}
                {x.themeName}{variantLabel(x) && <span style={{ color: '#6B6470' }}> · {variantLabel(x)}</span>}
              </p>
              {matches && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#3D6B46', fontWeight: 600 }}>{t.matchesYourWebsite}</p>}
            </li>
          );
        })}
      </ul>

      {list.length > FIRST && (
        <button type="button" onClick={() => setShowAll((v) => !v)}
          style={{ marginTop: 14, padding: '7px 14px', borderRadius: 8, border: '1px solid #DDD5CE', background: '#fff', color: '#241F2B', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {showAll ? t.showFewerDesigns : fill(t.showAllDesigns, { count: list.length })}
        </button>
      )}
    </div>
  );
}
