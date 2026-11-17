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
  // reminder emails, a week and a day before the exchange date
  reminderSubject: (kind: 'week' | 'eve', event: string) => string;
  reminderLead: (kind: 'week' | 'eve', event: string, when: string) => string;
  // "make your own" call to action on the reveal page and in emails
  ownPage: string;
  ownPageLink: string;
  // anonymous messages between a Secret Santa and their giftee
  askGiftee: (name: string) => string;
  askGifteeHint: string;
  msgSanta: string;
  msgSantaHint: string;
  msgPlaceholder: string;
  send: string;
  sending: string;
  sent: string;
  you: string;
  yourSanta: string;
  msgFailed: string;
  msgSubjectFromSanta: (event: string) => string;
  msgSubjectFromGiftee: (name: string) => string;
  msgLeadFromSanta: (event: string) => string;
  msgLeadFromGiftee: (name: string) => string;
  reply: string;
  // the guest's "you're in" email, sent when they join
  joinedSubject: (event: string) => string;
  joinedLead: (event: string) => string;
  yourIdeas: string;
  joinedNoIdeas: string;
  joinedNext: string;
  joinedUpdate: string;
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
    reminderSubject: (kind, event) => kind === 'week' ? `One week to go: the ${event} gift exchange 🎁` : `Tomorrow: the ${event} gift exchange 🎁`,
    reminderLead: (kind, event, when) => kind === 'week' ? `The ${event} gift exchange is one week away (${when}). Time to find a gift!` : `The ${event} gift exchange is tomorrow (${when}). Don’t forget your gift!`,
    ownPage: 'Planning a party of your own? Make a free event page with RSVPs, photos and a Secret Santa.',
    ownPageLink: 'Make yours free on MyGala',
    askGiftee: (name) => `Ask ${name} a question`,
    askGifteeHint: 'They get it by email without knowing it’s from you. Handy for sizes, colours or allergies.',
    msgSanta: 'Message your Secret Santa',
    msgSantaHint: 'Your Secret Santa gets it by email. You still won’t know who they are.',
    msgPlaceholder: 'Write a message…',
    send: 'Send',
    sending: 'Sending…',
    sent: 'Sent!',
    you: 'You',
    yourSanta: 'Your Secret Santa',
    msgFailed: 'Couldn’t send your message. Please try again.',
    msgSubjectFromSanta: (event) => `Your Secret Santa for ${event} sent you a message 🎁`,
    msgSubjectFromGiftee: (name) => `${name} replied to your message 🎁`,
    msgLeadFromSanta: (event) => `Your Secret Santa for ${event} sent you a message:`,
    msgLeadFromGiftee: (name) => `${name}, the person you’re the Secret Santa for, wrote back:`,
    reply: 'Read and reply',
    joinedSubject: (event) => `You’re in the ${event} Secret Santa 🎁`,
    joinedLead: (event) => `You’re signed up for the ${event} gift exchange.`,
    yourIdeas: 'Your gift ideas',
    joinedNoIdeas: 'You didn’t add any gift ideas. Add some on the event page so your Secret Santa knows what you’d love.',
    joinedNext: 'Once your host draws names, we’ll email you who you’re the Secret Santa for. To change your gift ideas, join again on the event page with this same email.',
    joinedUpdate: 'Update your gift ideas',
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
    reminderSubject: (kind, event) => kind === 'week' ? `Plus qu’une semaine : l’échange de cadeaux de ${event} 🎁` : `Demain : l’échange de cadeaux de ${event} 🎁`,
    reminderLead: (kind, event, when) => kind === 'week' ? `L’échange de cadeaux de ${event} a lieu dans une semaine (${when}). C’est le moment de trouver un cadeau !` : `L’échange de cadeaux de ${event} a lieu demain (${when}). N’oubliez pas votre cadeau !`,
    ownPage: 'Vous organisez une fête ? Créez une page d’événement gratuite avec RSVP, photos et Père Noël secret.',
    ownPageLink: 'Créez la vôtre gratuitement sur MyGala',
    askGiftee: (name) => `Poser une question à ${name}`,
    askGifteeHint: 'La personne la reçoit par courriel sans savoir qu’elle vient de vous. Pratique pour les tailles, les couleurs ou les allergies.',
    msgSanta: 'Écrire à votre Père Noël secret',
    msgSantaHint: 'Votre Père Noël secret le reçoit par courriel. Vous ne saurez toujours pas qui c’est.',
    msgPlaceholder: 'Écrivez un message…',
    send: 'Envoyer',
    sending: 'Envoi…',
    sent: 'Envoyé !',
    you: 'Vous',
    yourSanta: 'Votre Père Noël secret',
    msgFailed: 'Impossible d’envoyer votre message. Veuillez réessayer.',
    msgSubjectFromSanta: (event) => `Votre Père Noël secret pour ${event} vous a écrit 🎁`,
    msgSubjectFromGiftee: (name) => `${name} a répondu à votre message 🎁`,
    msgLeadFromSanta: (event) => `Votre Père Noël secret pour ${event} vous a écrit :`,
    msgLeadFromGiftee: (name) => `${name}, la personne dont vous êtes le Père Noël secret, vous a répondu :`,
    reply: 'Lire et répondre',
    joinedSubject: (event) => `Vous participez au Père Noël secret de ${event} 🎁`,
    joinedLead: (event) => `Votre inscription à l’échange de cadeaux de ${event} est confirmée.`,
    yourIdeas: 'Vos idées de cadeaux',
    joinedNoIdeas: 'Vous n’avez pas ajouté d’idées de cadeaux. Ajoutez-en sur la page de l’événement pour que votre Père Noël secret sache ce qui vous ferait plaisir.',
    joinedNext: 'Quand votre hôte aura fait le tirage, nous vous écrirons pour vous dire de qui vous êtes le Père Noël secret. Pour modifier vos idées de cadeaux, inscrivez-vous de nouveau sur la page de l’événement avec ce même courriel.',
    joinedUpdate: 'Modifier mes idées de cadeaux',
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
    reminderSubject: (kind, event) => kind === 'week' ? `Falta una semana: el intercambio de regalos de ${event} 🎁` : `Mañana: el intercambio de regalos de ${event} 🎁`,
    reminderLead: (kind, event, when) => kind === 'week' ? `Falta una semana para el intercambio de regalos de ${event} (${when}). ¡Es hora de buscar el regalo!` : `El intercambio de regalos de ${event} es mañana (${when}). ¡No olvides tu regalo!`,
    ownPage: '¿Organizas una fiesta? Crea gratis la página de tu evento, con confirmaciones, fotos y amigo secreto.',
    ownPageLink: 'Crea la tuya gratis en MyGala',
    askGiftee: (name) => `Hazle una pregunta a ${name}`,
    askGifteeHint: 'Le llega por correo sin saber que es tuya. Útil para tallas, colores o alergias.',
    msgSanta: 'Escríbele a tu amigo secreto',
    msgSantaHint: 'Tu amigo secreto lo recibe por correo. Seguirás sin saber quién es.',
    msgPlaceholder: 'Escribe un mensaje…',
    send: 'Enviar',
    sending: 'Enviando…',
    sent: '¡Enviado!',
    you: 'Tú',
    yourSanta: 'Tu amigo secreto',
    msgFailed: 'No se pudo enviar tu mensaje. Inténtalo de nuevo.',
    msgSubjectFromSanta: (event) => `Tu amigo secreto de ${event} te escribió 🎁`,
    msgSubjectFromGiftee: (name) => `${name} respondió a tu mensaje 🎁`,
    msgLeadFromSanta: (event) => `Tu amigo secreto de ${event} te escribió:`,
    msgLeadFromGiftee: (name) => `${name}, la persona de quien eres amigo secreto, te respondió:`,
    reply: 'Leer y responder',
    joinedSubject: (event) => `Ya estás en el amigo secreto de ${event} 🎁`,
    joinedLead: (event) => `Ya estás inscrito en el intercambio de regalos de ${event}.`,
    yourIdeas: 'Tus ideas de regalo',
    joinedNoIdeas: 'No agregaste ideas de regalo. Agrégalas en la página del evento para que tu amigo secreto sepa qué te gustaría.',
    joinedNext: 'Cuando tu anfitrión haga el sorteo, te escribiremos para decirte de quién eres el amigo secreto. Para cambiar tus ideas de regalo, vuelve a inscribirte en la página del evento con este mismo correo.',
    joinedUpdate: 'Cambiar mis ideas de regalo',
  },
};

// The organizer's email when someone joins their Secret Santa from the
// event page. Follows the page's language, like the other organizer emails.
export const GIFT_HOST_COPY: Record<GiftLang, {
  subject: (name: string, event: string) => string;
  hi: (name: string) => string;
  lead: (name: string, event: string) => string;
  count: (n: number) => string;
  ready: string;
  needMore: (left: number) => string;
  ideas: string;
  noIdeas: string;
  button: string;
  footer: string;
}> = {
  en: {
    subject: (name, event) => `${name} joined your Secret Santa · ${event}`,
    hi: (name) => (name ? `Hi ${name},` : 'Hi there,'),
    lead: (name, event) => `${name} just joined the gift exchange for ${event}.`,
    count: (n) => `${n} ${n === 1 ? 'person has' : 'people have'} joined so far.`,
    ready: 'You can draw names whenever everyone’s in. Sign-ups close once names are drawn.',
    needMore: (left) => `${left} more ${left === 1 ? 'person' : 'people'} and you can draw names.`,
    ideas: 'Their gift ideas',
    noIdeas: 'No gift ideas yet',
    button: 'Open your Secret Santa',
    footer: 'You get this email because RSVP notifications are on for this page. To stop them, untick “Email me when someone RSVPs” in Guests & RSVPs.',
  },
  fr: {
    subject: (name, event) => `${name} participe à votre Père Noël secret · ${event}`,
    hi: (name) => (name ? `Bonjour ${name},` : 'Bonjour,'),
    lead: (name, event) => `${name} vient de s’inscrire à l’échange de cadeaux de ${event}.`,
    count: (n) => `${n} ${n === 1 ? 'personne inscrite' : 'personnes inscrites'} jusqu’à présent.`,
    ready: 'Vous pouvez faire le tirage dès que tout le monde est inscrit. Les inscriptions ferment après le tirage.',
    needMore: (left) => `Encore ${left} ${left === 1 ? 'personne' : 'personnes'} et vous pourrez faire le tirage.`,
    ideas: 'Ses idées de cadeaux',
    noIdeas: 'Pas encore d’idées de cadeaux',
    button: 'Ouvrir mon Père Noël secret',
    footer: 'Vous recevez ce courriel parce que les avis de réponse sont activés pour cette page. Pour les arrêter, décochez « M’écrire quand quelqu’un répond » dans Invités et réponses.',
  },
  es: {
    subject: (name, event) => `${name} se unió a tu amigo secreto · ${event}`,
    hi: (name) => (name ? `Hola, ${name}:` : 'Hola:'),
    lead: (name, event) => `${name} acaba de inscribirse en el intercambio de regalos de ${event}.`,
    count: (n) => `Hasta ahora ${n === 1 ? 'hay 1 persona inscrita' : `hay ${n} personas inscritas`}.`,
    ready: 'Puedes hacer el sorteo cuando ya estén todos. Las inscripciones se cierran después del sorteo.',
    needMore: (left) => `${left === 1 ? 'Falta 1 persona' : `Faltan ${left} personas`} para poder hacer el sorteo.`,
    ideas: 'Sus ideas de regalo',
    noIdeas: 'Todavía no hay ideas de regalo',
    button: 'Abrir mi amigo secreto',
    footer: 'Recibes este correo porque los avisos de confirmación están activados para esta página. Para dejar de recibirlos, desmarca «Escribirme cuando alguien responda» en Invitados y confirmaciones.',
  },
};
