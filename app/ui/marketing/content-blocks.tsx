import Link from 'next/link';
import { appHref } from '@/app/lib/app-url';
import { getFeature } from '@/app/lib/marketing/features';
import type { ContentBlock, Step } from '@/app/lib/marketing/types';

export function Blocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((b) => (
        <section className="mk-block" key={b.heading}>
          <h2 className="mk-h2">{b.heading}</h2>
          {b.paragraphs?.map((p) => <p key={p}>{p}</p>)}
          {b.bullets && (
            <ul className="mk-list">
              {b.bullets.map((li) => <li key={li}>{li}</li>)}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}

// Numbered how-to steps; steps with a dashboard path link to that screen.
export function Steps({ steps }: { steps: Step[] }) {
  return (
    <ol className="mk-steps">
      {steps.map((s, i) => (
        <li key={s.title}>
          <span className="mk-step-num" aria-hidden="true">{i + 1}</span>
          <div>
            <h3 className="mk-step-title">{s.title}</h3>
            <p>{s.text}</p>
            {s.dashboard && (
              <Link href={appHref(s.dashboard)} className="mk-step-link">{s.linkLabel ?? 'Open in your dashboard'} →</Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function FeatureCards({ slugs }: { slugs: string[] }) {
  return (
    <div className="mk-cards">
      {slugs.map((slug) => {
        const f = getFeature(slug);
        if (!f) return null;
        return (
          <Link key={slug} href={`/features/${slug}`} className="mk-card">
            <span className={`mk-badge${f.plan === 'Free' ? ' mk-badge--free' : ''}`}>{f.plan === 'Free' ? 'Free' : 'Plus'}</span>
            <h3 className="mk-card-title">{f.navLabel}</h3>
            <p>{f.summary}</p>
            <span className="mk-card-more">Learn more →</span>
          </Link>
        );
      })}
    </div>
  );
}

export function FinalCta({ title, text }: { title: string; text: string }) {
  return (
    <div className="final-cta">
      <h2 className="section-title">{title}</h2>
      <p className="hero-sub">{text}</p>
      <div className="mk-cta-row">
        <Link href={appHref('/register')} className="btn-primary">Create your free event page</Link>
        <Link href="/#pricing" className="mk-btn-ghost">See pricing</Link>
      </div>
    </div>
  );
}
