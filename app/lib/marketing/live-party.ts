import { FREE_GUEST_PHOTO_LIMIT, PLUS_GUEST_PHOTO_LIMIT } from '@/app/lib/guest-photos';
import { PLAN_CURRENCY, PLAN_ONE_TIME_PRICE, PLAN_PRICE_PLUS_TAX, PLAN_TERM_MONTHS } from '@/app/lib/plans';
import type { Faq, SeoMeta, Step, Video } from './types';

// The Live Party page (/live-party, and /es/live-party in Spanish):
// everything the Live Party plan adds, grouped the way the night goes (the
// screen, the music, the guests, afterwards, the page). Each item links to
// its own feature page when there is one. app/ui/marketing/live-party-view.tsx
// lays it out.

export const LIVE_PARTY_PATH = '/live-party';
export const LIVE_PARTY_ES_PATH = '/es/live-party';

export const LIVE_PARTY_VIDEO: Video = {
  src: '/videos/features/live-party.mp4',
  poster: '/videos/features/live-party.jpg',
  title: 'MyGala Live Party: your party, live',
  description:
    'Guests scan a QR code and share photos and messages that appear live on the venue screen, vote for the songs the DJ plays, find their table with a QR sign, and relive it all on a memories page after the party.',
  caption: 'Photos and messages on the big screen, song votes for the DJ, find-your-table and a memories page: everything in Live Party in one minute.',
  width: 1920,
  height: 1080,
  duration: 'PT1M5S',
  uploadDate: '2026-11-13',
};

export type LivePartyItem = { title: string; text: string; href?: string };
export type LivePartyGroup = { id: string; kicker: string; title: string; items: LivePartyItem[] };

export type LivePartyCopy = {
  lang: 'en' | 'es';
  path: string;
  seo: SeoMeta;
  crumbs: { name: string; path: string }[];
  eyebrow: string;
  h1: string;
  lead: string;
  start: string;
  watch: string;
  priceLine: [string, string];
  video: Video;
  highlights: { title: string; text: string }[];
  featuresTitle: string;
  groups: LivePartyGroup[];
  more: string;
  plusFree: { text: string; link: string; href: string };
  buy: { kicker: string; amountNote: string; terms: string; note: string; compare: string; compareHref: string };
  stepsTitle: string;
  steps: Step[];
  faqTitle: string;
  faqs: Faq[];
  final: { title: string; text: string };
};

const PRICE = `$${PLAN_ONE_TIME_PRICE}`;

export const LIVE_PARTY_EN: LivePartyCopy = {
  lang: 'en',
  path: LIVE_PARTY_PATH,
  seo: {
    title: 'MyGala Live Party: Live Slideshow, Song Votes & Memories for Your Event',
    description: `Turn your event into a Live Party: guest photos and messages live on the big screen, song requests with votes, find-your-table and a memories page. ${PLAN_PRICE_PLUS_TAX}, once per event.`,
    keywords: ['live party', 'wedding photo slideshow', 'guest messages screen', 'song request voting', 'wedding DJ song requests', 'find your table QR', 'event memories page', 'party photo wall'],
  },
  crumbs: [{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing' }, { name: 'Live Party', path: LIVE_PARTY_PATH }],
  eyebrow: 'MyGala Live Party',
  h1: 'Make your party live.',
  lead: 'Photos, messages and music from every guest, all night long. Live Party turns your MyGala event page into part of the celebration: a live slideshow on the big screen, song votes for the DJ, find-your-table, and a memories page to keep afterwards.',
  start: 'Start your event page free',
  watch: 'Watch the video',
  priceLine: [`${PRICE} ${PLAN_CURRENCY}`, ` + tax · one time, per event · ${PLAN_TERM_MONTHS} months of everything`],
  video: LIVE_PARTY_VIDEO,
  highlights: [
    { title: 'Live on the big screen', text: 'Guests’ photos and messages play on the venue screen the moment they’re shared.' },
    { title: 'The music is theirs', text: 'Guests request and vote for songs, and your DJ sees the top picks on a private page.' },
    { title: 'Memories to keep', text: 'After the party, every photo, message and song in one page you can share.' },
  ],
  featuresTitle: 'Everything in Live Party',
  groups: [
    {
      id: 'screen',
      kicker: 'On the big screen',
      title: 'Every photo and message, live',
      items: [
        { title: 'Live photo slideshow', text: 'Open one link on the TV or projector at the venue. Guests’ photos play full screen, and new ones appear seconds after they’re shared.', href: '/features/live-photo-slideshow' },
        { title: 'Messages wall', text: 'Guests leave you a message from their phone, and it rotates on the screen with the photos. Every message is kept for you.' },
        { title: `Up to ${PLUS_GUEST_PHOTO_LIMIT} guest photos`, text: `Guests scan the QR code on their table and share from their phone camera. No app and no sign-up. The free plan holds ${FREE_GUEST_PHOTO_LIMIT}.`, href: '/features/guest-photo-qr-code' },
        { title: 'You stay in control', text: 'Hide any photo or message with one tap from your dashboard. It leaves the page and the screen straight away.' },
      ],
    },
    {
      id: 'music',
      kicker: 'The music',
      title: 'Your guests pick the playlist',
      items: [
        { title: 'Song requests with votes', text: 'Guests request songs on your page and vote for their favourites, so the most-wanted songs rise to the top.' },
        { title: 'A private DJ page', text: 'Share a private link with your DJ. They see the top requests live and mark each song as played.' },
        { title: 'Livestream link', text: 'Add your stream link so family who can’t be there can watch the ceremony or the speeches from anywhere.', href: '/features/livestream' },
      ],
    },
    {
      id: 'guests',
      kicker: 'Before and during',
      title: 'Everyone knows where to be',
      items: [
        { title: 'Find your table', text: 'Put a QR sign at the entrance. Guests type their name and see their table in seconds, with no crowd around the seating chart.', href: '/features/find-your-table' },
        { title: 'Automatic reminder emails', text: 'Guests get reminder emails before the big day, with a link back to your page, in your page’s language.', href: '/features/event-reminder-emails' },
        { title: '“Happening now” on your program', text: 'On the day, your event program highlights what’s happening right now, so guests always know what’s next.' },
      ],
    },
    {
      id: 'after',
      kicker: 'After the party',
      title: 'A memories page to keep',
      items: [
        { title: 'Your memories page', text: `Every photo, every message and the songs your guests danced to, together on one beautiful page you can share, kept for ${PLAN_TERM_MONTHS} months.` },
      ],
    },
    {
      id: 'page',
      kicker: 'Your page',
      title: 'Make it yours',
      items: [
        { title: 'Password-protected page', text: 'Only guests with the password see your details, photos and memories.', href: '/features/password-protection' },
        { title: 'Your own domain', text: 'Use your own address, like anaandluis.com, instead of mygala.ca/yourname.', href: '/features/custom-domain' },
        { title: 'Sponsors section', text: 'Thank the sponsors or vendors of your event with their logos and links.', href: '/features/custom-sections' },
        { title: 'Up to 100 gallery photos', text: 'Share your own photos on the page: up to 100, instead of 8 on the free plan.' },
        { title: 'Priority support', text: 'Questions before the big day go to the front of the line.' },
      ],
    },
  ],
  more: 'Learn more →',
  plusFree: { text: 'Plus everything that’s free on every page: every theme, RSVPs, invitations, your guest list, Secret Santa and more.', link: 'See all features', href: '/features' },
  buy: {
    kicker: 'One price, the whole party',
    amountNote: `${PLAN_CURRENCY} + tax`,
    terms: `One time, per event. Every Live Party feature for ${PLAN_TERM_MONTHS} months. No subscription, nothing to cancel.`,
    note: 'Your page is free to create. Upgrade it to Live Party from your dashboard whenever you’re ready.',
    compare: 'Compare Free and Live Party',
    compareHref: '/pricing',
  },
  stepsTitle: 'How it works',
  steps: [
    { title: 'Create your event page, free', text: 'Pick a theme, add your details and share your link. Every free feature is yours to keep.' },
    { title: 'Set up the Live Party features', text: 'Song requests, find-your-table, the messages wall and more can all be set up before you pay, so you see exactly what your guests will get.' },
    { title: 'Upgrade when you’re ready', text: `One payment of ${PLAN_PRICE_PLUS_TAX} from your dashboard, and everything goes live for ${PLAN_TERM_MONTHS} months.` },
  ],
  faqTitle: 'Live Party questions',
  faqs: [
    { q: 'How much is Live Party?', a: `${PLAN_PRICE_PLUS_TAX}, paid once per event. It is not a subscription: nothing renews and there is nothing to cancel.` },
    { q: 'How long does Live Party last?', a: `${PLAN_TERM_MONTHS} months from your purchase: time to plan, celebrate and enjoy your memories page afterwards. Then your page stays online on the free plan, or you can extend Live Party with another single payment.` },
    { q: 'Do my guests need an app?', a: 'No. Guests scan a QR code or open your link in their phone’s browser to share photos, leave messages, vote for songs and find their table. No app and no account.' },
    { q: 'What do I need for the slideshow?', a: 'Any screen with a web browser: a laptop plugged into a TV or projector, or a smart TV. Open the slideshow link and it runs by itself, adding new photos and messages as guests share them.' },
    { q: 'Can I try it before I pay?', a: 'Yes. Create your page free and set up the Live Party features. You only pay when you’re ready for your guests to use them.' },
    { q: 'What if a guest shares something I don’t want on the screen?', a: 'Hide it with one tap from your dashboard. It disappears from your page and the slideshow straight away, and you can show it again later.' },
    { q: 'Is Live Party only for weddings?', a: 'No. It works for any celebration: birthdays, quinceañeras, baby showers, anniversaries, holiday and office parties, galas and community events.' },
  ],
  final: { title: 'Your party, live.', text: 'Create your event page free today, and make it a Live Party when you’re ready.' },
};

export const LIVE_PARTY_ES: LivePartyCopy = {
  lang: 'es',
  path: LIVE_PARTY_ES_PATH,
  seo: {
    title: 'MyGala Live Party: fotos en pantalla, canciones y recuerdos de tu fiesta',
    description: `Convierte tu evento en una Live Party: fotos y mensajes de tus invitados en la pantalla, peticiones de canciones con votos, Find Your Table y una página de recuerdos. ${PRICE} ${PLAN_CURRENCY}, un solo pago.`,
    keywords: ['fotos de invitados en pantalla', 'presentación de fotos para boda', 'peticiones de canciones boda', 'código QR fotos fiesta', 'página de recuerdos boda', 'quinceañera fotos en vivo'],
  },
  crumbs: [{ name: 'Inicio', path: '/es' }, { name: 'Live Party', path: LIVE_PARTY_ES_PATH }],
  eyebrow: 'MyGala Live Party',
  h1: 'Haz que tu fiesta cobre vida.',
  lead: 'Fotos, mensajes y música de todos tus invitados, toda la noche. Live Party convierte la página de tu evento en parte de la celebración: una presentación de fotos en vivo en la pantalla grande, votos de canciones para el DJ, Find Your Table y una página de recuerdos para después.',
  start: 'Crea tu página gratis',
  watch: 'Ver el video',
  priceLine: [`${PRICE} ${PLAN_CURRENCY}`, ` + impuestos · un solo pago por evento · ${PLAN_TERM_MONTHS} meses de todo`],
  video: {
    src: '/videos/es/live-party.mp4',
    poster: '/videos/es/live-party.jpg',
    title: 'MyGala Live Party: tu fiesta, en vivo',
    description:
      'Tus invitados escanean un código QR y comparten fotos y mensajes que aparecen en vivo en la pantalla del salón, votan las canciones que toca el DJ, encuentran su mesa con un letrero QR y reviven todo en una página de recuerdos después de la fiesta.',
    caption: 'Fotos y mensajes en la pantalla, votos de canciones para el DJ, Find Your Table y una página de recuerdos: todo Live Party en un minuto.',
    width: 1920,
    height: 1080,
    duration: 'PT1M8S',
    uploadDate: '2026-11-13',
  },
  highlights: [
    { title: 'En vivo en la pantalla', text: 'Las fotos y los mensajes de tus invitados aparecen en la pantalla del salón en cuanto los comparten.' },
    { title: 'La música es de ellos', text: 'Tus invitados piden y votan canciones, y tu DJ ve las favoritas en una página privada.' },
    { title: 'Recuerdos para siempre', text: 'Después de la fiesta, cada foto, mensaje y canción en una sola página para compartir.' },
  ],
  featuresTitle: 'Todo lo que incluye Live Party',
  groups: [
    {
      id: 'pantalla',
      kicker: 'En la pantalla grande',
      title: 'Cada foto y cada mensaje, en vivo',
      items: [
        { title: 'Presentación de fotos en vivo', text: 'Abre un enlace en la tele o el proyector del salón. Las fotos de tus invitados se ven en pantalla completa y las nuevas aparecen segundos después de compartirlas.' },
        { title: 'Muro de mensajes', text: 'Tus invitados te dejan un mensaje desde su celular y aparece en la pantalla junto con las fotos. Todos los mensajes se guardan para ti.' },
        { title: `Hasta ${PLUS_GUEST_PHOTO_LIMIT} fotos de tus invitados`, text: `Escanean el código QR de su mesa y comparten desde la cámara de su celular. Sin aplicación y sin cuenta. El plan gratis guarda ${FREE_GUEST_PHOTO_LIMIT}.`, href: '/es/funciones#fotos' },
        { title: 'Tú tienes el control', text: 'Oculta cualquier foto o mensaje con un toque desde tu panel. Desaparece de la página y de la pantalla al instante.' },
      ],
    },
    {
      id: 'musica',
      kicker: 'La música',
      title: 'Tus invitados eligen la música',
      items: [
        { title: 'Peticiones de canciones con votos', text: 'Tus invitados piden canciones en tu página y votan por sus favoritas, así las más pedidas suben al primer lugar.' },
        { title: 'Una página privada para el DJ', text: 'Comparte un enlace privado con tu DJ. Ve las canciones más votadas en vivo y marca cada una cuando la toca.' },
        { title: 'Transmisión en vivo', text: 'Agrega el enlace de tu transmisión para que la familia que está lejos vea la ceremonia o los brindis desde donde sea.' },
      ],
    },
    {
      id: 'invitados',
      kicker: 'Antes y durante',
      title: 'Todos saben dónde estar',
      items: [
        { title: 'Find Your Table', text: 'Pon un letrero con código QR en la entrada. Tus invitados escriben su nombre y ven su mesa en segundos, sin amontonarse frente al plano.', href: '/es/funciones#mesas' },
        { title: 'Recordatorios automáticos por correo', text: 'Tus invitados reciben recordatorios antes del gran día, con un enlace a tu página, en el idioma de tu página.' },
        { title: '“Ahora mismo” en tu programa', text: 'El día del evento, tu programa resalta lo que está pasando en ese momento, para que todos sepan qué sigue.' },
      ],
    },
    {
      id: 'despues',
      kicker: 'Después de la fiesta',
      title: 'Una página de recuerdos',
      items: [
        { title: 'Tu página de recuerdos', text: `Cada foto, cada mensaje y las canciones que bailaron, juntos en una página hermosa para compartir, disponible durante ${PLAN_TERM_MONTHS} meses.` },
      ],
    },
    {
      id: 'pagina',
      kicker: 'Tu página',
      title: 'Hazla tuya',
      items: [
        { title: 'Página con contraseña', text: 'Solo quien tenga la contraseña ve tus detalles, fotos y recuerdos.' },
        { title: 'Tu propio dominio', text: 'Usa tu propia dirección, como sofiaxv.com, en lugar de mygala.ca/tunombre.' },
        { title: 'Patrocinadores', text: 'Agradece a los patrocinadores o proveedores de tu evento con sus logos y enlaces.' },
        { title: 'Hasta 100 fotos en tu galería', text: 'Comparte tus propias fotos en la página: hasta 100, en lugar de 8 en el plan gratis.' },
        { title: 'Soporte prioritario', text: 'Tus preguntas antes del gran día se atienden primero.' },
      ],
    },
  ],
  more: 'Ver más →',
  plusFree: { text: 'Y todo lo que es gratis en todas las páginas: todos los temas, confirmaciones, invitaciones, tu lista de invitados, amigo secreto y más.', link: 'Ver todas las funciones', href: '/es/funciones' },
  buy: {
    kicker: 'Un solo precio, toda la fiesta',
    amountNote: `${PLAN_CURRENCY} + impuestos`,
    terms: `Un solo pago por evento. Todas las funciones Live Party durante ${PLAN_TERM_MONTHS} meses. Sin suscripción, nada que cancelar.`,
    note: 'Crear tu página es gratis. Mejórala a Live Party desde tu panel cuando quieras.',
    compare: 'Compara Gratis y Live Party',
    compareHref: '/es#precios',
  },
  stepsTitle: 'Cómo funciona',
  steps: [
    { title: 'Crea la página de tu evento, gratis', text: 'Elige un tema, agrega tus detalles y comparte tu enlace. Todas las funciones gratis son tuyas.' },
    { title: 'Prepara las funciones Live Party', text: 'Las peticiones de canciones, Find Your Table, el muro de mensajes y más se pueden preparar antes de pagar, para que veas exactamente lo que tendrán tus invitados.' },
    { title: 'Mejora cuando estés listo', text: `Un solo pago de ${PRICE} ${PLAN_CURRENCY} más impuestos desde tu panel, y todo se activa durante ${PLAN_TERM_MONTHS} meses.` },
  ],
  faqTitle: 'Preguntas sobre Live Party',
  faqs: [
    { q: '¿Cuánto cuesta Live Party?', a: `${PRICE} ${PLAN_CURRENCY} más impuestos, un solo pago por evento. No es una suscripción: no se renueva y no hay nada que cancelar.` },
    { q: '¿Cuánto dura Live Party?', a: `${PLAN_TERM_MONTHS} meses desde tu compra: tiempo para planear, celebrar y disfrutar tu página de recuerdos. Después tu página sigue en línea con el plan gratis, o puedes extender Live Party con otro pago único.` },
    { q: '¿Mis invitados necesitan una aplicación?', a: 'No. Escanean un código QR o abren tu enlace en el navegador de su celular para compartir fotos, dejar mensajes, votar canciones y encontrar su mesa. Sin aplicación y sin cuenta.' },
    { q: '¿Qué necesito para la presentación de fotos?', a: 'Cualquier pantalla con navegador: una laptop conectada a una tele o un proyector, o una smart TV. Abre el enlace de la presentación y funciona sola, agregando las fotos y los mensajes nuevos.' },
    { q: '¿Puedo probarlo antes de pagar?', a: 'Sí. Crea tu página gratis y prepara las funciones Live Party. Solo pagas cuando quieras que tus invitados las usen.' },
    { q: '¿Y si un invitado comparte algo que no quiero en la pantalla?', a: 'Ocúltalo con un toque desde tu panel. Desaparece de tu página y de la pantalla al instante, y puedes volver a mostrarlo después.' },
    { q: '¿Live Party es solo para bodas?', a: 'No. Sirve para cualquier celebración: cumpleaños, quinceañeras, baby showers, aniversarios, posadas, fiestas de oficina, galas y eventos de la comunidad.' },
  ],
  final: { title: 'Tu fiesta, en vivo.', text: 'Crea la página de tu evento gratis hoy, y conviértela en una Live Party cuando estés listo.' },
};
