import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { PLAN_CURRENCY, PLAN_ONE_TIME_PRICE, PLAN_TERM_MONTHS } from '@/app/lib/plans';
import { marketingMetadata } from './seo';
import type { Faq, SeoMeta, Video } from './types';

// The Spanish pages (/es): the content, in neutral Latin American Spanish
// (tú). Event pages, invitations and guest emails already come in Spanish;
// the dashboard is in English, which the pages say plainly.

export const ES_PAGES = {
  home: { path: '/es', label: 'Inicio' },
  quince: { path: '/es/cumpleanos-y-quinceaneras', label: 'Cumpleaños y quinceañeras' },
  features: { path: '/es/funciones', label: 'Funciones' },
  liveParty: { path: '/es/live-party', label: 'Live Party' },
  contact: { path: '/es/contacto', label: 'Contacto' },
} as const;

// The sign-up form opens in Spanish.
export const ES_REGISTER = '/register?lang=es';

export const ES_PRICE = `$${PLAN_ONE_TIME_PRICE} ${PLAN_CURRENCY}`;

// The English pages each Spanish page stands for (hreflang).
export const ES_ALTERNATES: Record<string, string> = {
  '/es': '/',
  '/es/cumpleanos-y-quinceaneras': '/events/celebrations',
  '/es/funciones': '/features',
  '/es/live-party': '/live-party',
  '/es/contacto': '/contact',
};

// ---------------------------------------------------------------------------
// The videos, in Spanish (public/videos/es). A video shows once its file is
// there; until then its section shows the picture instead.

type EsVideo = Video & { still: string };

export const ES_VIDEOS = {
  home: {
    src: '/videos/es/como-funciona-mygala.mp4',
    poster: '/videos/es/como-funciona-mygala.jpg',
    still: '/videos/mygala-how-it-works.webp',
    title: 'Cómo funciona MyGala',
    description: 'Elige un tema, crea la página de tu evento, envía las invitaciones, recibe las confirmaciones y, el día de la fiesta, comparte fotos, encuentra tu mesa, pide canciones y míralo en vivo. Todo en un minuto.',
    caption: 'Elige un tema, envía las invitaciones, recibe las confirmaciones y a celebrar. Todo en un minuto.',
    width: 1920,
    height: 1080,
    duration: 'PT57S',
    uploadDate: '2026-11-06',
  },
  temas: {
    src: '/videos/es/cambiar-tema.mp4',
    poster: '/videos/es/cambiar-tema.jpg',
    still: '/videos/features/change-theme.jpg',
    title: 'Cómo cambiar el tema de tu página en MyGala',
    description: 'Abre tu evento en el panel de MyGala y toca Themes. Filtra la galería por tipo de evento, toca una imagen para ver la página completa y toca Choose: tu página cambia al instante y tus nombres, fechas, textos y fotos se quedan.',
    caption: 'Toca Themes, elige un tema de la galería y toca Choose. Solo cambia el diseño.',
    width: 1920,
    height: 1080,
    duration: 'PT46S',
    uploadDate: '2026-11-06',
  },
  idiomas: {
    src: '/videos/es/cambiar-idioma.mp4',
    poster: '/videos/es/cambiar-idioma.jpg',
    still: '/videos/features/change-language.jpg',
    title: 'Cómo poner tu página de MyGala en español',
    description: 'Abre tu evento en el panel de MyGala, toca el menú y elige Español en Language. Los títulos, los botones, el formulario de confirmación, las fechas, la cuenta regresiva y los recordatorios cambian al instante.',
    caption: 'Toca el menú, busca Language y elige Español. Tus propias palabras se quedan como las escribiste.',
    width: 1920,
    height: 1080,
    duration: 'PT41S',
    uploadDate: '2026-11-06',
  },
  fotos: {
    src: '/videos/es/fotos-con-codigo-qr.mp4',
    poster: '/videos/es/fotos-con-codigo-qr.jpg',
    still: '/videos/features/guest-photo-qr-code.jpg',
    title: 'Cómo reunir las fotos de tus invitados con un código QR',
    description: 'Activa Guest Photos en tu panel de MyGala e imprime tus tarjetas con código QR. Tus invitados escanean el código y suben sus fotos, sin aplicación y sin cuenta, y tú las descargas todas con un clic.',
    caption: 'Una tarjeta con código QR en cada mesa, y todas las fotos de tus invitados en un solo lugar.',
    width: 1920,
    height: 1080,
    duration: 'PT30S',
    uploadDate: '2026-11-06',
  },
  mesas: {
    src: '/videos/es/encuentra-tu-mesa.mp4',
    poster: '/videos/es/encuentra-tu-mesa.jpg',
    still: '/videos/features/find-your-table.jpg',
    title: 'Cómo funciona Find Your Table en MyGala',
    description: 'Agrega tus mesas en el panel de MyGala y arrastra a tus invitados, o pega tu plano de mesas desde una hoja de cálculo. Actívalo e imprime el letrero con código QR: tus invitados escriben su nombre y ven su mesa.',
    caption: 'Acomoda a tus invitados en el panel, imprime el letrero con código QR y cada invitado encuentra su mesa.',
    width: 1920,
    height: 1080,
    duration: 'PT47S',
    uploadDate: '2026-11-06',
  },
  intercambio: {
    src: '/videos/es/intercambio-de-regalos.mp4',
    poster: '/videos/es/intercambio-de-regalos.jpg',
    still: '/videos/features/gift-exchange.jpg',
    title: 'Cómo organizar un amigo secreto con MyGala',
    description: 'Activa Gift Exchange en tu panel de MyGala, agrega el presupuesto y la fecha, y tus invitados se unen desde tu página. MyGala sortea los nombres y le avisa a cada persona, en secreto, a quién le regala.',
    caption: 'Tus invitados se unen desde tu página, MyGala sortea los nombres y cada quien descubre a quién le regala.',
    width: 1920,
    height: 1080,
    duration: 'PT43S',
    uploadDate: '2026-11-06',
  },
} satisfies Record<string, EsVideo>;

export type EsVideoKey = keyof typeof ES_VIDEOS;

export function esVideoReady(key: EsVideoKey): boolean {
  return existsSync(path.join(process.cwd(), 'public', ES_VIDEOS[key].src));
}

// ---------------------------------------------------------------------------
// /es

export const ES_HOME = {
  seo: {
    title: 'Páginas web para tu evento, gratis',
    description: 'Crea la página de tu boda, cumpleaños o quinceañera en minutos: elige un tema, envía las invitaciones y recibe las confirmaciones. Tu página y tus invitaciones, en español.',
    keywords: ['página web para evento', 'invitaciones digitales', 'página para quinceañera', 'página web de boda', 'confirmación de asistencia en línea', 'invitación con código QR'],
  } satisfies SeoMeta,
  steps: [
    { title: 'Elige un tema', text: 'Diseños para bodas, cumpleaños, quinceañeras, baby showers, posadas y más. Todos son gratis, y puedes cambiarlo cuando quieras.' },
    { title: 'Agrega los detalles', text: 'El nombre de tu evento, la fecha, el lugar y tu historia. Tu página queda lista en minutos, con mapa y cuenta regresiva.' },
    { title: 'Envía las invitaciones', text: 'Invitaciones a juego por correo, mensaje de texto o WhatsApp. Tus invitados confirman con un toque, sin crear una cuenta.' },
    { title: '¡A celebrar!', text: 'El día de la fiesta, tus invitados comparten fotos, encuentran su mesa, piden canciones y, quien no pueda venir, lo ve en vivo.' },
  ],
  props: [
    { title: 'Lista en minutos', text: 'Elige un tema, escribe los nombres y la fecha, y tu página ya está en línea. Sin diseñadores, sin programadores y sin esperas.' },
    { title: 'Todo en un solo lugar', text: 'Confirmaciones, el programa, la mesa de regalos, tu historia, las fotos de tus invitados y hasta las canciones: todo en una página que tú controlas.' },
    { title: 'En el idioma de tu familia', text: 'Tu página, tus invitaciones y los recordatorios salen en español. Y si tienes invitados que hablan inglés o francés, también.' },
  ],
  faqs: [
    { q: '¿Mi página y mis invitaciones pueden estar en español?', a: 'Sí. Elige Español en el menú de idioma y todo lo que MyGala escribe en tu página cambia: los títulos, los botones, el formulario de confirmación, las fechas, la cuenta regresiva y los recordatorios por correo. Tus propios textos se muestran tal como los escribes.' },
    { q: '¿El panel de MyGala está en español?', a: 'Por ahora, el panel donde preparas tu página está en inglés. Es muy visual y fácil de usar, y nuestros videos en español te muestran cada paso. Lo que ven tus invitados sí está en español.' },
    { q: '¿Mis invitados necesitan una cuenta o una aplicación?', a: 'No. Tus invitados solo abren tu enlace para confirmar su asistencia, ver los detalles o subir sus fotos. No tienen que registrarse ni instalar nada.' },
    { q: '¿Qué pasa con mi página después del evento?', a: `Se queda en línea como recuerdo. Las páginas gratis siguen visibles, y las páginas Live Party tienen todas las funciones durante ${PLAN_TERM_MONTHS} meses desde tu compra.` },
    { q: '¿Live Party es una suscripción?', a: `No. Es un solo pago de ${ES_PRICE} más impuestos por evento, que desbloquea todas las funciones durante ${PLAN_TERM_MONTHS} meses. Sin cargos recurrentes y sin guardar tu tarjeta.` },
  ] satisfies Faq[],
  themes: [
    { slug: 'alegria', name: 'Alegría', desc: 'Rosa, lila y dorado. Romántico y alegre, pensado para quinceañeras y dulces dieciséis.' },
    { slug: 'the-day', name: 'The Day', desc: 'Peonías blancas, verde salvia y detalles dorados. Clásico y elegante, para bodas inolvidables.' },
    { slug: 'balloons', name: 'Balloons', desc: 'Rojo, azul y dorado con globos y confeti. Divertido y festivo, para cumpleaños y fiestas infantiles.' },
    { slug: 'dia-de-los-muertos', name: 'Día de los Muertos', desc: 'Ciruela y cempasúchil, papel picado y calaveritas que bailan. Colorido y alegre, para celebrar la memoria.' },
    { slug: 'love', name: 'Love', desc: 'Rosa, frambuesa y durazno con corazones que flotan. Cálido y romántico, para bodas llenas de amor.' },
    { slug: 'christmas-party', name: 'Christmas Party', desc: 'Verde pino, rojo y luces doradas con nieve que cae. Acogedor, para posadas y fiestas navideñas.' },
  ],
};

// ---------------------------------------------------------------------------
// /es/cumpleanos-y-quinceaneras

export const ES_QUINCE = {
  seo: {
    title: 'Páginas para cumpleaños y quinceañeras',
    description: 'Crea la página de tu cumpleaños o tu quinceañera: invitaciones, confirmación de asistencia, programa de la misa y la fiesta, fotos con código QR, mesas y transmisión en vivo. Gratis y en español.',
    keywords: ['página para quinceañera', 'invitación de quinceañera digital', 'página web de cumpleaños', 'invitaciones de XV años', 'confirmación de asistencia quinceañera', 'mis XV años página web'],
  } satisfies SeoMeta,
  highlights: [
    { title: 'Temas que se ven de fiesta', text: 'Alegría, Fun Party, Balloons y más: elige el que va con tu celebración y cámbialo cuando quieras.' },
    { title: 'Confirmaciones sin perseguir a nadie', text: 'Tus invitados confirman con un toque y dicen cuántos vienen. Tu lista se llena sola.' },
    { title: 'Gratis para empezar', text: 'Crea tu página, envía las invitaciones y recibe las confirmaciones sin pagar nada.' },
  ],
  birthdays: [
    'Cumpleaños de adultos, fiestas infantiles y sorpresas.',
    'Baby showers y revelaciones de género, con temas para niña, niño o neutral.',
    'Graduaciones, jubilaciones y aniversarios.',
    'Dulces dieciséis y fiestas temáticas.',
  ],
  quince: [
    { title: 'El programa completo', text: 'La misa, la recepción, el vals, el brindis y el baile sorpresa, con su hora y su lugar. Tus invitados saben dónde estar en cada momento.' },
    { title: 'Tu corte de honor y tus padrinos', text: 'Agrega tus propias secciones para presentar a tus damas y chambelanes, y agradece a tus padrinos con su foto y unas palabras.' },
    { title: 'Mesa de regalos', text: 'Comparte el enlace de tu mesa de regalos o tu lluvia de sobres, para que nadie tenga que preguntar.' },
    { title: 'Encuentra tu mesa', text: 'Tus invitados escanean un letrero con código QR, escriben su nombre y ven su mesa. Nada que imprimir de nuevo si alguien cambia de lugar.' },
    { title: 'Las fotos de todos', text: 'Una tarjeta con código QR en cada mesa, y todas las fotos de tus invitados llegan a tu página. Sin aplicación y sin cuenta.' },
    { title: 'Para la familia lejos', text: 'Comparte la transmisión en vivo de la misa o del vals, para los abuelos y los tíos que no pueden viajar.' },
  ],
  themes: [
    { slug: 'alegria', name: 'Alegría', desc: 'Rosa, lila y dorado. Romántico y alegre, pensado para quinceañeras y dulces dieciséis.' },
    { slug: 'fun-party', name: 'Fun Party', desc: 'Rosa neón, azul y amarillo sobre grafiti. Atrevido, para una quinceañera que quiere destacar.' },
    { slug: 'balloons', name: 'Balloons', desc: 'Rojo, azul y dorado con globos y confeti. Divertido y festivo, para cumpleaños de todas las edades.' },
    { slug: 'baby-shower-girl', name: 'Girl Baby Shower', desc: 'Gris suave y rosa con un elefantito, una cigüeña y globos. Para el baby shower de una niña.' },
    { slug: 'baby-shower-neutral', name: 'Neutral Baby Shower', desc: 'Madera clara, azul y lavanda con un móvil de cuna. Para un baby shower antes de la gran revelación.' },
    { slug: 'baby-shower-boy', name: 'Boy Baby Shower', desc: 'Azul cielo y caramelo con una ballena y olas. Para el baby shower de un niño.' },
  ],
  faqs: [
    { q: '¿Puedo poner la misa y la fiesta en la misma página?', a: 'Sí. Agrega cada momento al programa del evento, con su hora y su lugar, y tus invitados ven el mapa y las indicaciones de cada uno.' },
    { q: '¿Mis invitados pueden confirmar cuántas personas vienen?', a: 'Sí. Al confirmar, cada invitado dice si viene y con cuántas personas, y tú lo ves todo en tu lista de invitados.' },
    { q: '¿Puedo presentar a mi corte de honor?', a: 'Sí. Con Live Party puedes agregar tus propias secciones, con texto y fotos, para presentar a tus damas, chambelanes y padrinos.' },
    { q: '¿La página puede estar en español y en inglés?', a: 'Tu página se muestra en el idioma que elijas, y tus propios textos se muestran tal como los escribes. Muchas familias escriben sus textos en los dos idiomas para sus invitados.' },
    { q: '¿Cuánto cuesta?', a: `Crear tu página, enviar invitaciones y recibir confirmaciones es gratis. Live Party, con todo para el día de la fiesta (mesas, presentación de fotos, transmisión en vivo y hasta 500 fotos), es un solo pago de ${ES_PRICE} más impuestos por evento.` },
  ] satisfies Faq[],
};

// ---------------------------------------------------------------------------
// /es/funciones

export type EsFeature = {
  id: string;
  short: string; // for the menus
  kicker: string;
  title: string;
  text: string;
  bullets: string[];
  plan: 'Gratis' | 'Live Party';
  video: EsVideoKey;
};

export const ES_FEATURES = {
  seo: {
    title: 'Funciones: invitaciones, fotos con QR, mesas y más',
    description: 'Todo lo que hace MyGala, en español: temas, páginas en español, fotos con código QR, Find Your Table, intercambio de regalos, invitaciones, confirmaciones, recordatorios y transmisión en vivo.',
    keywords: ['invitaciones digitales con confirmación', 'fotos de invitados con código QR', 'plano de mesas con código QR', 'amigo secreto en línea', 'página de evento en español'],
  } satisfies SeoMeta,
  rows: [
    {
      id: 'temas', short: 'Temas', kicker: 'Diseño', plan: 'Gratis', video: 'temas',
      title: 'Un tema para cada celebración',
      text: 'Elige entre más de 25 temas para bodas, cumpleaños, quinceañeras, baby showers, posadas y eventos de empresa. Cámbialo cuando quieras: tus textos y fotos se quedan.',
      bullets: ['Todos los temas son gratis', 'Cambia de tema en unos segundos', 'Las mismas funciones en cada tema'],
    },
    {
      id: 'idiomas', short: 'Idiomas', kicker: 'Idiomas', plan: 'Gratis', video: 'idiomas',
      title: 'Tu página en español, inglés o francés',
      text: 'Elige el idioma de tu página y MyGala traduce todo lo que escribe: los títulos, los botones, el formulario de confirmación, las fechas, la cuenta regresiva y los recordatorios por correo.',
      bullets: ['Gratis en todos los planes', 'Tus propios textos se quedan como los escribes', 'Perfecto para familias bilingües'],
    },
    {
      id: 'fotos', short: 'Fotos con código QR', kicker: 'El gran día', plan: 'Gratis', video: 'fotos',
      title: 'Las fotos de tus invitados, con un código QR',
      text: 'Imprime tarjetas con código QR para cada mesa. Tus invitados escanean el código y suben sus fotos desde su teléfono, y tú las descargas todas con un clic.',
      bullets: ['Sin aplicación y sin cuenta', 'Gratis hasta 50 fotos, y hasta 500 con Live Party', 'Un muro de fotos en tu página'],
    },
    {
      id: 'mesas', short: 'Find Your Table', kicker: 'El gran día', plan: 'Live Party', video: 'mesas',
      title: 'Find Your Table: cada invitado encuentra su mesa',
      text: 'Acomoda a tus invitados en un plano de mesas, o pégalo desde una hoja de cálculo. En la entrada, tus invitados escanean un letrero, escriben su nombre y ven su mesa.',
      bullets: ['Arrastra y suelta a tus invitados', 'Cambios al instante, nada que reimprimir', 'Cada invitado ve solo su mesa'],
    },
    {
      id: 'intercambio', short: 'Intercambio de regalos', kicker: 'Para la fiesta', plan: 'Gratis', video: 'intercambio',
      title: 'Intercambio de regalos (amigo secreto)',
      text: 'Gratis: tus invitados se unen desde tu página, con ideas de regalo. MyGala sortea los nombres, separa a las parejas si quieres y le avisa a cada persona, en secreto, a quién le regala.',
      bullets: ['Presupuesto, fecha y una nota', 'Nadie se saca a sí mismo', 'Cada quien recibe su correo en secreto', 'Mensajes anónimos y recordatorios'],
    },
  ] satisfies EsFeature[],
  more: [
    { icon: 'mail', title: 'Invitaciones', text: 'Invitaciones a juego con tu página, por correo, mensaje de texto o WhatsApp.', plan: 'Gratis' },
    { icon: 'rsvp', title: 'Confirmación de asistencia', text: 'Tus invitados confirman con un toque y dicen cuántos vienen.', plan: 'Gratis' },
    { icon: 'guests', title: 'Lista de invitados', text: 'Importa tu lista desde una hoja de cálculo o tus contactos.', plan: 'Gratis' },
    { icon: 'program', title: 'Programa del evento', text: 'La ceremonia, la recepción y cada momento, con hora y lugar.', plan: 'Gratis' },
    { icon: 'bell', title: 'Recordatorios por correo', text: 'Un mes, una semana o un día antes, en el idioma de tu página.', plan: 'Live Party' },
    { icon: 'video', title: 'Transmisión en vivo', text: 'Para que la familia que está lejos no se pierda nada.', plan: 'Live Party' },
    { icon: 'music', title: 'Peticiones de canciones', text: 'Tus invitados piden y votan las canciones de la pista de baile.', plan: 'Live Party' },
    { icon: 'potluck', title: 'Lista de platillos', text: 'Cada invitado se anota con lo que va a llevar a la fiesta.', plan: 'Gratis' },
    { icon: 'sections', title: 'Secciones propias y padrinos', text: 'Hospedaje, código de vestimenta, tu corte de honor y tus padrinos.', plan: 'Gratis' },
    { icon: 'gift', title: 'Mesa de regalos', text: 'Comparte tu mesa de regalos o tu lluvia de sobres.', plan: 'Gratis' },
    { icon: 'lock', title: 'Página con contraseña', text: 'Solo tus invitados pueden ver los detalles de tu evento.', plan: 'Live Party' },
    { icon: 'domain', title: 'Tu propio dominio', text: 'Usa tu propia dirección, como sofiaxv.com.', plan: 'Live Party' },
  ],
};

// ---------------------------------------------------------------------------
// The plans, in Spanish (app/lib/plans.ts PLAN_FEATURES).

export const ES_PLAN_FEATURES = {
  free: [
    'Todas las páginas de evento que necesites',
    'Todos los temas',
    'Confirmación de asistencia y número de invitados',
    'Elección de menú y alergias en la confirmación',
    'Lista de invitados (desde una hoja de cálculo o tus contactos)',
    'Invitaciones por correo, mensaje de texto y WhatsApp',
    'Cuenta regresiva y detalles del evento',
    'Programa del evento',
    'Presupuesto y recordatorios de fechas de confirmación',
    'Muro de fotos y códigos QR para las mesas (hasta 50 fotos)',
    'Amigo secreto con mensajes anónimos',
    'Lista de platillos',
    'Secciones propias y mesa de regalos',
    'Tu dirección en MyGala (mygala.ca/tunombre)',
  ],
  plus: [
    'Todo lo del plan Gratis',
    'Presentación de fotos en vivo para la pantalla',
    'Hasta 500 fotos de tus invitados',
    'Transmisión en vivo y peticiones de canciones',
    'Find Your Table, con letrero de código QR',
    'Recordatorios automáticos por correo',
    'Patrocinadores',
    'Página con contraseña',
    'Tu propio dominio',
    'Soporte prioritario',
  ],
};

// A Spanish page's metadata: the usual, in Spanish, with the English page it
// stands for as its hreflang alternate.
export function esMetadata(seo: SeoMeta, path: string): Metadata {
  const meta = marketingMetadata(seo, path);
  const english = ES_ALTERNATES[path];
  return {
    ...meta,
    alternates: { ...meta.alternates, languages: { es: path, ...(english ? { 'en-CA': english } : {}) } },
    openGraph: { ...meta.openGraph, locale: 'es_419', alternateLocale: ['en_CA'] },
  };
}
