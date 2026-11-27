export type OccasionSpotlightData = { eyebrow: string; title: string; text: string; label: string; href: string; image: string };

// The New Year's Eve band, on the home page and /party-celebrations.
export const NEW_YEARS_SPOTLIGHT: OccasionSpotlightData = {
  eyebrow: 'December 31',
  title: 'Throwing a New Year’s Eve party?',
  text: 'Two themes made for the countdown, gold and glitter or a sky of fireworks, with invitations to match, RSVPs and a countdown to midnight.',
  label: 'See the New Year’s Eve party page',
  href: '/new-years-eve-party',
  image: '/images/themes/fireworks/fireworks.jpeg',
};

// The same band in French (/fr) and Spanish (/es).
export const NEW_YEARS_SPOTLIGHT_FR: OccasionSpotlightData = {
  eyebrow: '31 décembre',
  title: 'Vous organisez un party du Nouvel An ?',
  text: 'Deux thèmes faits pour le décompte, or et paillettes ou ciel de feux d’artifice, avec des invitations assorties, les réponses de vos invités et un décompte jusqu’à minuit.',
  label: 'Voir la page du réveillon du Nouvel An',
  href: '/fr/reveillon-du-nouvel-an',
  image: NEW_YEARS_SPOTLIGHT.image,
};

export const NEW_YEARS_SPOTLIGHT_ES: OccasionSpotlightData = {
  eyebrow: '31 de diciembre',
  title: '¿Vas a hacer una fiesta de Año Nuevo?',
  text: 'Dos temas hechos para la cuenta regresiva, dorado y brillos o un cielo de fuegos artificiales, con invitaciones a juego, confirmaciones y una cuenta regresiva a la medianoche.',
  label: 'Ver la página de fiestas de Año Nuevo',
  href: '/es/fiesta-de-ano-nuevo',
  image: NEW_YEARS_SPOTLIGHT.image,
};
