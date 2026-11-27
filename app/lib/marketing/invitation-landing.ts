import type { SeoMeta } from './types';
import { NEW_YEARS_SPOTLIGHT, type OccasionSpotlightData } from './occasion-spotlight';
import { defaultInvitation, type InvitationDesign, type InvitationDetails } from '@/app/lib/invitation';
import { INVITATION_CATALOG, applyLook, type DesignStyle } from '@/app/lib/invitation-designs';
import { en } from '@/app/lib/dash-text/en';
import { THEME_DEMOS } from '@/app/ui/themes/demo-content';
import { HERO_DEFAULTS } from '@/app/ui/themes/hero-defaults';
import { eventWhen } from '@/app/ui/themes/event-when';
import { CELEBRATION_THEMES, THEME_CARDS } from './theme-cards';

// Invitation-first landing pages: /christmas-invitations (lead with the
// invitation; the page it opens into is the bonus) and /wedding-website
// (couples search for "website", so that word leads). Each page: a hero with
// the most beautiful invitation we can make, a gallery of invitations made
// with the real designer (app/ui/dashboard/invitation-card.tsx), then the
// themes as full pages scrolling in a phone. Layout:
// app/ui/marketing/invitation-landing-view.tsx.

// One invitation in the gallery: a theme's starting design (its fonts and
// colours) on a background photo with a colour wash, and the theme's sample
// event. Everything here can be made in the designer — the photo is one the
// host uploads.
export type InvitationSample = {
  theme: string;
  // One of the designer's styles (app/lib/invitation-designs.ts) instead of
  // the theme's own look: its artwork, fonts and colours, and its name on
  // the card. The theme still gives the sample event and the page it opens.
  style?: DesignStyle;
  image?: string; // background photo; none = the theme's colour
  wash?: { color: string; opacity: number }; // over the photo, for legible text
  design?: Partial<Omit<InvitationDesign, 'background'>>;
  details?: Partial<InvitationDetails>;
};

export type FunIcon = 'clock' | 'music' | 'schedule' | 'camera' | 'sparkles' | 'share';
export type LandingKey = 'christmas' | 'weddings' | 'celebrations' | 'new-years';

export type InvitationLandingPage = {
  key: LandingKey;
  path: string;
  seo: SeoMeta;
  start: 'invitation' | 'website'; // how sign-up starts (app/lib/start-intent.ts)
  // Buttons go here (with ?theme=) to choose a theme and try it before
  // signing up, instead of straight to sign-up.
  tryPath?: string;
  themesFirst?: boolean; // the scrolling websites before the invitation gallery
  cta: string;
  hero: {
    eyebrow: string;
    headline: string;
    sub: string;
    points: string[];
    secondary: { label: string; theme: string }; // "See a live invitation"
    invitation: InvitationSample;
    pageTheme: string; // the page the invitation opens into
    // The RSVP form beside the phone instead of the invitation (RSVP is what
    // these pages' visitors search for). The invitation still gives its theme,
    // name and date.
    rsvp?: boolean;
    // The words alone, centred over the New Year's Eve theme's banner
    // (sparklers, a gold sweep, the year in gold outline, falling confetti)
    // instead of the invitation and the phone.
    effect?: { kind: 'new-years'; year: string };
  };
  gallery: { title: string; sub: string; groups: { title?: string; items: InvitationSample[] }[] };
  themes: { title: string; sub: string; slugs: string[] };
  // Why it's fun: a row of short reasons after the hero (/new-years-eve-party).
  fun?: { title: string; sub: string; items: { icon: FunIcon; title: string; text: string }[]; note?: { text: string; label: string; href: string } };
  // A band pointing to a page for one occasion (the party page → New Year's).
  spotlight?: OccasionSpotlightData;
  // The free planning tools (budget, guest count, RSVP deadline…) above the final call to action.
  freeTools?: { title: string; sub: string };
  final: { title: string; text: string };
};

const CHRISTMAS_COPY = {
  eyebrow: 'You’re invited to',
  message: 'An evening of good food, carols and holiday cheer. Tap the link to RSVP and see the map.',
  closing: 'Merry Christmas!',
};
const WEDDING_COPY = {
  eyebrow: 'Together with their families',
  message: 'request the pleasure of your company as they celebrate their marriage.',
  closing: 'Dinner & dancing to follow',
};
const NEW_YEARS_COPY = {
  eyebrow: 'You’re invited to ring in',
  message: 'Bubbly at the door, music all night and a countdown to midnight. Tap the link to RSVP and see the map.',
  closing: 'Cheers to 2027!',
};
const EVERYDAY_COPY = {
  eyebrow: 'You’re invited to',
  message: 'We would love for you to join us. RSVP on our event page.',
  closing: 'See you there!',
};

const heroPhoto = (slug: string) => (HERO_DEFAULTS as Record<string, string>)[slug];
const CHRISTMAS_THEMES = ['merry', 'gnomes', 'white-christmas', 'christmas-party'];
const WEDDING_THEMES = THEME_CARDS.filter((t) => t.category === 'wedding').map((t) => t.slug);

// The Christmas invitations in the gallery (the Christmas and celebration pages).
const CHRISTMAS_GALLERY: InvitationSample[] = [
      // The Christmas designs from our licensed artwork, first.
      { theme: 'christmas-party', style: 'christmas-evergreen', design: CHRISTMAS_COPY },
      { theme: 'christmas-party', style: 'christmas-red-ribbon', design: CHRISTMAS_COPY },
      { theme: 'christmas-party', style: 'christmas-rustic', design: CHRISTMAS_COPY },
      { theme: 'christmas-party', style: 'christmas-candy-baubles', design: CHRISTMAS_COPY },
      { theme: 'white-christmas', image: '/images/themes/white-christmas/bauble.jpeg', wash: { color: '#10251C', opacity: 0.38 },
        design: { headingFont: 'great-vibes', bodyFont: 'cormorant', textColor: '#FFFFFF', accentColor: '#EBC595', ...CHRISTMAS_COPY } },
      { theme: 'christmas-party', image: heroPhoto('christmas-party'), wash: { color: '#1F2A36', opacity: 0.25 },
        design: { textColor: '#F4EDE1', accentColor: '#F2C46D', ...CHRISTMAS_COPY } },
      { theme: 'gnomes', image: '/images/themes/gnomes/rsvp.jpeg', wash: { color: '#F7F1EC', opacity: 0.55 },
        design: { headingFont: 'fredoka', bodyFont: 'poppins', textColor: '#476735', accentColor: '#D91D1A', ...CHRISTMAS_COPY } },
      { theme: 'christmas-party', image: '/images/themes/christmas-party/registry.jpeg', wash: { color: '#7A1016', opacity: 0.35 },
        design: { headingFont: 'great-vibes', bodyFont: 'lato', textColor: '#FFFFFF', accentColor: '#FFE3A3', divider: 'christmas-bells', frame: '', dividerColor: '#FFE3A3', ...CHRISTMAS_COPY } },
      { theme: 'white-christmas', image: heroPhoto('white-christmas'), wash: { color: '#EEF3F9', opacity: 0.35 },
        design: { divider: 'christmas-mistletoe', frame: '', ...CHRISTMAS_COPY } },
      { theme: 'merry',
        design: { headingFont: 'great-vibes', bodyFont: 'montserrat', textColor: '#F3F6F9', accentColor: '#E7CA6A', divider: 'christmas-baubles', frame: 'christmas-baubles', dividerColor: '#E7CA6A', frameColor: '#E7CA6A', ...CHRISTMAS_COPY } },
      { theme: 'christmas-party', image: '/images/themes/christmas-party/rsvp.jpeg', wash: { color: '#0E1F17', opacity: 0.55 },
        design: { headingFont: 'dancing-script', bodyFont: 'lato', textColor: '#FFF8EC', accentColor: '#F2C46D', divider: 'christmas-gift', frame: '', dividerColor: '#F2C46D', ...CHRISTMAS_COPY } },
      { theme: 'gnomes', image: '/images/themes/christmas-party/bokeh.jpeg', wash: { color: '#2A1A12', opacity: 0.45 },
        design: { headingFont: 'fredoka', bodyFont: 'poppins', textColor: '#FFF4E8', accentColor: '#FABA61', divider: 'christmas-candy', frame: 'christmas-candy', dividerColor: '#FABA61', frameColor: '#FABA61', ...CHRISTMAS_COPY } },
    ];

// A theme's starting design on its own banner photo under a wash of its own colour.
const onBanner = (slug: string): InvitationSample => {
  const preset = defaultInvitation(slug);
  const image = heroPhoto(slug);
  return { theme: slug, image, wash: image ? { color: preset.background.color, opacity: 0.76 } : undefined, design: EVERYDAY_COPY };
};

// Every other theme, on its own banner photo under a wash of its own colour.
const OTHER_OCCASIONS: InvitationSample[] = THEME_CARDS
  .filter((t) => !CHRISTMAS_THEMES.includes(t.slug) && t.category !== 'wedding')
  .map((t) => onBanner(t.slug));

// The celebration page's groups (CELEBRATION_THEMES' order), and
// everything else that isn't a wedding.
const BIRTHDAY_THEMES = ['balloons', 'fun-party', 'alegria'];
const BABY_SHOWER_THEMES = ['baby-shower-girl', 'baby-shower-neutral', 'baby-shower-boy'];
const HALLOWEEN_THEMES = ['halloween-party', 'dia-de-los-muertos'];
const MORE_OCCASIONS: InvitationSample[] = THEME_CARDS
  .filter((t) => !CELEBRATION_THEMES.includes(t.slug) && t.category !== 'wedding')
  .map((t) => onBanner(t.slug));

// The New Year's Eve page's two themes and its three invitations: Fireworks
// on its fireworks photo, and two of the designer's styles.
const NEW_YEARS_THEMES = ['new-years-eve', 'fireworks'];
const NEW_YEARS_GALLERY: InvitationSample[] = [
  { theme: 'new-years-eve', style: 'wedding-gold-flourish', design: NEW_YEARS_COPY },
  { theme: 'fireworks', style: 'birthday-confetti', design: NEW_YEARS_COPY },
  { theme: 'fireworks', image: '/images/themes/fireworks/fireworks.jpeg', wash: { color: '#0E0B14', opacity: 0.55 },
    design: { headingFont: 'playfair', bodyFont: 'josefin', textColor: '#FCF7EB', accentColor: '#FDE0A6', ...NEW_YEARS_COPY } },
];

export const INVITATION_LANDING_PAGES: Record<LandingKey, InvitationLandingPage> = {
  christmas: {
    key: 'christmas',
    path: '/christmas-invitations',
    seo: {
      title: 'Free Online Christmas Party Invitations with RSVP',
      description:
        'Create a beautiful online Christmas invitation in minutes — free. Pick a design, add the date and place, and share one link by email, text or WhatsApp. Guests RSVP, see the map and share photos.',
    },
    start: 'invitation',
    cta: 'Create my free invitation',
    hero: {
      eyebrow: 'Free Christmas party invitations',
      headline: 'Create your online Christmas invitation',
      sub: 'Pick a design, add the date and place, and share one link. Your invitation opens into a full party page, with RSVPs, the map and everyone’s photos.',
      points: [
        'Free to make and to send',
        'Send by email, text or WhatsApp',
        'RSVPs and guest counts come straight to you',
        'Map, schedule, RSVP and a photo wall included',
      ],
      secondary: { label: 'See a live invitation', theme: 'merry' },
      invitation: {
        theme: 'merry',
        image: '/images/invitations/merry-village.jpeg',
        design: { headingFont: 'great-vibes', bodyFont: 'cormorant', textColor: '#F3F6F9', accentColor: '#E7CA6A', frame: '', ...CHRISTMAS_COPY },
        details: { name: 'Merry & Bright', address: '100 Front St W, Toronto' },
      },
      pageTheme: 'merry',
    },
    gallery: {
      title: 'Invitations you can create',
      sub: 'Every design is yours to change: the words, fonts, colours and photo. Tap one to start with it.',
      groups: [
        {
          title: 'Christmas & holiday parties',
          items: CHRISTMAS_GALLERY,
        },
        { title: 'And for every other occasion', items: OTHER_OCCASIONS },
      ],
    },
    themes: {
      title: 'Your invitation opens into a full party page',
      sub: 'Each Christmas design is a whole page for your guests: RSVPs, the map, the evening’s schedule, a Secret Santa draw, potluck sign-ups and a photo wall. Here they are, scrolling.',
      slugs: CHRISTMAS_THEMES,
    },
    final: {
      title: 'Your Christmas invitation, ready in minutes',
      text: 'Free to create and send. Guests need no account and no app — just your link.',
    },
  },
  weddings: {
    key: 'weddings',
    path: '/wedding-website',
    seo: {
      title: 'Free Wedding Website & Invitations with RSVP',
      description:
        'Create your free wedding website and matching invitations in minutes. Beautiful templates, RSVPs with guest counts, schedule, map, guest photos — share one link by email, text or WhatsApp.',
    },
    start: 'website',
    tryPath: '/design-your-wedding-invitation',
    themesFirst: true,
    cta: 'Create my free wedding website',
    hero: {
      eyebrow: 'Free wedding websites & invitations',
      headline: 'Your wedding website, with invitations to match',
      sub: 'Choose a design, add your names and date, and send an invitation that opens into your wedding website, with RSVPs, your schedule, the venue and everyone’s photos.',
      points: [
        'Free wedding website and invitations',
        'Send by email, text or WhatsApp',
        'RSVPs with plus-ones and meal notes',
        'Schedule, map, guest photos and more',
      ],
      secondary: { label: 'See a live wedding website', theme: 'the-day' },
      invitation: {
        theme: 'the-day',
        image: heroPhoto('the-day'),
        wash: { color: '#F6F2E9', opacity: 0.7 },
        design: WEDDING_COPY,
      },
      pageTheme: 'the-day',
      rsvp: true,
    },
    gallery: {
      title: 'Wedding invitations you can create',
      sub: 'Each one matches its wedding website. Change the words, fonts, colours and photo. Tap one to start with it.',
      groups: [
        {
          items: WEDDING_THEMES.filter((s) => s !== 'the-day').map((slug): InvitationSample => {
            const preset = defaultInvitation(slug);
            // Quiet Coastal: a plain white card. Love: a stronger wash over its photo.
            // Nature: its watercolour greenery paper (its starting design).
            const image = slug === 'quiet-coastal' || slug === 'nature' ? undefined : heroPhoto(slug);
            const opacity = slug === 'love' ? 0.85 : 0.7;
            return { theme: slug, image, wash: image ? { color: preset.background.color, opacity } : undefined, design: WEDDING_COPY };
          }).concat([
            { theme: 'the-day', image: '/images/themes/the-day/photo-6.jpeg', wash: { color: '#F6F2E9', opacity: 0.55 },
              design: { headingFont: 'great-vibes', bodyFont: 'cormorant', divider: 'wedding-rings', frame: 'wedding-ribbon', ...WEDDING_COPY } },
            // Love's monogram layout: the initials in a leaf wreath, all in its rose.
            { theme: 'love',
              design: { layout: 'monogram', bodyFont: 'libre-baskerville', divider: '', frame: '', textColor: '#B23A5B', accentColor: '#B23A5B',
                eyebrow: 'You are joyfully invited to celebrate', message: '', closing: 'Reception to follow' } },
          ]),
        },
      ],
    },
    themes: {
      title: 'Choose the theme you love',
      sub: 'Each theme is a wedding website with an invitation to match: RSVPs, your love story, the schedule, the venue with a map, a photo wall and more. Scroll through them and pick your favourite.',
      slugs: WEDDING_THEMES,
    },
    freeTools: { title: 'Plan it with our free tools', sub: 'Set your budget, see how many guests will come, pick your RSVP deadline and find your colours. Free, no sign-up needed.' },
    final: {
      title: 'Your wedding website, ready in minutes',
      text: 'Free to create, with invitations to match. Guests need no account and no app — just your link.',
    },
  },
  celebrations: {
    key: 'celebrations',
    path: '/party-celebrations',
    seo: {
      title: 'Free Party Website with Invitations & RSVP',
      description:
        'Create a free party website for a birthday, baby shower, Halloween or Christmas party, with invitations to match. RSVPs, the map, a countdown and guest photos in one link.',
      keywords: ['party website', 'birthday party website', 'baby shower website', 'event website for a party', 'online party invitations', 'party rsvp website'],
    },
    start: 'website',
    tryPath: '/design-your-party-invitation',
    themesFirst: true,
    cta: 'Create my free event website',
    hero: {
      eyebrow: 'Free event websites & invitations',
      headline: 'Your event website, with invitations to match',
      sub: 'Birthdays, baby showers, Halloween, Christmas and every celebration in between. Choose a design, add the date, and share one link to your own event website, with RSVPs, the map, a countdown and everyone’s photos.',
      points: [
        'Free event website and invitations',
        'RSVPs and guest counts come straight to you',
        'Map, schedule, countdown and a photo wall',
        'Share it by email, text or WhatsApp',
      ],
      secondary: { label: 'See a live event website', theme: 'balloons' },
      invitation: onBanner('balloons'),
      pageTheme: 'balloons',
      rsvp: true,
    },
    gallery: {
      title: 'Invitations to match your website',
      sub: 'Every event website comes with an invitation in the same design. Change the words, fonts, colours and photo. Tap one to start with it.',
      groups: [
        { title: 'Birthdays', items: BIRTHDAY_THEMES.map(onBanner) },
        { title: 'Baby showers', items: BABY_SHOWER_THEMES.map(onBanner) },
        { title: 'Halloween', items: HALLOWEEN_THEMES.map(onBanner) },
        { title: 'More occasions', items: MORE_OCCASIONS },
        { title: 'Christmas & holiday events', items: [...CHRISTMAS_GALLERY, onBanner('new-years-eve'), onBanner('fireworks')] },
      ],
    },
    themes: {
      title: 'Choose the theme you love',
      sub: 'Each theme is a whole event website: RSVPs, the map, the schedule, a countdown, a photo wall and more, plus a Secret Santa draw and potluck sign-ups for the holidays. Scroll through them and pick your favourite.',
      slugs: CELEBRATION_THEMES,
    },
    spotlight: NEW_YEARS_SPOTLIGHT,
    final: {
      title: 'Your event website, ready in minutes',
      text: 'Free to create, with invitations to match. Guests need no account and no app — just your link.',
    },
  },
  'new-years': {
    key: 'new-years',
    path: '/new-years-eve-party',
    seo: {
      title: 'Free New Year’s Eve Party Invitations & Website with RSVP',
      description:
        'Plan your New Year’s Eve party with a free event website and invitations to match. A countdown to midnight, RSVPs, song requests, the map and everyone’s photos in one link.',
      keywords: ['new years eve party invitations', 'new years eve party website', 'new years party rsvp', 'online new years invitation', 'nye party invitation'],
    },
    start: 'website',
    tryPath: '/design-your-party-invitation',
    cta: 'Create my New Year’s party page',
    hero: {
      eyebrow: 'New Year’s Eve parties',
      headline: 'Ring in 2027 with your own party page',
      sub: 'Send an invitation that sparkles, then watch the RSVPs roll in. Your page counts down to midnight, collects everyone’s song requests and keeps the photos from the night in one place.',
      points: [
        'Free party page and invitations',
        'A live countdown to midnight',
        'RSVPs, plus-ones and song requests',
        'Share by email, text or WhatsApp',
      ],
      secondary: { label: 'See a live New Year’s page', theme: 'new-years-eve' },
      invitation: { theme: 'new-years-eve', image: '/images/themes/new-years-eve/rsvp.jpeg', wash: { color: '#181509', opacity: 0.3 },
        design: { headingFont: 'great-vibes', bodyFont: 'cormorant', textColor: '#F7F1E6', accentColor: '#E8BC76', ...NEW_YEARS_COPY } },
      pageTheme: 'fireworks',
      effect: { kind: 'new-years', year: '2027' },
    },
    fun: {
      title: 'The party starts before midnight',
      sub: 'New Year’s Eve is the one night everyone is in the mood to celebrate. Your page gets them excited from the moment they open the invitation, and keeps the fun going long after the ball drops.',
      items: [
        { icon: 'clock', title: 'A countdown to midnight', text: 'From the day they open your invitation, guests watch the days, hours and minutes tick down to the big moment.' },
        { icon: 'music', title: 'Everyone picks a song', text: 'Guests add a song when they RSVP, so the playlist is full of everyone’s favourites before the first toast.' },
        { icon: 'schedule', title: 'The plan for the night', text: 'Bubbly at the door, dinner, the countdown, dancing. Put the schedule, the dress code and the map on one page.' },
        { icon: 'camera', title: 'Photos from the night', text: 'Guests add their photos to your page, so the sparklers, the midnight kiss and the confetti end up in one place.' },
        { icon: 'sparkles', title: 'A look to match the night', text: 'Gold and glitter or a sky of fireworks: both themes move, sparkle and look great on every phone.' },
        { icon: 'share', title: 'One link for everyone', text: 'Send it by email, text or WhatsApp. Guests need no account and no app, and their replies come straight to you.' },
      ],
      note: { text: 'Want a party they’ll talk about all year? Live Party adds a live photo slideshow on the TV, song requests all night and a livestream for faraway friends.', label: 'See Live Party', href: '/live-party' },
    },
    gallery: {
      title: 'New Year’s invitations you can create',
      sub: 'Each one opens into your party page. Change the words, fonts, colours and photo. Tap one to start with it.',
      groups: [{ items: NEW_YEARS_GALLERY }],
    },
    themes: {
      title: 'Two themes made for the countdown',
      sub: 'Each one is a whole party page: RSVPs, a countdown to midnight, the night’s schedule, the map, song requests and a photo wall. Scroll through them and pick your favourite.',
      slugs: NEW_YEARS_THEMES,
    },
    final: {
      title: 'Your New Year’s Eve party, ready in minutes',
      text: 'Free to create, with invitations to match. Guests need no account and no app, just your link.',
    },
  },
};

// The invitation's design and its sample event, as the designer would make it.
export function sampleInvitation(sample: InvitationSample): { design: InvitationDesign; details: InvitationDetails } {
  const start = defaultInvitation(sample.theme);
  const look = sample.style ? INVITATION_CATALOG.find((x) => x.style === sample.style)?.look : undefined;
  const base = look ? applyLook(start, look) : start;
  const design: InvitationDesign = {
    ...base,
    ...sample.design,
    background: sample.image
      ? { kind: 'image', color: base.background.color, imageUrl: sample.image, overlay: !!sample.wash, overlayColor: sample.wash?.color ?? '#000000', overlayOpacity: sample.wash?.opacity ?? 0 }
      : base.background,
    showQr: false,
  };
  const demo = THEME_DEMOS[sample.theme] ?? {};
  const card = THEME_CARDS.find((t) => t.slug === sample.theme);
  const when = eventWhen({ eventDate: demo.eventDate ?? card?.sample.eventDate, eventTime: demo.eventTime, eventEndTime: demo.eventEndTime }, 'en-US');
  const details: InvitationDetails = {
    name: demo.heading || card?.sample.heading || 'Your event',
    date: when.date,
    time: when.time,
    venue: demo.venueName ?? '',
    address: [demo.city, demo.country].filter(Boolean).join(', '),
    url: `https://mygala.ca/themes/${sample.theme}`,
    ...sample.details,
  };
  return { design, details };
}

// The name under a gallery card: the style's, when it has one.
export const sampleStyleName = (sample: InvitationSample): string | undefined =>
  sample.style ? en.invitationDesigner.styles[sample.style] : undefined;
