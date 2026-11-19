import { pickByLanguage } from '@/app/lib/translations';

// The short line above the names on each theme's banner ("Together with
// their families", "You're invited", …) when the host hasn't written their
// own, in the page's language. One list for the guests' page and the page
// editor, so they can't drift apart.
export const HERO_EYEBROWS: Record<string, { en: string; fr: string; es: string }> = {
  'alegria': { en: 'Join us in celebrating', fr: 'Rejoignez-nous pour célébrer', es: 'Únete a la celebración' },
  'antique-cars': { en: 'Antique & Classic', fr: 'Antiques et classiques', es: 'Antiguos y clásicos' },
  'baby-shower-boy': { en: "It's a boy!", fr: "C'est un garçon !", es: '¡Es niño!' },
  'baby-shower-girl': { en: "It's a girl!", fr: "C'est une fille !", es: '¡Es niña!' },
  'baby-shower-neutral': { en: 'Baby on the way!', fr: 'Bébé arrive !', es: '¡Bebé en camino!' },
  'balloons': { en: "It's party time", fr: "C'est l'heure de la fête", es: 'Es hora de la fiesta' },
  'blessings': { en: 'You’re invited', fr: 'Vous êtes invités', es: 'Estás invitado' },
  'christmas-party': { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' },
  'community': { en: "You're part of it", fr: 'Vous en faites partie', es: 'Eres parte de esto' },
  'dia-de-los-muertos': { en: 'Celebrate with us', fr: 'Célébrez avec nous', es: 'Celebra con nosotros' },
  'dinner-gala': { en: "You're cordially invited", fr: 'Vous êtes cordialement invités', es: 'Estás cordialmente invitado' },
  'fireworks': { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' },
  'forest': { en: 'We can’t wait to celebrate with you', fr: 'Nous avons hâte de célébrer avec vous', es: 'Estamos deseando celebrarlo con ustedes' },
  'fun-party': { en: "Let's get this party started", fr: 'La fête commence!', es: '¡Que empiece la fiesta!' },
  'gnomes': { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' },
  'halloween-party': { en: 'You’re invited… if you dare', fr: 'Vous êtes invités… si vous l’osez', es: 'Estás invitado… si te atreves' },
  'love': { en: 'Together with their families', fr: 'Avec leurs familles', es: 'Junto a sus familias' },
  'merry': { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' },
  'midnight-botanical': { en: 'Save the date', fr: 'Réservez la date', es: 'Reserva la fecha' },
  'nature': { en: 'Together with their families', fr: 'Avec leurs familles', es: 'Junto a sus familias' },
  'new-years-eve': { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' },
  'nexus': { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' },
  'quiet-coastal': { en: 'together with their families', fr: 'avec leurs familles', es: 'junto a sus familias' },
  'simple': { en: 'You’re invited', fr: 'Vous êtes invités', es: 'Estás invitado' },
  'summit': { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' },
  'terracotta-harvest': { en: 'Together with their families', fr: 'Avec leurs familles', es: 'Junto a sus familias' },
  'the-day': { en: 'Together with their families', fr: 'Avec leurs familles', es: 'Junto a sus familias' },
  'vilma': { en: 'Together with their families', fr: 'Avec leurs familles', es: 'Junto a sus familias' },
  'western': { en: 'Together with their families', fr: 'Avec leurs familles', es: 'Junto a sus familias' },
  'white-christmas': { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' },
  'wild-flores': { en: 'Together with their families', fr: 'Avec leurs familles', es: 'Junto a sus familias' },
};

const FALLBACK = { en: 'Together with their families', fr: 'Avec leurs familles', es: 'Junto a sus familias' };

export function heroEyebrowDefault(slug: string | null | undefined, language?: string): string {
  return pickByLanguage((slug && HERO_EYEBROWS[slug]) || FALLBACK, language);
}

const norm = (v: string) => v.trim().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').toLowerCase();

// A saved line that is just the theme's own default, in any language (the
// editor used to save it in English): shown in the page's language instead.
export function isDefaultHeroEyebrow(slug: string | null | undefined, saved: string | null | undefined): boolean {
  if (!saved) return false;
  const dict = (slug && HERO_EYEBROWS[slug]) || FALLBACK;
  const v = norm(saved);
  return [dict.en, dict.fr, dict.es].some((d) => norm(d) === v);
}
