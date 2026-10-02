import type { EventCategory } from '@/app/ui/themes/types';

// Showcase copy and sample hero content for each theme, used by the event
// type pages (/events/...). Same wording as the homepage cards.
export type ThemeCard = {
  slug: string;
  name: string;
  category: EventCategory;
  desc: string;
  sample: { heading: string; eventDate: string; city: string; country: string };
  bg: string;
};

export const THEME_CARDS: ThemeCard[] = [
  // Weddings
  { slug: 'the-day', name: 'The Day', category: 'wedding', bg: '#F6F2E9',
    desc: 'Ivory peonies and a white bouquet with sage-to-evergreen greenery and gold accents. Timeless and refined — built for classic, elegant weddings.',
    sample: { heading: 'Charlotte & James', eventDate: '2027-09-18', city: 'Niagara-on-the-Lake', country: 'ON' } },
  { slug: 'love', name: 'Love', category: 'wedding', bg: '#F6C4C3',
    desc: 'Blush, rose and raspberry with peach and soft greens. Romantic script, arched cards and rising hearts — built for warm, heartfelt weddings.',
    sample: { heading: 'Isabella & Mateo', eventDate: '2027-06-05', city: 'Kelowna', country: 'BC' } },
  { slug: 'terracotta-harvest', name: 'Terracotta Harvest', category: 'wedding', bg: '#F7F1E6',
    desc: 'Warm rust, ochre, and linen. Golden-hour, earthy, and intimate — built for outdoor and orchard weddings.',
    sample: { heading: 'Elena & Marcus', eventDate: '2027-09-25', city: 'Napa', country: 'CA' } },
  { slug: 'midnight-botanical', name: 'Midnight Botanical', category: 'wedding', bg: '#0F1F1A',
    desc: 'Deep emerald and antique gold. Formal and candlelit — built for evening affairs and manor venues.',
    sample: { heading: 'Amelia & Theo', eventDate: '2027-10-16', city: 'Montréal', country: 'QC' } },
  { slug: 'quiet-coastal', name: 'Quiet Coastal', category: 'wedding', bg: '#FFFFFF',
    desc: 'Sage, sand, and chalk. Airy and minimal — built for beach ceremonies and destination weddings.',
    sample: { heading: 'Maya & Sam', eventDate: '2027-07-10', city: 'Tofino', country: 'BC' } },
  { slug: 'vilma', name: 'Vilma', category: 'wedding', bg: '#FFFFFF',
    desc: 'Watercolour washes, steel blue, and amber accents. Soft and romantic — built for garden and manor weddings.',
    sample: { heading: 'Sofia & Daniel', eventDate: '2027-05-29', city: 'Victoria', country: 'BC' } },

  // Celebrations
  { slug: 'alegria', name: 'Alegría', category: 'birthdays', bg: '#FFF8F3',
    desc: 'Blush, lilac, and gold. Romantic and joyful — built for quinceañeras and sweet 16 celebrations.',
    sample: { heading: 'Quinceañera Party', eventDate: '2027-06-12', city: 'San Antonio', country: 'TX' } },
  { slug: 'fun-party', name: 'Fun Party', category: 'birthdays', bg: '#1A0B2E',
    desc: 'Hot pink, cyan, and neon yellow on a graffiti backdrop. Bold and rebellious — built for sweet 16s and quinceañeras that want to stand out.',
    sample: { heading: 'The Big Sweet 16', eventDate: '2027-08-08', city: 'Miami', country: 'FL' } },
  { slug: 'balloons', name: 'Balloons', category: 'birthdays', bg: 'linear-gradient(135deg, #FFFDF6 0%, #EAF4FF 100%)',
    desc: 'Bright red, blue, and gold with floating balloons and confetti. Fun and festive — built for birthday parties and kids’ celebrations.',
    sample: { heading: 'Kids Birthday Bash', eventDate: '2026-11-14', city: 'Austin', country: 'TX' } },
  { slug: 'baby-shower-girl', name: 'Girl Baby Shower', category: 'birthdays', bg: '#F5D7DF',
    desc: 'Soft greys and blush pinks with a baby elephant, a flying stork, rising balloons and hearts — built for baby showers welcoming a little girl.',
    sample: { heading: 'Baby Shower', eventDate: '2027-04-17', city: 'Vancouver', country: 'BC' } },
  { slug: 'baby-shower-neutral', name: 'Neutral Baby Shower', category: 'birthdays', bg: '#E3E5E8',
    desc: 'Whitewashed wood, soft blues and lavender with a baby elephant, a swinging crib mobile and little footprints — built for baby showers before the big reveal.',
    sample: { heading: 'Baby Shower', eventDate: '2027-05-22', city: 'Victoria', country: 'BC' } },
  { slug: 'baby-shower-boy', name: 'Boy Baby Shower', category: 'birthdays', bg: '#8DC8F0',
    desc: 'Sky blues and warm caramel with a swimming whale, rising balloons and rolling waves — built for baby showers welcoming a little boy.',
    sample: { heading: 'Baby Shower', eventDate: '2027-06-12', city: 'Calgary', country: 'AB' } },

  // Business events
  { slug: 'summit', name: 'Summit', category: 'business', bg: '#14171C',
    desc: 'Cobalt and ink with a confident, modern edge — built for conferences, galas, and company celebrations.',
    sample: { heading: 'Annual Leadership Summit', eventDate: '2027-04-14', city: 'Austin', country: 'TX' } },
  { slug: 'nexus', name: 'Nexus', category: 'business', bg: '#1D2124',
    desc: 'Charcoal and amber with a teal accent. Professional and innovative — built for team offsites and summits.',
    sample: { heading: 'Nexus Team Offsite 2027', eventDate: '2027-05-20', city: 'Seattle', country: 'WA' } },
  { slug: 'dinner-gala', name: 'Dinner Gala', category: 'business', bg: '#0a1420',
    desc: 'Deep navy and warm gold, sober and refined — built for galas, fundraisers, and formal corporate dinners.',
    sample: { heading: 'The Annual Gala Dinner', eventDate: '2027-03-20', city: 'Toronto', country: 'CA' } },

  // General events
  { slug: 'community', name: 'Community Day', category: 'community', bg: '#F6E0BD',
    desc: 'Warm cream and navy with a rainbow of festival bunting. Fun and elegant at once — built for block parties, fairs, and neighborhood celebrations.',
    sample: { heading: 'Maple Street Block Party', eventDate: '2027-06-19', city: 'Portland', country: 'OR' } },
  { slug: 'antique-cars', name: 'Antique Cars', category: 'community', bg: '#57C0B9',
    desc: 'Teal, deep purple, and golden yellow with checkered flags, wire wheels, and a classic car cruising the page — built for antique and classic car shows.',
    sample: { heading: 'Classic Car Show', eventDate: '2027-06-19', city: 'Maple Ridge', country: 'BC' } },
  { slug: 'christmas-party', name: 'Christmas Party', category: 'community', bg: '#2C3138',
    desc: 'Forest green, bauble red and golden light with falling snow, twinkling string lights and a swinging bauble countdown — cozy and cute for holiday parties.',
    sample: { heading: 'Christmas Party', eventDate: '2026-12-19', city: 'Banff', country: 'AB' } },
  { slug: 'white-christmas', name: 'White Christmas', category: 'community', bg: '#DAE4F0',
    desc: 'Icy winter blues with gold stars, silver and pine, gold-framed cards and gently falling snow — classic and elegant for holiday celebrations.',
    sample: { heading: 'White Christmas', eventDate: '2026-12-12', city: 'Lake Louise', country: 'AB' } },
  { slug: 'dia-de-los-muertos', name: 'Día de los Muertos', category: 'community', bg: '#FBB813',
    desc: 'Deep plum and marigold with hot pink and teal, swaying papel picado, falling petals and dancing sugar skulls — joyful and colourful for remembrance celebrations.',
    sample: { heading: 'Día de los Muertos', eventDate: '2026-11-01', city: 'Toronto', country: 'ON' } },
  { slug: 'halloween-party', name: 'Halloween Party', category: 'community', bg: '#1F1D1E',
    desc: 'Midnight charcoal and pumpkin orange with flying bats, dangling spiders, rolling fog and a creeping witch’s hand — scary, but fun.',
    sample: { heading: 'Halloween Party', eventDate: '2026-10-31', city: 'Niagara-on-the-Lake', country: 'ON' } },
];

export function themeCardsFor(category: EventCategory): ThemeCard[] {
  return THEME_CARDS.filter((t) => t.category === category);
}
