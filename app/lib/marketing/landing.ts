import type { Faq, SeoMeta } from './types';
import { PLAN_ONE_TIME_PRICE, PLAN_PRICE_PLUS_TAX } from '@/app/lib/plans';

// Ad landing pages (/events/<slug>/start): one focused sign-up page per
// event type that has a Google Ads campaign. The event type pages
// (/events/<slug>) stay the place for search; these pages only exist to turn
// a click on an ad into a free account.

export type LandingFeature = {
  icon: LandingIcon;
  title: string;
  text: string;
  plus?: boolean; // a Plus feature (one-time payment); otherwise free
};

export type LandingIcon =
  | 'rsvp' | 'guests' | 'countdown' | 'map' | 'program' | 'palette' | 'globe' | 'link' | 'photo'
  | 'mail' | 'camera' | 'video' | 'music' | 'bell' | 'gift' | 'sections' | 'lock' | 'domain' | 'potluck' | 'heart' | 'seat';

export type LandingPage = {
  slug: string; // the event type's slug: weddings, celebrations
  seo: SeoMeta;
  cta: string; // the main button: "Create my free wedding page"
  hero: { badge: string; tagline: string; headline: string; sub: string };
  templates: { title: string; sub: string };
  demo: string; // theme for "See a live demo"
  // The animated "how it works" phone.
  steps: {
    theme: string; // the theme picked in step 2 and shown in step 4
    pickFrom: string[]; // the four thumbnails in step 2
    name: string; // typed in step 3
    date: string;
    place: string;
    link: string; // mygala.ca/<link>
    rsvps: { who: string; reply: string }[];
  };
  features: { title: string; sub: string; items: LandingFeature[] };
  occasions: { title: string; items: string[] };
  final: { title: string; text: string };
  // Set on a page in another language: its own FAQ (the event type's FAQ is
  // in English) and template descriptions, keyed by theme slug.
  faqs?: Faq[];
  templateDescs?: Record<string, string>;
};

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: 'weddings',
    seo: {
      title: 'Free Wedding Website — RSVPs, Photos & More',
      description:
        'Create your wedding website free in minutes: beautiful templates, RSVPs with guest counts, countdown, schedule, map, guest photos, livestream and registry. No credit card.',
    },
    cta: 'Create my free wedding page',
    hero: {
      badge: 'Free wedding websites — sign up in seconds',
      tagline: 'A page as beautiful as your day.',
      headline: 'Your wedding website, ready in minutes.',
      sub: 'Pick a stunning template, add your names and date, and share one link with every guest. RSVPs, your schedule, the venue, photos and more, all in one place.',
    },
    templates: {
      title: 'Wedding templates your guests will remember',
      sub: 'Every template comes with every feature. Tap one to open a full live demo, and switch any time without losing a word.',
    },
    demo: 'the-day',
    steps: {
      theme: 'the-day',
      pickFrom: ['the-day', 'love', 'midnight-botanical', 'quiet-coastal'],
      name: 'Charlotte & James',
      date: 'September 18, 2027',
      place: 'Niagara-on-the-Lake, ON',
      link: 'charlotte-and-james',
      rsvps: [
        { who: 'Emma & Noah', reply: 'Attending · 2 guests' },
        { who: 'Aunt Maria', reply: 'Attending · 1 guest' },
        { who: 'The Patels', reply: 'Attending · 4 guests' },
      ],
    },
    features: {
      title: 'Everything your wedding website needs',
      sub: 'Start with the free plan and add Plus only if you want the extras. It’s a single payment per wedding, never a subscription.',
      items: [
        { icon: 'rsvp', title: 'RSVPs with guest counts', text: 'Guests reply in seconds, for themselves and their plus-ones. See every answer instantly and export to a spreadsheet.' },
        { icon: 'guests', title: 'Guest list', text: 'Import guests from a spreadsheet or your phone’s contacts and see who has replied at a glance.' },
        { icon: 'countdown', title: 'Countdown', text: 'A live countdown to the big day, right at the top of your page.' },
        { icon: 'map', title: 'Ceremony & reception details', text: 'Date, time and venue with a map and directions, so nobody gets lost.' },
        { icon: 'program', title: 'Wedding-weekend schedule', text: 'From the welcome drinks to the farewell brunch, every moment in one clear program.' },
        { icon: 'photo', title: 'Your story & photo gallery', text: 'Tell how you met and show off your engagement photos.' },
        { icon: 'palette', title: 'Every template included', text: 'Switch templates any time. Your words and photos stay put.' },
        { icon: 'globe', title: 'English, Spanish & French', text: 'Publish your page in your family’s language, with every button and date translated.' },
        { icon: 'link', title: 'One easy link', text: 'mygala.ca/yournames. Put it in texts, invitations and your Instagram bio.' },
        { icon: 'mail', title: 'Invitations by email, text & WhatsApp', text: 'Send beautiful invitations to your whole guest list in a few taps.', plus: true },
        { icon: 'camera', title: 'Guest photos by QR code', text: 'Put a QR code on every table. Guests upload their photos from their phones, no app needed. Free for up to 50 photos.' },
        { icon: 'seat', title: 'Find your table', text: 'One QR sign at the door: guests type their name and see their table. No seating chart to print.', plus: true },
        { icon: 'video', title: 'Livestream the ceremony', text: 'Family who can’t travel can watch live on your page.', plus: true },
        { icon: 'gift', title: 'Gift registry', text: 'Link to any registry or store, with your own note about gifts.', plus: true },
        { icon: 'music', title: 'Song requests', text: 'Guests suggest the songs that will fill the dance floor.', plus: true },
        { icon: 'bell', title: 'Automatic reminders', text: 'Reminder emails go out before the big day, so nobody misses the shuttle.', plus: true },
        { icon: 'sections', title: 'Travel, hotels & dress code', text: 'Add your own sections for anything your guests need to know.', plus: true },
        { icon: 'lock', title: 'Password-protected page', text: 'Keep your page just for the people you invite.', plus: true },
        { icon: 'domain', title: 'Your own domain', text: 'Use an address like charlotteandjames.com, with SSL set up for you.', plus: true },
      ],
    },
    occasions: {
      title: 'Made for every part of your love story',
      items: ['Weddings', 'Elopements', 'Engagement parties', 'Rehearsal dinners', 'Destination weddings', 'Vow renewals', 'Anniversaries'],
    },
    final: {
      title: 'Your love story deserves a beautiful home.',
      text: 'Create your wedding website free today. It takes just a few minutes, and you can upgrade only if you need to.',
    },
  },
  {
    slug: 'celebrations',
    seo: {
      title: 'Free Party Page — Birthdays, Baby Showers & Quinceañeras',
      description:
        'Create a free party page in minutes for a birthday, baby shower, quinceañera or sweet 16: fun templates, RSVPs with guest counts, countdown, map, registry and guest photos.',
    },
    cta: 'Create my free party page',
    hero: {
      badge: 'Free party pages — sign up in seconds',
      tagline: 'Every milestone deserves a little magic.',
      headline: 'Your party page, ready in minutes.',
      sub: 'Birthdays, baby showers, quinceañeras and sweet 16s. Pick a fun template, add the details and share one link. RSVPs, the countdown, the map and the photos, all in one place.',
    },
    templates: {
      title: 'Party templates that set the mood',
      sub: 'Every template comes with every feature. Tap one to open a full live demo, and switch any time without losing a word.',
    },
    demo: 'balloons',
    steps: {
      theme: 'alegria',
      pickFrom: ['alegria', 'baby-shower-girl', 'fun-party', 'baby-shower-boy'],
      name: 'Sofía’s Quinceañera',
      date: 'June 12, 2027',
      place: 'San Antonio, TX',
      link: 'sofias-quince',
      rsvps: [
        { who: 'The Garcías', reply: 'Attending · 4 guests' },
        { who: 'Tía Lucía', reply: 'Attending · 2 guests' },
        { who: 'Mateo R.', reply: 'Attending · 1 guest' },
      ],
    },
    features: {
      title: 'Everything your party page needs',
      sub: 'Start with the free plan and add Plus only if you want the extras. It’s a single payment per event, never a subscription.',
      items: [
        { icon: 'rsvp', title: 'RSVPs with guest counts', text: 'Parents reply for the whole family in seconds. See every answer instantly and export to a spreadsheet.' },
        { icon: 'guests', title: 'Guest list', text: 'Import guests from a spreadsheet or your phone’s contacts and see who has replied at a glance.' },
        { icon: 'countdown', title: 'Countdown', text: 'A live countdown that builds the excitement.' },
        { icon: 'map', title: 'Date, venue & map', text: 'Everything guests need to find the party, with directions.' },
        { icon: 'program', title: 'Party schedule', text: 'Arrival, cake, games, the big reveal: the whole plan for the day.' },
        { icon: 'photo', title: 'Photo gallery', text: 'Share your favourite photos right on the page.' },
        { icon: 'palette', title: 'Every template included', text: 'Switch templates any time. Your words and photos stay put.' },
        { icon: 'globe', title: 'English, Spanish & French', text: 'Perfect for bilingual families. Every button, heading and date is translated.' },
        { icon: 'link', title: 'One easy link', text: 'mygala.ca/yourparty. Easy to share in group chats and on social media.' },
        { icon: 'mail', title: 'Invitations by email, text & WhatsApp', text: 'Send invitations to your whole guest list in a few taps.', plus: true },
        { icon: 'gift', title: 'Registry & wish list', text: 'Link to Amazon, Babylist or any store, with your own note about gifts.', plus: true },
        { icon: 'camera', title: 'Guest photos by QR code', text: 'Guests scan, snap and upload from their phones, no app needed. Free for up to 50 photos.' },
        { icon: 'music', title: 'Song requests', text: 'Guests suggest songs for the DJ before the party.', plus: true },
        { icon: 'potluck', title: 'Potluck sign-up', text: 'Guests pick what they’ll bring, so you don’t end up with five cakes.', plus: true },
        { icon: 'bell', title: 'Automatic reminders', text: 'Reminder emails go out before the party, so nobody forgets.', plus: true },
        { icon: 'video', title: 'Livestream', text: 'Faraway family can watch the big moments live.', plus: true },
        { icon: 'sections', title: 'Your own sections', text: 'Add dress code, parking, the theme or anything else guests should know.', plus: true },
        { icon: 'lock', title: 'Password-protected page', text: 'Keep the party just for the people you invite.', plus: true },
      ],
    },
    occasions: {
      title: 'A page for every milestone',
      items: ['Birthdays', 'Kids’ parties', 'Baby showers', 'Gender reveals', 'Quinceañeras', 'Sweet 16s', 'Graduations', 'Retirements', 'Anniversaries'],
    },
    final: {
      title: 'Let’s get the party started.',
      text: 'Create your party page free today. It takes just a few minutes, and you can upgrade only if you need to.',
    },
  },
];

export function getLandingPage(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug);
}

// The landing page's fixed wording, in each language a landing page uses.
export type LandingUi = {
  login: string; signupFree: string; demo: string; checks: [string, string, string]; rsvp: string;
  templatesEyebrow: string; liveDemo: string; swipe: string; templatesCta: string;
  howEyebrow: string; howTitle: string; howSub: string;
  phone: {
    signupTitle: string; google: string; or: string; email: string; signup: string; small: string;
    pickTitle: string; detailsTitle: string; nameLabel: string; dateLabel: string; placeLabel: string;
    publish: string; newRsvps: string;
  };
  steps: [string, string][];
  stepsCta: string;
  featuresEyebrow: string; freePill: string; plusPill: string; freeGroup: string; plusGroup: string;
  faqTitle: string; finalNote: string; stickyNote: string;
};

export const LANDING_UI: Record<'en' | 'fr', LandingUi> = {
  en: {
    login: 'Log in', signupFree: 'Sign up free', demo: 'See a live demo',
    checks: ['Free to sign up', 'No credit card', 'Ready in minutes'], rsvp: 'RSVP',
    templatesEyebrow: 'Templates', liveDemo: 'Live demo →', swipe: 'Swipe to see more →', templatesCta: 'Start free with any template',
    howEyebrow: 'How it works', howTitle: 'Four easy steps to your page', howSub: 'No designer, no tech skills, just a few minutes of your time.',
    phone: {
      signupTitle: 'Create your free account', google: 'Continue with Google', or: 'or', email: 'you@email.com', signup: 'Sign up free',
      small: '✓ Free · No credit card', pickTitle: 'Pick a template', detailsTitle: 'Add your details',
      nameLabel: 'Event name', dateLabel: 'Date', placeLabel: 'Venue', publish: 'Publish my page', newRsvps: 'New RSVPs',
    },
    steps: [
      ['Sign up free', 'Create your account in seconds with your email or Google. No credit card.'],
      ['Pick a template', 'Choose the design you love. You can switch any time.'],
      ['Add your details', 'Names, date, venue and schedule. Your page fills in as you type.'],
      ['Share one link', 'Send it by text, email or WhatsApp and watch the RSVPs roll in.'],
    ],
    stepsCta: 'Start step 1 — it’s free',
    featuresEyebrow: 'Features', freePill: 'Free', plusPill: 'Plus', freeGroup: 'Included when you sign up',
    plusGroup: `Optional extras, one payment of ${PLAN_PRICE_PLUS_TAX}`,
    faqTitle: 'Questions? We’ve got answers.', finalNote: 'Free to sign up · No credit card', stickyNote: 'Free · No credit card',
  },
  fr: {
    login: 'Connexion', signupFree: 'S’inscrire', demo: 'Voir une démo',
    checks: ['Inscription gratuite', 'Sans carte de crédit', 'Prêt en quelques minutes'], rsvp: 'RSVP',
    templatesEyebrow: 'Modèles', liveDemo: 'Démo →', swipe: 'Glissez pour en voir plus →', templatesCta: 'Commencer gratuitement',
    howEyebrow: 'Comment ça marche', howTitle: 'Votre page en quatre étapes', howSub: 'Pas de designer, pas de compétences techniques, juste quelques minutes.',
    phone: {
      signupTitle: 'Créez votre compte gratuit', google: 'Continuer avec Google', or: 'ou', email: 'vous@courriel.com', signup: 'Inscription gratuite',
      small: '✓ Gratuit · Sans carte de crédit', pickTitle: 'Choisissez un modèle', detailsTitle: 'Ajoutez vos détails',
      nameLabel: 'Nom de l’événement', dateLabel: 'Date', placeLabel: 'Lieu', publish: 'Publier ma page', newRsvps: 'Nouveaux RSVP',
    },
    steps: [
      ['Inscrivez-vous gratuitement', 'Créez votre compte en quelques secondes avec votre courriel ou Google. Sans carte de crédit.'],
      ['Choisissez un modèle', 'Choisissez le design qui vous plaît. Vous pouvez en changer quand vous voulez.'],
      ['Ajoutez vos détails', 'Noms, date, lieu et programme. Votre page se remplit pendant que vous tapez.'],
      ['Partagez un seul lien', 'Envoyez-le par texto, courriel ou WhatsApp et regardez les RSVP arriver.'],
    ],
    stepsCta: 'Commencer l’étape 1, c’est gratuit',
    featuresEyebrow: 'Fonctionnalités', freePill: 'Gratuit', plusPill: 'Plus', freeGroup: 'Inclus dès l’inscription',
    plusGroup: `Extras optionnels, un seul paiement de ${PLAN_ONE_TIME_PRICE.toFixed(2).replace('.', ',')} $ CA + taxes`,
    faqTitle: 'Des questions? Voici les réponses.', finalNote: 'Inscription gratuite · Sans carte de crédit', stickyNote: 'Gratuit · Sans carte de crédit',
  },
};

// The French wedding landing page (/fr/mariage), for Google Ads in Quebec
// and French Canada. Same layout as /events/weddings/start, in French.
export const WEDDING_LANDING_FR: LandingPage = {
  slug: 'weddings',
  seo: {
    title: 'Site de mariage gratuit — RSVP, photos et plus',
    description:
      'Créez gratuitement votre site web de mariage en quelques minutes : beaux modèles, RSVP avec nombre d’invités, compte à rebours, programme, carte et photos des invités. En français, sans carte de crédit.',
    keywords: ['site de mariage', 'site web mariage', 'site de mariage gratuit', 'créer un site de mariage', 'RSVP mariage', 'faire-part en ligne'],
  },
  cta: 'Créer mon site de mariage gratuit',
  hero: {
    badge: 'Sites de mariage gratuits, inscription en quelques secondes',
    tagline: 'Une page aussi belle que votre journée.',
    headline: 'Votre site de mariage, prêt en quelques minutes.',
    sub: 'Choisissez un magnifique modèle, ajoutez vos noms et la date, et partagez un seul lien avec tous vos invités. RSVP, programme, lieu, photos et plus encore, tout au même endroit, en français.',
  },
  templates: {
    title: 'Des modèles de mariage dont vos invités se souviendront',
    sub: 'Chaque modèle inclut toutes les fonctionnalités. Touchez-en un pour voir une démo complète, et changez quand vous voulez sans perdre un mot.',
  },
  demo: 'the-day',
  steps: {
    theme: 'the-day',
    pickFrom: ['the-day', 'love', 'midnight-botanical', 'quiet-coastal'],
    name: 'Camille & Olivier',
    date: '18 septembre 2027',
    place: 'Québec, QC',
    link: 'camille-et-olivier',
    rsvps: [
      { who: 'Émilie & Jérôme', reply: 'Présents · 2 invités' },
      { who: 'Tante Louise', reply: 'Présente · 1 invitée' },
      { who: 'Famille Tremblay', reply: 'Présents · 4 invités' },
    ],
  },
  features: {
    title: 'Tout ce qu’il faut pour votre site de mariage',
    sub: 'Commencez avec le forfait gratuit et ajoutez Plus seulement si vous voulez les extras. Un seul paiement par mariage, jamais d’abonnement.',
    items: [
      { icon: 'rsvp', title: 'RSVP avec nombre d’invités', text: 'Vos invités répondent en quelques secondes, pour eux et leurs accompagnateurs. Voyez chaque réponse en direct et exportez-les dans un tableur.' },
      { icon: 'guests', title: 'Liste d’invités', text: 'Importez vos invités depuis un tableur ou les contacts de votre téléphone et voyez d’un coup d’œil qui a répondu.' },
      { icon: 'countdown', title: 'Compte à rebours', text: 'Un compte à rebours en direct jusqu’au grand jour, en haut de votre page.' },
      { icon: 'map', title: 'Cérémonie et réception', text: 'Date, heure et lieu avec carte et itinéraire, pour que personne ne se perde.' },
      { icon: 'program', title: 'Programme de la fin de semaine', text: 'Du cocktail de bienvenue au brunch du lendemain, chaque moment dans un programme clair.' },
      { icon: 'photo', title: 'Votre histoire et galerie photo', text: 'Racontez votre rencontre et montrez vos photos de fiançailles.' },
      { icon: 'palette', title: 'Tous les modèles inclus', text: 'Changez de modèle quand vous voulez. Vos textes et vos photos restent en place.' },
      { icon: 'globe', title: 'En français, en anglais ou en espagnol', text: 'Publiez votre page dans la langue de vos familles : boutons, formulaire RSVP et dates sont traduits.' },
      { icon: 'link', title: 'Un seul lien facile', text: 'mygala.ca/vosnoms. À partager par texto, sur vos faire-part et dans votre bio Instagram.' },
      { icon: 'mail', title: 'Invitations par courriel, texto et WhatsApp', text: 'Envoyez de belles invitations à toute votre liste d’invités en quelques clics.', plus: true },
      { icon: 'camera', title: 'Photos des invités par code QR', text: 'Placez un code QR sur chaque table. Vos invités téléversent leurs photos depuis leur téléphone, sans application. Gratuit jusqu’à 50 photos.' },
      { icon: 'seat', title: 'Trouvez votre table', text: 'Une affiche QR à l’entrée : vos invités tapent leur nom et voient leur table. Aucun plan de table à imprimer.', plus: true },
      { icon: 'video', title: 'Cérémonie en direct', text: 'La famille qui ne peut pas se déplacer regarde la cérémonie en direct sur votre page.', plus: true },
      { icon: 'gift', title: 'Liste de cadeaux', text: 'Un lien vers n’importe quel registre ou magasin, avec votre mot au sujet des cadeaux.', plus: true },
      { icon: 'music', title: 'Demandes de chansons', text: 'Vos invités suggèrent les chansons qui rempliront la piste de danse.', plus: true },
      { icon: 'bell', title: 'Rappels automatiques', text: 'Des courriels de rappel partent avant le grand jour, pour que personne ne rate la navette.', plus: true },
      { icon: 'sections', title: 'Hébergement, transport et tenue', text: 'Ajoutez vos propres sections pour tout ce que vos invités doivent savoir.', plus: true },
      { icon: 'lock', title: 'Page protégée par mot de passe', text: 'Votre page, réservée aux personnes que vous invitez.', plus: true },
      { icon: 'domain', title: 'Votre propre nom de domaine', text: 'Une adresse comme camilleetolivier.com, avec certificat SSL configuré pour vous.', plus: true },
    ],
  },
  occasions: {
    title: 'Pour chaque chapitre de votre histoire d’amour',
    items: ['Mariages', 'Fugues amoureuses', 'Fiançailles', 'Soupers de répétition', 'Mariages à destination', 'Renouvellements de vœux', 'Anniversaires de mariage'],
  },
  final: {
    title: 'Votre histoire d’amour mérite un bel écrin.',
    text: 'Créez votre site de mariage gratuit dès aujourd’hui. Quelques minutes suffisent, et vous passez à Plus seulement si vous en avez besoin.',
  },
  faqs: [
    { q: 'Le site de mariage MyGala est-il gratuit?', a: 'Oui. Les pages gratuites incluent tous les modèles, les RSVP, la liste d’invités, le compte à rebours, les détails, le programme et jusqu’à 50 photos d’invités. Plus est un paiement unique par événement, et non un abonnement, qui ajoute des extras comme les invitations, la diffusion en direct, la liste de cadeaux et votre propre nom de domaine.' },
    { q: 'Mes invités peuvent-ils répondre pour leur conjoint ou leur famille?', a: 'Oui. Le formulaire RSVP demande combien de personnes viennent, alors une seule personne peut répondre pour tout son groupe.' },
    { q: 'Le tableau de bord est-il en français?', a: 'Pas encore : l’espace où vous créez votre page est en anglais. Votre page, elle, est en français pour vos invités : titres, boutons, formulaire RSVP, dates et courriels de rappel.' },
    { q: 'Peut-on ajouter notre liste de cadeaux?', a: 'Oui. Avec Plus, ajoutez une section liste de cadeaux avec un lien vers n’importe quel magasin ou registre, et votre propre message.' },
    { q: 'Peut-on garder le site après le mariage?', a: 'Oui. Votre page reste en ligne en souvenir. Les pages gratuites restent consultables; les fonctionnalités Plus restent actives 15 mois après l’achat et peuvent être prolongées.' },
    { q: 'Peut-on utiliser notre propre nom de domaine?', a: 'Oui, avec Plus. Branchez un domaine comme camilleetolivier.com et indiquez-le sur vos faire-part.' },
  ],
  templateDescs: {
    'the-day': 'Pivoines ivoire et bouquet blanc, verdure sauge et touches dorées. Intemporel et raffiné, pour les mariages classiques et élégants.',
    love: 'Rose poudré, rose et framboise, avec pêche et verts tendres. Calligraphie romantique et cœurs qui s’envolent, pour les mariages chaleureux.',
    nature: 'Noyer, chêne et vert feuille, à la lueur des chandelles. Feuilles qui tombent et lucioles, pour les mariages en forêt, en grange ou en plein air.',
    'terracotta-harvest': 'Rouille, ocre et lin. Heure dorée, terreux et intime, pour les mariages en plein air et au verger.',
    'midnight-botanical': 'Émeraude profond et or ancien. Formel et à la chandelle, pour les soirées et les manoirs.',
    'quiet-coastal': 'Sauge, sable et craie. Aérien et minimaliste, pour les cérémonies sur la plage et les mariages à destination.',
    vilma: 'Lavis d’aquarelle, bleu acier et touches d’ambre. Doux et romantique, pour les mariages en jardin et en manoir.',
  },
};
