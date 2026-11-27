import Link from 'next/link';
import { appHref } from '@/app/lib/app-url';
import { FR_PLAN_FEATURES, FR_PRICE, FR_REGISTER } from '@/app/lib/marketing/fr';
import { PLAN_TERM_MONTHS } from '@/app/lib/plans';
import type { Faq } from '@/app/lib/marketing/types';
import { ThemePagePicture } from '@/app/ui/marketing/theme-page-picture';

// The pieces the French pages share (the Spanish pages' es-blocks, in French).

export const registerHref = (cta: string) => ({ href: appHref(FR_REGISTER), 'data-cta': `fr-${cta}` });

export function FrThemeCards({ themes }: { themes: { slug: string; name: string; desc: string }[] }) {
  return (
    <div className="theme-grid">
      {themes.map((t, i) => (
        <a key={t.slug} href={`/themes/${t.slug}?lang=fr`} target="_blank" rel="noopener noreferrer" className={`theme-card reveal${i % 3 ? ` delay-${i % 3}` : ''}`} style={{ textDecoration: 'none' }}>
          <ThemePagePicture slug={t.slug} lang="fr" alt={`Le thème ${t.name} : la page complète, faites-la défiler`} />
          <div className="theme-info">
            <p className="theme-name">{t.name}</p>
            <p className="theme-desc">{t.desc}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

export function FrPricing() {
  return (
    <>
      <div className="pricing-grid">
        <div className="price-card reveal">
          <p className="price-tier">Gratuit</p>
          <p className="price-amount">0 $</p>
          <p className="price-desc">Tout ce qu’il faut pour commencer.</p>
          <ul className="price-features">{FR_PLAN_FEATURES.free.map((f) => <li key={f}>{f}</li>)}</ul>
          <Link {...registerHref('pricing-free')} className="btn-secondary" style={{ textAlign: 'center' }}>Commencer gratuitement</Link>
        </div>
        <div className="price-card featured reveal delay-1">
          <span className="price-badge">Le plus populaire</span>
          <p className="price-tier"><Link href="/live-party" className="price-tier-link" hrefLang="en">Live Party</Link></p>
          <p className="price-amount">{FR_PRICE}<span className="per"> CAD + taxes, un seul paiement par événement</span></p>
          <p className="price-desc">Toutes les fonctions de MyGala pour votre événement, pendant {PLAN_TERM_MONTHS} mois.</p>
          <ul className="price-features">{FR_PLAN_FEATURES.plus.map((f) => <li key={f}>{f}</li>)}</ul>
          <Link href="/live-party" className="price-more" hrefLang="en">Tout ce que comprend Live Party (en anglais) →</Link>
          <Link {...registerHref('pricing-plus')} className="btn-primary" style={{ textAlign: 'center' }}>Créer ma page</Link>
        </div>
      </div>
      <p className="es-fine">
        🔒 Paiement sécurisé avec Stripe · Visa, Mastercard et American Express · Prix en dollars canadiens (CAD); les taxes s’ajoutent au paiement.{' '}
        <Link href="/terms#refunds" hrefLang="en">Politique de remboursement (en anglais)</Link>
      </p>
    </>
  );
}

export function FrFaq({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="reveal">
      {faqs.map((f) => (
        <div className="faq-item" key={f.q}>
          <p className="faq-q">{f.q}</p>
          <p className="faq-a">{f.a}</p>
        </div>
      ))}
    </div>
  );
}

export function FrFinalCta({ title, text, cta }: { title: string; text: string; cta: string }) {
  return (
    <div className="final-cta reveal">
      <h2 className="section-title">{title}</h2>
      <p className="hero-sub">{text}</p>
      <Link {...registerHref(cta)} className="btn-primary">Créer ma page gratuitement</Link>
    </div>
  );
}
