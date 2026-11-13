import Link from 'next/link';
import { appHref } from '@/app/lib/app-url';
import type { LivePartyCopy } from '@/app/lib/marketing/live-party';
import { ES_REGISTER } from '@/app/lib/marketing/es';
import { PLAN_ONE_TIME_PRICE } from '@/app/lib/plans';
import { breadcrumbJsonLd, faqPageJsonLd, productJsonLd, videoObjectJsonLd, webPageJsonLd } from '@/app/lib/marketing/seo';
import { Steps } from '@/app/ui/marketing/content-blocks';
import { FaqList } from '@/app/ui/marketing/faq-list';
import { FeatureVideo } from '@/app/ui/marketing/feature-video';
import { JsonLd } from '@/app/ui/marketing/json-ld';

// The Live Party page's body, in English (/live-party) or Spanish
// (/es/live-party). The page wraps it in its own shell and final CTA.
export function LivePartyView({ c }: { c: LivePartyCopy }) {
  const register = appHref(c.lang === 'es' ? ES_REGISTER : '/register');
  const cta = (where: string) => `${c.lang === 'es' ? 'es-' : ''}live-party-${where}`;
  return (
    <>
      <JsonLd data={webPageJsonLd(c.seo, c.path, c.lang)} />
      <JsonLd data={breadcrumbJsonLd(c.crumbs)} />
      <JsonLd data={productJsonLd()} />
      <JsonLd data={videoObjectJsonLd(c.video, c.path, c.lang)} />
      <JsonLd data={faqPageJsonLd(c.faqs)} />

      <header className="mk-hero">
        <div className="wrap">
          <nav aria-label={c.lang === 'es' ? 'Ruta de navegación' : 'Breadcrumb'} className="mk-breadcrumbs">
            <ol>
              {c.crumbs.map((cr, i) => (
                <li key={cr.path}>{i < c.crumbs.length - 1 ? <Link href={cr.path}>{cr.name}</Link> : <span aria-current="page">{cr.name}</span>}</li>
              ))}
            </ol>
          </nav>
          <p className="eyebrow">{c.eyebrow}</p>
          <h1 className="mk-h1">{c.h1}</h1>
          <p className="mk-lead">{c.lead}</p>
          <div className="mk-cta-row mk-cta-row--hero">
            <Link href={register} className="btn-primary" data-cta={cta('hero')}>{c.start}</Link>
            <a href="#video" className="btn-secondary mk-btn-video">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" /></svg>
              {c.watch}
            </a>
          </div>
          <p className="lvp-price-line"><strong>{c.priceLine[0]}</strong>{c.priceLine[1]}</p>
        </div>
      </header>

      <div className="wrap">
        <FeatureVideo video={c.video} lang={c.lang} />

        <div className="mk-highlights">
          {c.highlights.map((h) => (
            <div className="mk-highlight" key={h.title}>
              <h2 className="mk-highlight-title">{h.title}</h2>
              <p>{h.text}</p>
            </div>
          ))}
        </div>

        <section className="lvp-features" id="features" aria-labelledby="lvp-features-title">
          <h2 className="mk-h2" id="lvp-features-title">{c.featuresTitle}</h2>
          {c.groups.map((g) => (
            <div className="lvp-group" key={g.id} id={g.id}>
              <p className="lvp-kicker">{g.kicker}</p>
              <h3 className="lvp-group-title">{g.title}</h3>
              <div className="lvp-items">
                {g.items.map((item) => (
                  <div className="lvp-item" key={item.title}>
                    <span className="lvp-check" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    </span>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.text}</p>
                      {item.href && <Link href={item.href} className="lvp-more">{c.more}</Link>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="lvp-plus-free">{c.plusFree.text} <Link href={c.plusFree.href}>{c.plusFree.link}</Link>.</p>
        </section>

        <section className="lvp-buy" id="price" aria-labelledby="lvp-buy-title">
          <div className="lvp-buy-card">
            <p className="lvp-kicker">{c.buy.kicker}</p>
            <h2 className="mk-h2" id="lvp-buy-title">Live Party</h2>
            <p className="lvp-buy-amount">${PLAN_ONE_TIME_PRICE}<span> {c.buy.amountNote}</span></p>
            <p className="lvp-buy-terms">{c.buy.terms}</p>
            <Link href={register} className="btn-primary" data-cta={cta('price')}>{c.start}</Link>
            <p className="lvp-buy-note">{c.buy.note} <Link href={c.buy.compareHref}>{c.buy.compare}</Link></p>
          </div>
          <div className="lvp-buy-steps">
            <h2 className="mk-h2">{c.stepsTitle}</h2>
            <Steps steps={c.steps} />
          </div>
        </section>

        <div className="mk-body">
          <section className="mk-block" id="faq">
            <h2 className="mk-h2">{c.faqTitle}</h2>
            <FaqList faqs={c.faqs} liveParty={false} />
          </section>
        </div>
      </div>
    </>
  );
}
