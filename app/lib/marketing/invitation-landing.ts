import type { SeoMeta } from './types';
import { defaultInvitation, type InvitationDesign, type InvitationDetails } from '@/app/lib/invitation';
import { THEME_DEMOS } from '@/app/ui/themes/demo-content';
import { HERO_DEFAULTS } from '@/app/ui/themes/hero-defaults';
import { eventWhen } from '@/app/ui/themes/event-when';
import { THEME_CARDS } from './theme-cards';

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
  image?: string; // background photo; none = the theme's colour
  wash?: { color: string; opacity: number }; // over the photo, for legible text
  design?: Partial<Omit<InvitationDesign, 'background'>>;
  details?: Partial<InvitationDetails>;
};

export type InvitationLandingPage = {
  key: 'christmas' | 'weddings';
  path: string;
  seo: SeoMeta;
  start: 'invitation' | 'website'; // how sign-up starts (app/lib/start-intent.ts)
  cta: string;
  hero: {
    eyebrow: string;
    headline: string;
    sub: string;
    points: string[];
    secondary: { label: string; theme: string }; // "See a live invitation"
    invitation: InvitationSample;
    pageTheme: string; // the page the invitation opens into
  };
  gallery: { title: string; sub: string; groups: { title?: string; items: InvitationSample[] }[] };
  themes: { title: string; sub: string; slugs: string[] };
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
const EVERYDAY_COPY = {
  eyebrow: 'You’re invited to',
  message: 'We would love for you to join us. RSVP on our event page.',
  closing: 'See you there!',
};

const heroPhoto = (slug: string) => (HERO_DEFAULTS as Record<string, string>)[slug];
const CHRISTMAS_THEMES = ['merry', 'gnomes', 'white-christmas', 'christmas-party'];
const WEDDING_THEMES = THEME_CARDS.filter((t) => t.category === 'wedding').map((t) => t.slug);

// Every other theme, on its own banner photo under a wash of its own colour.
const OTHER_OCCASIONS: InvitationSample[] = THEME_CARDS
  .filter((t) => !CHRISTMAS_THEMES.includes(t.slug) && t.category !== 'wedding')
  .map((t) => {
    const preset = defaultInvitation(t.slug);
    const image = heroPhoto(t.slug);
    return { theme: t.slug, image, wash: image ? { color: preset.background.color, opacity: 0.76 } : undefined, design: EVERYDAY_COPY };
  });

export const INVITATION_LANDING_PAGES: Record<'christmas' | 'weddings', InvitationLandingPage> = {
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
        design: { headingFont: 'great-vibes', bodyFont: 'cormorant', textColor: '#F3F6F9', accentColor: '#E7CA6A', ...CHRISTMAS_COPY },
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
          items: [
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
          ],
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
      title: 'Every invitation opens into your wedding website',
      sub: 'RSVPs, your love story, the schedule, the venue with a map, a photo wall and more. Here are the wedding websites, scrolling.',
      slugs: WEDDING_THEMES,
    },
    final: {
      title: 'Your wedding website, ready in minutes',
      text: 'Free to create, with invitations to match. Guests need no account and no app — just your link.',
    },
  },
};

// The invitation's design and its sample event, as the designer would make it.
export function sampleInvitation(sample: InvitationSample): { design: InvitationDesign; details: InvitationDetails } {
  const base = defaultInvitation(sample.theme);
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
