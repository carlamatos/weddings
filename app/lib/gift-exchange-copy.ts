// Wording for the Gift Exchange messages and reveal page, in the event page's
// language. Client-safe: the dashboard builds the text/WhatsApp messages with it.

export type GiftLang = 'en' | 'fr' | 'es';

export function giftLang(language?: string | null): GiftLang {
  return language === 'fr' || language === 'es' ? language : 'en';
}

export const GIFT_COPY: Record<GiftLang, {
  subject: (event: string) => string;
  hi: (name: string) => string;
  drawn: (event: string) => string;
  youGiveTo: string;
  theirIdeas: string;
  noIdeas: string;
  budget: string;
  exchange: string;
  noteFromHost: string;
  openLink: string;
  keepSecret: string;
  viewEvent: string;
  textMessage: (args: { name: string; event: string; link: string; host?: string }) => string;
  footer: (event: string) => string;
  linkInvalid: string;
  notDrawnYet: string;
}> = {
  en: {
    subject: (event) => `Your Secret Santa for ${event} 🎁`,
    hi: (name) => `Hi ${name},`,
    drawn: (event) => `Names have been drawn for the ${event} gift exchange!`,
    youGiveTo: 'You’re the Secret Santa for',
    theirIdeas: 'Their gift ideas',
    noIdeas: 'No gift ideas yet — they can add some on the event page, so check this link again later.',
    budget: 'Budget',
    exchange: 'Gift exchange',
    noteFromHost: 'A note from your host',
    openLink: 'Open your Secret Santa',
    keepSecret: 'Shh — keep it a secret!',
    viewEvent: 'View the event page',
    textMessage: ({ name, event, link, host }) =>
      `Hi ${name}! 🎁 Names have been drawn for the ${event} gift exchange. Open this link to see who you're the Secret Santa for — it's just for you: ${link}${host ? `\n\n— ${host}` : ''}`,
    footer: (event) => `You’re receiving this because you’re part of the gift exchange for ${event}.`,
    linkInvalid: 'This Secret Santa link isn’t valid. Please ask your host to send it again.',
    notDrawnYet: 'Names haven’t been drawn yet — you’ll hear from your host soon.',
  },
  fr: {
    subject: (event) => `Votre Père Noël secret pour ${event} 🎁`,
    hi: (name) => `Bonjour ${name},`,
    drawn: (event) => `Le tirage au sort de l’échange de cadeaux de ${event} a eu lieu !`,
    youGiveTo: 'Vous êtes le Père Noël secret de',
    theirIdeas: 'Ses idées de cadeaux',
    noIdeas: 'Pas encore d’idées de cadeaux — elles peuvent être ajoutées sur la page de l’événement, revenez plus tard sur ce lien.',
    budget: 'Budget',
    exchange: 'Échange de cadeaux',
    noteFromHost: 'Un mot de votre hôte',
    openLink: 'Voir mon Père Noël secret',
    keepSecret: 'Chut — c’est un secret !',
    viewEvent: 'Voir la page de l’événement',
    textMessage: ({ name, event, link, host }) =>
      `Bonjour ${name} ! 🎁 Le tirage de l’échange de cadeaux de ${event} a eu lieu. Ouvrez ce lien pour savoir de qui vous êtes le Père Noël secret — il n’est que pour vous : ${link}${host ? `\n\n— ${host}` : ''}`,
    footer: (event) => `Vous recevez ce message parce que vous participez à l’échange de cadeaux de ${event}.`,
    linkInvalid: 'Ce lien n’est pas valide. Demandez à votre hôte de vous le renvoyer.',
    notDrawnYet: 'Le tirage n’a pas encore eu lieu — votre hôte vous écrira bientôt.',
  },
  es: {
    subject: (event) => `Tu amigo secreto para ${event} 🎁`,
    hi: (name) => `Hola, ${name}:`,
    drawn: (event) => `¡Ya se hizo el sorteo del intercambio de regalos de ${event}!`,
    youGiveTo: 'Eres el amigo secreto de',
    theirIdeas: 'Sus ideas de regalo',
    noIdeas: 'Todavía no hay ideas de regalo — se pueden añadir en la página del evento, así que vuelve a este enlace más tarde.',
    budget: 'Presupuesto',
    exchange: 'Intercambio de regalos',
    noteFromHost: 'Un mensaje de tu anfitrión',
    openLink: 'Ver mi amigo secreto',
    keepSecret: '¡Shh, es un secreto!',
    viewEvent: 'Ver la página del evento',
    textMessage: ({ name, event, link, host }) =>
      `¡Hola, ${name}! 🎁 Ya se hizo el sorteo del intercambio de regalos de ${event}. Abre este enlace para ver de quién eres el amigo secreto — es solo para ti: ${link}${host ? `\n\n— ${host}` : ''}`,
    footer: (event) => `Recibes este mensaje porque participas en el intercambio de regalos de ${event}.`,
    linkInvalid: 'Este enlace no es válido. Pide a tu anfitrión que te lo envíe de nuevo.',
    notDrawnYet: 'Todavía no se ha hecho el sorteo — tu anfitrión te escribirá pronto.',
  },
};
