import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { FR_HOME, frMetadata } from '@/app/lib/marketing/fr';
import { NEW_YEARS_SPOTLIGHT_FR } from '@/app/lib/marketing/occasion-spotlight';
import { faqPageJsonLd, organizationJsonLd, webPageJsonLd } from '@/app/lib/marketing/seo';
import HeroThemeWall from '@/app/ui/marketing/hero-theme-wall';
import { JsonLd } from '@/app/ui/marketing/json-ld';
import { OccasionSpotlight } from '@/app/ui/marketing/occasion-spotlight';
import FrenchShell from '@/app/ui/marketing/fr/french-shell';
import { FrFaq, FrFinalCta, FrPricing, FrThemeCards, registerHref } from '@/app/ui/marketing/fr/fr-blocks';

// MyGala in French: the home page's overall picture, like the Spanish one
// (/es). No video yet: the how-it-works video is in English and Spanish.
const PATH = '/fr';

export function generateMetadata(): Metadata {
  return frMetadata(FR_HOME.seo, PATH);
}

// The words MyGala writes on a page, before and after choosing Français
// (app/lib/translations.ts).
const WORDS = [
  ['Kindly respond', 'Votre réponse'],
  ['Our story', 'Notre histoire'],
  ['Until we say I do', 'Jusqu’au grand oui'],
  ['Get directions', 'Obtenir l’itinéraire'],
];

export default function FrenchHome() {
  return (
    <FrenchShell english="/">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webPageJsonLd(FR_HOME.seo, PATH, 'fr-CA')} />
      <JsonLd data={faqPageJsonLd(FR_HOME.faqs)} />

      <div className="hero">
        <HeroThemeWall />
        <div className="hero-wash" />
        <p className="hero-eyebrow hero-badge"><span className="hero-badge-free">Gratuit</span><span>Des pages Web pour les mariages, les anniversaires et toutes les fêtes</span></p>
        <p className="hero-tagline">Une page aussi soignée que votre fête.</p>
        <h1 className="hero-headline">Organisez votre événement en quelques minutes.</h1>
        <p className="hero-sub">Choisissez un thème, ajoutez les détails et partagez un seul lien avec tous ceux que vous aimez. Invitations, réponses, photos et chaque détail, au même endroit et en français.</p>
        <div className="hero-actions">
          <Link {...registerHref('hero')} className="btn-primary">Créer ma page gratuitement</Link>
          <Link href="/themes/the-day?lang=fr" className="btn-secondary btn-demo" data-cta="fr-hero-demo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Voir un exemple
          </Link>
        </div>
        <p className="hero-note"><span>Gratuit pour commencer</span> · <span>Sans carte de crédit</span> · <span>Aucune compétence en design</span></p>
      </div>

      {/* Le réveillon du Nouvel An (/fr/reveillon-du-nouvel-an), as on the English home page. */}
      <OccasionSpotlight spotlight={NEW_YEARS_SPOTLIGHT_FR} cta="fr-spotlight-new-years" />

      <div className="wrap">
        <div className="section">
          <div className="reveal" style={{ maxWidth: 640, marginBottom: 54 }}>
            <p className="eyebrow">Comment ça marche</p>
            <h2 className="section-title">Quatre étapes, et place à la fête.</h2>
          </div>
          <ol className="es-steps reveal">
            {FR_HOME.steps.map((s) => <li key={s.title}><h3>{s.title}</h3><p>{s.text}</p></li>)}
          </ol>
        </div>
      </div>

      <section className="es-band" aria-labelledby="fr-band-title">
        <div className="wrap">
          <div className="reveal">
            <p className="eyebrow">Votre page, dans votre langue</p>
            <h2 className="section-title" id="fr-band-title">Vos invités lisent tout en français.</h2>
            <p className="section-sub">Choisissez Français et MyGala traduit tout ce qu’il écrit sur votre page. Vos propres textes s’affichent tels que vous les écrivez, en français, en anglais ou dans les deux langues.</p>
            <ul className="es-check">
              <li>Les titres, les boutons, les dates et le décompte</li>
              <li>Le formulaire de réponse des invités</li>
              <li>Les rappels par courriel à vos invités</li>
              <li>Le tableau de bord où vous préparez tout</li>
              <li>Gratuit avec tous les forfaits</li>
            </ul>
          </div>
          <div className="es-words reveal delay-1" aria-label="Exemples de ce qui change quand vous choisissez Français">
            {WORDS.map(([en, fr]) => (
              <p className="es-word" key={fr}>
                <span lang="en">{en}</span>
                <ArrowRightIcon width={18} height={18} aria-hidden="true" />
                <b>{fr}</b>
              </p>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="section">
          <div className="reveal" style={{ maxWidth: 640, marginBottom: 50 }}>
            <p className="eyebrow">Pourquoi MyGala</p>
            <h2 className="section-title">Tout ce qu’il faut pour votre événement, rien de trop.</h2>
          </div>
          <div className="props-grid">
            {FR_HOME.props.map((p, i) => (
              <div className={`prop-card reveal${i ? ` delay-${i}` : ''}`} key={p.title}>
                <p className="prop-num">0{i + 1}</p>
                <h3 className="prop-title">{p.title}</h3>
                <p className="prop-copy">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="theme-showcase" id="themes">
        <div className="wrap">
          <div className="section">
            <div className="reveal" style={{ maxWidth: 640, marginBottom: 40 }}>
              <p className="eyebrow">Un thème pour chaque occasion</p>
              <h2 className="section-title">Choisissez le thème qui va avec votre fête.</h2>
              <p className="section-sub">Chaque thème offre les mêmes fonctions : réponses, décompte, galerie de photos, diffusion en direct et plus. Seul le style change.</p>
            </div>
            <FrThemeCards themes={FR_HOME.themes} />
            <p style={{ marginTop: 28, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <Link href="/fr/mariage" className="learn-more-link">Les mariages →</Link>
              <Link href="/fr/reveillon-du-nouvel-an" className="learn-more-link">Le réveillon du Nouvel An →</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="wrap" id="tarifs">
        <div className="section">
          <div className="es-center reveal">
            <p className="eyebrow">Des prix simples</p>
            <h2 className="section-title">Commencez gratuitement. Passez à Live Party quand vous voulez.</h2>
            <p className="section-sub">Un seul paiement, sans frais récurrents et sans surprise à l’approche de votre événement.</p>
          </div>
          <FrPricing />
        </div>
      </div>

      <div className="wrap" id="faq">
        <div className="section" style={{ maxWidth: 760, margin: '0 auto', paddingTop: 0 }}>
          <div className="reveal" style={{ marginBottom: 40 }}>
            <p className="eyebrow">Questions fréquentes</p>
            <h2 className="section-title">Bon à savoir</h2>
          </div>
          <FrFaq faqs={FR_HOME.faqs} />
        </div>
      </div>

      <FrFinalCta title="Votre fête mérite une belle page." text="Commencez gratuitement aujourd’hui. Passez à Live Party seulement si vous en avez besoin." cta="final" />
    </FrenchShell>
  );
}
