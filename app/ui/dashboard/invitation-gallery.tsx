'use client';

import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import type { InvitationDesign, InvitationDetails } from '@/app/lib/invitation';
import { DESIGN_GROUPS, INVITATION_CATALOG, applyLook, designGroupOf, sameLook, type CatalogDesign, type DesignGroup, type InvitationLook } from '@/app/lib/invitation-designs';
import { InvitationCard } from '@/app/ui/dashboard/invitation-card';
import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';

// Invitations → Choose a design: the catalog (app/lib/invitation-designs.ts)
// as small cards showing the host's own event and words, filtered by occasion,
// with the designs that match their website first. Plus "Upload your own" for
// a finished invitation from elsewhere. In pages: 12 cards on a computer, 6 on
// a phone (the upload card is the first on page 1).

const PER_PAGE = 12, PER_PAGE_PHONE = 6;
const PHONE = '(max-width: 640px)';

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
  // Where the host is in the list (the upload card is place 0), so turning a
  // phone or resizing keeps the same designs in view.
  const [anchor, setAnchor] = useState(() => {
    // Start on the page with the host's chosen design.
    const g = designGroupOf(themeSlug);
    const inGroup = INVITATION_CATALOG.filter((x) => x.group === g);
    const ordered = [...inGroup.filter((x) => x.style), ...inGroup.filter((x) => !x.style && x.theme === themeSlug), ...inGroup.filter((x) => !x.style && x.theme !== themeSlug)];
    return Math.max(0, ordered.findIndex((x) => sameLook(design, x.look)) + 1);
  });
  const phone = useSyncExternalStore(
    (on) => { const mq = window.matchMedia(PHONE); mq.addEventListener('change', on); return () => mq.removeEventListener('change', on); },
    () => window.matchMedia(PHONE).matches,
    () => false,
  );
  const top = useRef<HTMLDivElement>(null);

  const list = useMemo(() => {
    const inGroup = INVITATION_CATALOG.filter((x) => group === 'all' || x.group === group);
    // Styles first, then the designs from the host's theme, then the rest.
    return [...inGroup.filter((x) => x.style), ...inGroup.filter((x) => !x.style && x.theme === themeSlug), ...inGroup.filter((x) => !x.style && x.theme !== themeSlug)];
  }, [group, themeSlug]);
  // The upload card takes the first place, so it counts towards page 1.
  const per = phone ? PER_PAGE_PHONE : PER_PAGE;
  const pages = Math.max(1, Math.ceil((list.length + 1) / per));
  const current = Math.min(Math.floor(anchor / per), pages - 1);
  const from = current * per;
  const shown = list.slice(Math.max(0, from - 1), from + per - 1);
  const goTo = (p: number) => {
    setAnchor(p * per);
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  // The page numbers: all when few, else the first, the last and those
  // around the current one, with gaps.
  const numbers: (number | 'gap')[] = [];
  for (let i = 0; i < pages; i++) {
    if (pages <= 7 || i === 0 || i === pages - 1 || Math.abs(i - current) <= 1) numbers.push(i);
    else if (numbers[numbers.length - 1] !== 'gap') numbers.push('gap');
  }
  const pill = (on: boolean, disabled = false) => ({
    minWidth: 34, padding: '6px 10px', borderRadius: 8, border: `1px solid ${on ? '#B6584A' : '#DDD5CE'}`, background: on ? '#B6584A' : '#fff',
    color: on ? '#fff' : '#241F2B', fontSize: 13, fontWeight: 600, cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit', opacity: disabled ? 0.4 : 1,
  } as const);

  const groupLabel: Record<DesignGroup | 'all', string> = {
    all: t.groupAll, wedding: t.groupWedding, party: t.groupParty, baby: t.groupBaby, holiday: t.groupHoliday, business: t.groupBusiness,
  };
  const nameOf = (x: CatalogDesign) => (x.style ? t.styles[x.style] : x.themeName);
  const variantLabel = (x: CatalogDesign) =>
    x.tone ? t.tones[x.tone] : x.variant === 'photo' ? t.variantPhoto : x.variant === 'monogram' ? t.variantMonogram : x.variant === 'framed' ? t.variantFramed : '';

  return (
    <div ref={top} style={{ scrollMarginTop: 80 }}>
      <div role="group" aria-label={t.chooseADesign} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {(['all', ...DESIGN_GROUPS] as const).map((g) => (
          <button key={g} type="button" aria-pressed={group === g} onClick={() => { setGroup(g); setAnchor(0); }}
            style={{ padding: '5px 12px', borderRadius: 999, border: `1px solid ${group === g ? '#B6584A' : '#DDD5CE'}`, background: group === g ? '#B6584A' : '#fff', color: group === g ? '#fff' : '#241F2B', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {groupLabel[g]}
          </button>
        ))}
      </div>

      {/* At most 6 per row (2 rows of 12 per page), growing with the space; narrower screens fit as many 112px cards as they can. */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(max(112px, calc((100% - 70px) / 6)), 1fr))', gap: 14 }}>
        {current === 0 && <li>
          <button type="button" onClick={onUploadOwn} disabled={uploading} title={t.uploadYourOwnHint}
            style={{ width: '100%', aspectRatio: '5 / 7', border: `2px dashed ${design.layout === 'own' ? '#B6584A' : '#D9CFC8'}`, borderRadius: 6, background: '#FBF9F7', color: '#6B6470', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: 8 }}>
            <ArrowUpTrayIcon style={{ width: 22, height: 22 }} />
            {uploading ? t.uploading : t.uploadYourOwn}
          </button>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: design.layout === 'own' ? '#B6584A' : '#6B6470', fontWeight: design.layout === 'own' ? 700 : 500 }}>
            {design.layout === 'own' ? `✓ ${t.ownDesign}` : t.ownDesign}
          </p>
        </li>}
        {shown.map((x) => {
          const picked = sameLook(design, x.look);
          const matches = !x.style && x.theme === themeSlug;
          return (
            <li key={x.id}>
              <button type="button" aria-pressed={picked} onClick={() => onPick(x.look)}
                aria-label={`${nameOf(x)}${variantLabel(x) ? ` · ${variantLabel(x)}` : ''}`}
                style={{ display: 'block', width: '100%', padding: 0, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6, outline: picked ? '3px solid #B6584A' : 'none', outlineOffset: 3 }}>
                <div aria-hidden="true" style={{ pointerEvents: 'none' }}>
                  <InvitationCard design={applyLook(design, x.look)} details={details} nameAs="p" bgImage={{ loading: 'lazy', decoding: 'async' }} />
                </div>
              </button>
              <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.35, color: '#241F2B', fontWeight: picked ? 700 : 500 }}>
                {picked && <span style={{ color: '#B6584A' }}>✓ </span>}
                {nameOf(x)}{variantLabel(x) && <span style={{ color: '#6B6470' }}> · {variantLabel(x)}</span>}
              </p>
              {matches && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#3D6B46', fontWeight: 600 }}>{t.matchesYourWebsite}</p>}
            </li>
          );
        })}
      </ul>

      {pages > 1 && (
        <nav aria-label={t.designPages} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginTop: 18 }}>
          <button type="button" onClick={() => goTo(current - 1)} disabled={current === 0} aria-label={t.previousPage} style={pill(false, current === 0)}>{phone ? '‹' : `‹ ${t.previousPage}`}</button>
          {numbers.map((n, i) => n === 'gap'
            ? <span key={`gap${i}`} aria-hidden="true" style={{ color: '#6B6470', padding: '0 2px' }}>…</span>
            : <button key={n} type="button" onClick={() => goTo(n)} aria-current={n === current ? 'page' : undefined} aria-label={fill(t.pageNumber, { page: n + 1 })} style={pill(n === current)}>{n + 1}</button>)}
          <button type="button" onClick={() => goTo(current + 1)} disabled={current === pages - 1} aria-label={t.nextPage} style={pill(false, current === pages - 1)}>{phone ? '›' : `${t.nextPage} ›`}</button>
          <span role="status" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{fill(t.pageOf, { page: current + 1, pages })}</span>
        </nav>
      )}
    </div>
  );
}
