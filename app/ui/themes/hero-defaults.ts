// The hero image (or video) each theme shows when the owner hasn't uploaded
// a banner. Shared by the public themes and the dashboard editor so they
// can't drift apart. Terracotta Harvest has no default: it draws an
// illustration instead (see its DefaultHero export).
export const HERO_DEFAULTS = {
  'quiet-coastal': '/images/themes/quiet-coastal/coastal.png',
  'midnight-botanical': '/images/themes/midnight-botanical/woods.png',
  vilma: '/images/themes/vilma/hero-bg.jpg',
  alegria: '/videos/alegria-hero.mp4',
  'fun-party': '/images/themes/fun-party/hero.png',
  summit: '/images/themes/summit/hero.jpeg',
  nexus: '/images/themes/nexus/hero.jpeg',
  'dinner-gala': '/images/themes/dinner-gala/gala-banner.svg',
  community: '/images/themes/community/hero.jpeg',
  'antique-cars': '/images/themes/antique-cars/hero.jpeg',
  'baby-shower-girl': '/images/themes/baby-shower-girl/hero.jpeg',
  'baby-shower-neutral': '/images/themes/baby-shower-neutral/hero.jpeg',
  'baby-shower-boy': '/images/themes/baby-shower-boy/hero.jpeg',
  'the-day': '/images/themes/the-day/hero.jpeg',
  love: '/images/themes/love/hero.jpeg',
  'christmas-party': '/images/themes/christmas-party/hero.jpeg',
  // Balloons has no default cover photo — its hero is a gradient with a
  // decorative balloon graphic (see hero-balloons.png), not a full-bleed
  // background image, so it's intentionally absent here (like Terracotta).
} as const;
