// The hero image each theme shows when the owner hasn't uploaded a banner.
// Shared by the public themes and the dashboard editor so they can't drift
// apart. Terracotta Harvest has no image: it draws an illustration instead.
export const HERO_DEFAULTS = {
  'quiet-coastal': '/images/themes/quiet-coastal/coastal.png',
  'midnight-botanical': '/images/themes/midnight-botanical/woods.png',
  vilma: '/images/themes/vilma/hero-bg.jpg',
} as const;
