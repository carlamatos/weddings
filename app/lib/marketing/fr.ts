import type { Metadata } from 'next';
import { PLAN_ONE_TIME_PRICE, PLAN_TERM_MONTHS } from '@/app/lib/plans';
import { marketingMetadata } from './seo';
import type { Faq, SeoMeta } from './types';

// The French pages (/fr): the content, in Canadian French (vous). Event
// pages, invitations, guest emails and the dashboard all come in French.

export const FR_PAGES = {
  home: { path: '/fr', label: 'Accueil' },
  wedding: { path: '/fr/mariage', label: 'Mariages' },
  newYears: { path: '/fr/reveillon-du-nouvel-an', label: 'Réveillon du Nouvel An' },
} as const;

// The sign-up form opens in French.
export const FR_REGISTER = '/register?lang=fr';

export const FR_PRICE = `${PLAN_ONE_TIME_PRICE.toFixed(2).replace('.', ',')} $`;

// The English pages each French page stands for (hreflang), and the Spanish
// one where there is one.
export const FR_ALTERNATES: Record<string, { en: string; es?: string }> = {
  '/fr': { en: '/', es: '/es' },
  '/fr/mariage': { en: '/events/weddings/start' },
  '/fr/reveillon-du-nouvel-an': { en: '/new-years-eve-party', es: '/es/fiesta-de-ano-nuevo' },
};

// ---------------------------------------------------------------------------
// /fr

export const FR_HOME = {
  seo: {
    title: 'Pages Web gratuites pour vos événements',
    description: 'Créez la page de votre mariage, de votre anniversaire ou de votre party en quelques minutes : choisissez un thème, envoyez les invitations et recevez les réponses. Votre page et vos invitations, en français.',
    keywords: ['page web pour événement', 'invitation en ligne', 'site web de mariage', 'RSVP en ligne', 'invitation avec code QR', 'page web gratuite pour fête'],
  } satisfies SeoMeta,
  steps: [
    { title: 'Choisissez un thème', text: 'Des modèles pour les mariages, les anniversaires, les showers de bébé, les partys de Noël, le Nouvel An et plus. Tous gratuits, et vous pouvez en changer quand vous voulez.' },
    { title: 'Ajoutez les détails', text: 'Le nom de votre événement, la date, le lieu et votre histoire. Votre page est prête en quelques minutes, avec la carte et le décompte.' },
    { title: 'Envoyez les invitations', text: 'Des invitations assorties par courriel, texto ou WhatsApp. Vos invités répondent d’un seul geste, sans créer de compte.' },
    { title: 'Place à la fête !', text: 'Le jour J, vos invités partagent leurs photos, trouvent leur table, demandent des chansons, et ceux qui ne peuvent pas venir regardent en direct.' },
  ],
  props: [
    { title: 'Prête en quelques minutes', text: 'Choisissez un thème, écrivez les noms et la date : votre page est en ligne. Sans graphiste, sans programmeur et sans attente.' },
    { title: 'Tout au même endroit', text: 'Les réponses, le programme, la liste de cadeaux, votre histoire, les photos de vos invités et même les chansons : tout sur une page que vous contrôlez.' },
    { title: 'Dans la langue de vos invités', text: 'Votre page, vos invitations et les rappels sont en français. Et pour vos invités anglophones ou hispanophones, en anglais ou en espagnol aussi.' },
  ],
  faqs: [
    { q: 'Ma page et mes invitations peuvent-elles être en français ?', a: 'Oui. Choisissez Français dans le menu de langue, et tout ce que MyGala écrit sur votre page change : les titres, les boutons, le formulaire de réponse, les dates, le décompte et les rappels par courriel. Vos propres textes s’affichent tels que vous les écrivez.' },
    { q: 'Le tableau de bord de MyGala est-il en français ?', a: 'Oui. Le tableau de bord où vous préparez votre page est offert en français, en anglais et en espagnol. Choisissez votre langue dans le menu de votre profil.' },
    { q: 'Mes invités ont-ils besoin d’un compte ou d’une appli ?', a: 'Non. Vos invités ouvrent simplement votre lien pour répondre, voir les détails ou ajouter leurs photos. Ils n’ont rien à créer ni à installer.' },
    { q: 'Qu’arrive-t-il à ma page après l’événement ?', a: `Elle reste en ligne comme souvenir. Les pages gratuites restent visibles, et les pages Live Party gardent toutes leurs fonctions pendant ${PLAN_TERM_MONTHS} mois à partir de votre achat.` },
    { q: 'Live Party est-il un abonnement ?', a: `Non. C’est un seul paiement de ${FR_PRICE} CAD plus taxes par événement, qui débloque toutes les fonctions pendant ${PLAN_TERM_MONTHS} mois. Aucun frais récurrent et votre carte n’est pas conservée.` },
  ] satisfies Faq[],
  themes: [
    { slug: 'the-day', name: 'The Day', desc: 'Pivoines blanches, vert sauge et touches dorées. Classique et élégant, pour un mariage inoubliable.' },
    { slug: 'love', name: 'Love', desc: 'Rose, framboise et pêche avec des cœurs qui flottent. Chaleureux et romantique, pour un mariage plein d’amour.' },
    { slug: 'balloons', name: 'Balloons', desc: 'Rouge, bleu et or avec ballons et confettis. Amusant et festif, pour les anniversaires et les fêtes d’enfants.' },
    { slug: 'baby-shower-neutral', name: 'Neutral Baby Shower', desc: 'Bois blanchi, bleus tendres et lavande, avec un bébé éléphant, un mobile qui se balance et de petites empreintes. Pour un shower de bébé avant la grande révélation.' },
    { slug: 'christmas-party', name: 'Christmas Party', desc: 'Vert sapin, rouge et lumières dorées sous la neige qui tombe. Chaleureux, pour les partys de Noël.' },
    { slug: 'new-years-eve', name: 'New Year’s Eve', desc: 'Espresso, champagne et or, avec paillettes et confettis. Élégant et festif, pour le réveillon du Nouvel An.' },
  ],
};

// The plans, in French (app/lib/plans.ts PLAN_FEATURES).
export const FR_PLAN_FEATURES = {
  free: [
    'Autant de pages d’événement que vous voulez',
    'Tous les thèmes',
    'Réponses des invités et nombre de personnes',
    'Choix de menu et allergies dans la réponse',
    'Liste d’invités (à partir d’un tableur ou de vos contacts)',
    'Invitations par courriel, texto et WhatsApp',
    'Décompte et détails de l’événement',
    'Programme de l’événement',
    'Budget et rappels de date limite de réponse',
    'Mur de photos et codes QR pour les tables (jusqu’à 50 photos)',
    'Échange de cadeaux avec messages anonymes',
    'Liste de plats à apporter',
    'Sections personnalisées et liste de cadeaux',
    'Votre adresse sur MyGala (mygala.ca/votrenom)',
  ],
  plus: [
    'Tout ce qu’offre le forfait gratuit',
    'Diaporama de photos en direct à l’écran',
    'Jusqu’à 500 photos de vos invités',
    'Diffusion en direct et demandes de chansons',
    'Find Your Table, avec affiche à code QR',
    'Rappels automatiques par courriel',
    'Commanditaires',
    'Page protégée par mot de passe',
    'Votre propre nom de domaine',
    'Soutien prioritaire',
  ],
};

// A French page's metadata: the usual, in French, with the same page in
// English (and Spanish) as its hreflang alternates.
export function frMetadata(seo: SeoMeta, path: string): Metadata {
  const meta = marketingMetadata(seo, path);
  const other = FR_ALTERNATES[path];
  return {
    ...meta,
    alternates: { ...meta.alternates, languages: { 'fr-CA': path, ...(other ? { 'en-CA': other.en, ...(other.es ? { es: other.es } : {}) } : {}) } },
    openGraph: { ...meta.openGraph, locale: 'fr_CA', alternateLocale: ['en_CA'] },
  };
}
