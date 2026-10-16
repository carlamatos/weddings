import { headers } from 'next/headers';
import type { Translations } from '@/app/lib/translations';
import { clientIp, overRateLimit } from '@/app/lib/rate-limit';
import { nameWords, SEATING_QUERY_MAX } from '@/app/lib/seating';
import { findSeats, type SeatLookup } from '@/app/lib/seating-data';

const MINUTE_MS = 60 * 1000;

type Outcome = { kind: 'none' } | { kind: 'message'; text: string } | { kind: 'found'; lookup: SeatLookup };

// <page>/table (Find Your Table, Plus): the guest types their name and sees
// their table. A plain form (GET ?name=), so it works the moment the page
// opens from the QR sign, on any phone. Only matching guests' names and
// tables are shown, and nothing when the name is too common.
export default async function FindTable({
  pageId, heading, bannerImage, t, on, isOwner, backHref, query,
}: {
  pageId: number | string;
  heading: string;
  bannerImage?: string;
  t: Translations;
  on: boolean; // switched on, on a Plus page
  isOwner: boolean; // the owner can try it before it's on
  backHref: string;
  query: string;
}) {
  const name = query.trim().slice(0, SEATING_QUERY_MAX);
  const usable = on || isOwner;
  let outcome: Outcome = { kind: 'none' };

  if (usable && name) {
    if (nameWords(name).join('').length < 2) outcome = { kind: 'message', text: t.findTableTooShort };
    else if (await overRateLimit(`seat:${clientIp(await headers())}`, 40, 10 * MINUTE_MS)) outcome = { kind: 'message', text: t.findTableTooFast };
    else {
      try {
        const lookup = await findSeats(pageId, name);
        outcome = lookup.tooMany ? { kind: 'message', text: t.findTableTooMany }
          : lookup.matches.length ? { kind: 'found', lookup }
          : { kind: 'message', text: t.findTableNotFound };
      } catch (error) {
        console.error('Failed to look up a table:', error);
        outcome = { kind: 'message', text: t.errorGeneral };
      }
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 16px 48px', background: '#F6F2ED', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#241F2B', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {isOwner && !on && (
          <p style={{ fontSize: 13, lineHeight: 1.5, background: '#FFF8E7', border: '1px solid #E8D9A8', color: '#6B5200', borderRadius: 10, padding: '10px 14px', margin: '0 0 16px' }}>
            Preview: only you can use this page. Guests can look up their table once you switch on Find Your Table in your dashboard.
          </p>
        )}
        <div style={{ background: '#fff', border: '1px solid #EDE6DB', borderRadius: 18, overflow: 'hidden', boxShadow: '0 16px 40px -20px rgba(36,31,43,0.25)' }}>
          {bannerImage && (
            <div style={{ height: 132, background: '#EDE6DB' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bannerImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
          <div style={{ padding: '28px 24px 30px', textAlign: 'center' }}>
            {heading && <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: '#6B6470', margin: '0 0 6px', overflowWrap: 'anywhere' }}>{heading}</p>}
            <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 30, lineHeight: 1.15, margin: '0 0 10px' }}>{t.findTableTitle}</h1>

            {!usable ? (
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#6B6470', margin: '8px 0 0' }}>{t.findTableUnavailable}</p>
            ) : (
              <>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#6B6470', margin: '0 0 22px' }}>{t.findTableLead}</p>
                <form method="get" role="search" style={{ textAlign: 'left' }}>
                  <label htmlFor="find-table-name" style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: '#6B6470', marginBottom: 6 }}>
                    {t.findTableLabel}
                  </label>
                  <input
                    id="find-table-name"
                    name="name"
                    type="search"
                    defaultValue={name}
                    autoComplete="name"
                    autoCapitalize="words"
                    autoFocus={!name}
                    required
                    maxLength={SEATING_QUERY_MAX}
                    enterKeyHint="search"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '13px 14px', fontSize: 17, border: '1px solid #DCD3C5', borderRadius: 10, outline: 'none', fontFamily: 'inherit' }}
                  />
                  <button type="submit" style={{ marginTop: 14, width: '100%', padding: '14px 20px', border: 'none', borderRadius: 999, background: '#B6584A', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {t.findTableButton}
                  </button>
                </form>

                <div aria-live="polite">
                  {outcome.kind === 'message' && (
                    <p role="status" style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4350', background: '#F6F2ED', borderRadius: 12, padding: '14px 16px', margin: '20px 0 0', textAlign: 'left' }}>
                      {outcome.text}
                    </p>
                  )}
                  {outcome.kind === 'found' && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '22px 0 0', display: 'grid', gap: 12 }}>
                      {outcome.lookup.matches.map((m, i) => (
                        <li key={`${m.name}-${i}`} style={{ border: '1px solid #EBCFC8', background: '#FBF4F2', borderRadius: 14, padding: '18px 16px' }}>
                          <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px', overflowWrap: 'anywhere' }}>{m.name}</p>
                          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: '#8B3A2A', margin: '0 0 2px' }}>{t.findTableYourTable}</p>
                          <p style={{ fontFamily: 'Georgia, serif', fontSize: 34, lineHeight: 1.15, margin: 0, color: '#241F2B', overflowWrap: 'anywhere' }}>{m.table}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <p style={{ textAlign: 'center', margin: '20px 0 0' }}>
          <a href={backHref} style={{ fontSize: 14, color: '#8B3A2A', fontWeight: 600 }}>{t.findTableBack}</a>
        </p>
      </div>
    </main>
  );
}
