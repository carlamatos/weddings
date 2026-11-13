import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';
import { fetchUserPage, fetchPageSettings } from '@/app/lib/data';
import { isPageDraft, isPageOffline } from '@/app/lib/page-status';
import { isPageLocked } from '@/app/lib/page-password';
import { LOCKED_PAGE_METADATA, mustShowPasswordGate } from '@/app/lib/page-gate';
import { signPageId } from '@/app/lib/page-token';
import { getTranslations, localizeDate } from '@/app/lib/translations';
import { ensureLiveTables } from '@/app/lib/live-db';
import { fetchGuestMessages } from '@/app/lib/guest-messages-data';
import { publicPageUrl } from '@/app/lib/share';
import PageUnavailable from '@/app/ui/page-unavailable';
import PagePasswordGate from '@/app/ui/page-password-gate';

// mygala.ca/<slug>/memories — the keepsake after the event (Live Party): the
// guests' photos, the messages from the live wall and the most-voted songs,
// for as long as the Live Party term lasts. Photos and messages the host hid
// stay out. Follows the page's password and language.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = await fetchUserPage((await params).slug);
  if (!page) return {};
  const settings = await fetchPageSettings(page.id);
  if (isPageLocked(settings, page.plan_type === 'paid')) return LOCKED_PAGE_METADATA;
  const t = getTranslations(page.language || 'en');
  return { title: { absolute: `${t.memTitle} · ${page.heading}` }, robots: { index: false, follow: false } };
}

export default async function MemoriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, session] = await Promise.all([params, auth()]);
  const page = await fetchUserPage(slug);
  if (!page) notFound();
  const isOwner = session?.user?.id === page.user_id;
  if (isPageOffline(page.status || 'active') && !(isPageDraft(page.status) && isOwner)) return <PageUnavailable draft={isPageDraft(page.status)} />;
  const isPaid = page.plan_type === 'paid';
  const t = getTranslations(page.language || 'en');
  const settings = await fetchPageSettings(page.id);
  if (await mustShowPasswordGate(page.id, settings, isPaid, isOwner)) return <PagePasswordGate token={signPageId(page.id)} t={t} />;
  if (!isPaid) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#F6F2ED', fontFamily: 'system-ui, sans-serif', textAlign: 'center', color: '#6B6470' }}>
        <p style={{ fontSize: 17, maxWidth: 460, lineHeight: 1.6 }}>
          {t.memUnavailable}{isOwner && ' The memories page is part of MyGala Live Party.'}
        </p>
      </main>
    );
  }

  await ensureLiveTables();
  const [photos, messages, songs] = await Promise.all([
    sql<{ id: string; photo: string }>`SELECT id, photo FROM guests_photos WHERE user_page_id = ${page.id} AND NOT hidden ORDER BY uploaded_at ASC LIMIT 500`.then((r) => r.rows),
    fetchGuestMessages(page.id, false, 300),
    sql<{ id: string; song_title: string; artist: string; votes: number }>`
      SELECT id, song_title, artist, votes FROM guests_songs WHERE user_page_id = ${page.id}
      ORDER BY votes DESC, created_at ASC LIMIT 10`.then((r) => r.rows),
  ]);
  const locale = page.language === 'fr' ? 'fr-CA' : page.language === 'es' ? 'es-MX' : 'en-CA';
  const date = page.event_date ? localizeDate(String(page.event_date).slice(0, 10), locale, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const nothing = !photos.length && !messages.length && !songs.length;
  const h2: React.CSSProperties = { margin: '0 0 18px', fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 30, color: '#241F2B', textAlign: 'center' };

  return (
    <main lang={page.language || 'en'} style={{ minHeight: '100vh', background: '#F6F2ED', color: '#241F2B', fontFamily: 'system-ui, sans-serif' }}>
      {/* A tall banner whose photo stays put while the page scrolls over it
          (background-attachment: fixed), so more of the photo shows on the way down.
          Phones that don't support fixed backgrounds (iOS) simply scroll it. */}
      <header style={{
        position: 'relative', minHeight: '78vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: '80px 20px', color: '#fff',
        backgroundColor: '#4A2E35',
        backgroundImage: page.banner_image ? `linear-gradient(rgba(20,14,18,.40), rgba(20,14,18,.55)), url("${page.banner_image}")` : 'linear-gradient(135deg, #4A2E35, #8E3A2C)',
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: page.banner_image ? 'fixed' : 'scroll',
      }}>
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.9 }}>{t.memTitle}</p>
          <h1 style={{ margin: '0 0 10px', fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(36px, 7vw, 64px)', lineHeight: 1.05, whiteSpace: 'pre-line' }}>{page.heading}</h1>
          {date && <p style={{ margin: 0, fontSize: 16, opacity: 0.9 }}>{date}</p>}
        </div>
      </header>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '44px 16px 70px' }}>
        {nothing && <p style={{ textAlign: 'center', color: '#6B6470', fontSize: 16 }}>{t.memEmpty}</p>}

        {photos.length > 0 && (
          <section style={{ marginBottom: 56 }}>
            <h2 style={h2}>{t.memPhotos}</h2>
            <div style={{ columns: '3 220px', columnGap: 10 }}>
              {photos.map((p) => (
                <a key={p.id} href={p.photo} target="_blank" rel="noopener" style={{ display: 'block', marginBottom: 10, breakInside: 'avoid', borderRadius: 10, overflow: 'hidden', background: '#EDE6DB' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photo} alt="" loading="lazy" style={{ display: 'block', width: '100%', height: 'auto' }} />
                </a>
              ))}
            </div>
          </section>
        )}

        {messages.length > 0 && (
          <section style={{ marginBottom: 56 }}>
            <h2 style={h2}>{t.memMessages}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {messages.map((m) => (
                <figure key={m.id} style={{ margin: 0, background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 6px 20px rgba(60,40,30,.07)' }}>
                  <blockquote style={{ margin: '0 0 10px', fontFamily: 'Georgia, serif', fontSize: 18, lineHeight: 1.45, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>“{m.body}”</blockquote>
                  <figcaption style={{ fontSize: 14, fontWeight: 600, color: '#8E3A2C' }}>— {m.name}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {songs.length > 0 && (
          <section style={{ marginBottom: 56, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
            <h2 style={h2}>{t.memSongs}</h2>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
              {songs.map((s, i) => (
                <li key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 12, padding: '12px 16px' }}>
                  <span style={{ width: 24, textAlign: 'right', color: '#9A8F8C', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                  <span style={{ flex: 1, minWidth: 0 }}><strong>{s.song_title}</strong>{s.artist && <span style={{ color: '#6B6470' }}> · {s.artist}</span>}</span>
                  {s.votes > 0 && <span style={{ fontSize: 13, color: '#B6584A', fontWeight: 600 }}>♥ {s.votes}</span>}
                </li>
              ))}
            </ol>
          </section>
        )}

        <p style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 22, margin: '10px 0 8px' }}>{t.memThanks}</p>
        <p style={{ textAlign: 'center', fontSize: 14, margin: 0 }}><a href={publicPageUrl(page)} style={{ color: '#8E3A2C' }}>{page.heading}</a></p>
      </div>
    </main>
  );
}
