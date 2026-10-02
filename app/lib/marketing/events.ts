import type { EventCategory } from '@/app/ui/themes/types';
import type { ContentBlock, Faq, SeoMeta } from './types';

// The event type pages under /events/<slug>, one per homepage theme
// category. `category` matches the theme registry's categories.

export type EventType = {
  slug: string;
  category: EventCategory;
  name: string; // "Weddings", used in menus and "Learn more about … events"
  learnMoreLabel: string; // homepage link text
  seo: SeoMeta;
  eyebrow: string;
  h1: string;
  lead: string;
  occasions: string[]; // kinds of events this covers
  blocks: ContentBlock[];
  featureSlugs: string[]; // most relevant feature pages
  faqs: Faq[];
  cta: { title: string; text: string };
};

export const EVENT_TYPES: EventType[] = [
  {
    slug: 'weddings',
    category: 'wedding',
    name: 'Weddings',
    learnMoreLabel: 'Learn more about wedding events',
    seo: {
      title: 'Wedding Website with RSVP, Photos & Livestream',
      description:
        'Create a wedding website in minutes: RSVP with guest count, schedule, map, guest photo QR codes, livestream, registry and reminders. Start free.',
      keywords: ['wedding website', 'wedding website templates', 'wedding RSVP website', 'free wedding website', 'wedding photo sharing QR code', 'wedding livestream page', 'bilingual wedding website'],
    },
    eyebrow: 'Wedding websites',
    h1: 'A wedding website your guests will actually use',
    lead:
      'One link for everything: your story, the ceremony and reception details, RSVPs, the schedule, travel information, your registry, a live stream for faraway family and every photo your guests take.',
    occasions: ['Weddings and elopements', 'Engagement parties', 'Rehearsal dinners', 'Vow renewals', 'Anniversary celebrations', 'Destination weddings'],
    blocks: [
      {
        heading: 'Everything a wedding website needs',
        bullets: [
          'RSVPs with guest counts, attending/declining and notes — exportable to CSV.',
          'Ceremony and reception details with a map and directions.',
          'A schedule for the whole weekend, from the welcome drinks to the brunch.',
          'Your story, a photo gallery and a countdown to the big day.',
          'Travel, hotels and dress code in your own custom sections (Plus).',
          'A registry link with your own message about gifts (Plus).',
        ],
      },
      {
        heading: 'Made for guests near and far',
        paragraphs: [
          'Stream the ceremony for family who can’t travel, publish the page in English, Spanish or French for bilingual families, and send automatic reminder emails the week before so nobody misses the shuttle.',
          'At the reception, put a QR code on every table so guests can upload their photos straight to your page — then download them all after the honeymoon.',
        ],
      },
    ],
    featureSlugs: ['guest-photo-qr-code', 'livestream', 'event-reminder-emails', 'event-page-translations', 'custom-sections', 'custom-domain'],
    faqs: [
      { q: 'Is a MyGala wedding website free?', a: 'Yes. Free event pages include every theme, RSVPs, the countdown, event details and the event program. Plus is a one-time payment per event that adds premium features like guest photos, livestream, registry and a custom domain.' },
      { q: 'Can guests RSVP for their partner or family?', a: 'Yes. The RSVP form asks how many guests are coming, so one person can reply for their whole party.' },
      { q: 'Can I put our registry on the wedding website?', a: 'Yes. With Plus, add a registry section linking to any store or registry site, with your own message.' },
      { q: 'Can I keep the website after the wedding?', a: 'Yes. Your page stays online as a keepsake. Free pages stay viewable; Plus features stay on for 15 months from purchase and can be extended.' },
      { q: 'Can I use our own domain name?', a: 'Yes, with Plus. Connect a domain like sarahandjohn.com and share that on your invitations.' },
    ],
    cta: { title: 'Start your wedding website today', text: 'Pick a wedding theme, add your details and share one link with every guest.' },
  },
  {
    slug: 'celebrations',
    category: 'birthdays',
    name: 'Celebrations',
    learnMoreLabel: 'Learn more about celebration events',
    seo: {
      title: 'Birthday, Baby Shower & Quinceañera Websites',
      description:
        'Make a party page for a birthday, baby shower, quinceañera or sweet 16: RSVP with guest count, countdown, registry, guest photos and reminders. Free.',
      keywords: ['birthday party website', 'baby shower website', 'quinceañera website', 'sweet 16 website', 'party RSVP website', 'online party invitation', 'baby shower registry page'],
    },
    eyebrow: 'Celebration websites',
    h1: 'A party page for every milestone',
    lead:
      'Birthdays, baby showers, quinceañeras, sweet 16s, graduations and retirements — give your celebration its own page with RSVPs, a countdown, the party details and a place for everyone’s photos.',
    occasions: ['Birthday parties and kids’ birthdays', 'Baby showers and gender reveals', 'Quinceañeras and sweet 16s', 'Graduations', 'Retirement parties', 'Anniversaries and family reunions'],
    blocks: [
      {
        heading: 'Everything your party page needs',
        bullets: [
          'An RSVP form with guest count — perfect for kids’ parties where parents reply for the family.',
          'Date, time, venue and a map, plus a countdown that builds excitement.',
          'A schedule for the day: arrival, cake, games, the big reveal.',
          'A registry or wish list link with your message about gifts (Plus).',
          'Song requests from guests for the DJ (Plus).',
        ],
      },
      {
        heading: 'Bilingual parties, sorted',
        paragraphs: [
          'Planning a quinceañera or family party with Spanish-speaking guests? Publish your page in Spanish or French — every button, heading, date and RSVP form switches language, and reminder emails go out in the same language.',
        ],
      },
    ],
    featureSlugs: ['guest-photo-qr-code', 'event-page-translations', 'event-reminder-emails', 'custom-sections', 'event-templates', 'livestream'],
    faqs: [
      { q: 'Can I make a baby shower website with a registry?', a: 'Yes. Pick one of the baby shower themes and, with Plus, add a registry section linking to Amazon, Babylist or any store, with your own message.' },
      { q: 'Can I make a quinceañera page in Spanish?', a: 'Yes. Set your page language to Español and everything MyGala writes on the page — headings, buttons, RSVP form and dates — appears in Spanish.' },
      { q: 'How do guests RSVP to a birthday party?', a: 'They open your link, fill in their name, whether they’re coming and how many guests, and you see the reply instantly in your dashboard.' },
      { q: 'Can guests share photos from the party?', a: 'Yes, with Plus. Print the guest photo QR code and guests upload photos from their phones to your page — no app needed.' },
      { q: 'Is it free to make a party page?', a: 'Yes. Create your page, pick any theme and collect RSVPs free. Upgrade to Plus only if you want premium features.' },
    ],
    cta: { title: 'Get the party started', text: 'Choose a celebration theme and send your invitation link today.' },
  },
  {
    slug: 'business-events',
    category: 'business',
    name: 'Business Events',
    learnMoreLabel: 'Learn more about business events',
    seo: {
      title: 'Business Event Websites: Conferences & Galas',
      description:
        'A professional event website for conferences, galas, fundraisers and company parties: RSVP, agenda, sponsors, livestream, reminders and your own domain.',
      keywords: ['business event website', 'conference website template', 'gala event page', 'fundraiser event website', 'corporate event RSVP', 'company party website', 'event sponsors page'],
    },
    eyebrow: 'Business event websites',
    h1: 'Professional event pages for conferences, galas and company events',
    lead:
      'Launch a polished event website in an afternoon — no agency, no developer. Collect registrations, publish the agenda, thank your sponsors, stream the keynote and remind attendees automatically.',
    occasions: ['Conferences and summits', 'Galas and fundraisers', 'Team offsites and retreats', 'Product launches', 'Holiday and company parties', 'Awards nights and networking events'],
    blocks: [
      {
        heading: 'Built for organizers',
        bullets: [
          'RSVP and registration with guest counts, exportable to CSV for check-in.',
          'A multi-day agenda in the event program.',
          'A sponsors section with up to 30 logos and descriptions (Plus).',
          'Custom sections for speakers, venue access, parking and FAQs (Plus).',
          'A livestream section for remote attendees (Plus).',
          'Your own domain, like acmesummit2027.com, with free SSL (Plus).',
        ],
      },
      {
        heading: 'Less admin, more attendance',
        paragraphs: [
          'Automatic reminder emails go out a month, a week or a day before — with your own note about badges, parking or dress code — to everyone who registered and asked for updates.',
          'Bilingual audience? Publish the page in English, French or Spanish.',
        ],
      },
    ],
    featureSlugs: ['custom-sections', 'livestream', 'event-reminder-emails', 'custom-domain', 'guest-photo-qr-code', 'event-page-translations'],
    faqs: [
      { q: 'Can I list sponsors on my event website?', a: 'Yes. With Plus, add up to 30 sponsors with a logo or photo and a short description each.' },
      { q: 'Can I export the attendee list?', a: 'Yes. Download your guest list as a CSV file from the RSVPs screen at any time.' },
      { q: 'Can attendees watch remotely?', a: 'Yes. Add a YouTube, Vimeo, Twitch or Facebook stream to play on your page, or link to Zoom, Teams or Google Meet.' },
      { q: 'Can we use our company’s domain?', a: 'Yes, with Plus. Point a domain you own at your event page; SSL is set up automatically.' },
      { q: 'Is there a monthly fee?', a: 'No. MyGala Plus is a one-time payment that unlocks every premium feature for 15 months.' },
    ],
    cta: { title: 'Launch your event site today', text: 'Pick a business theme and publish your agenda, sponsors and registration in one place.' },
  },
  {
    slug: 'general-events',
    category: 'community',
    name: 'General Events',
    learnMoreLabel: 'Learn more about general events',
    seo: {
      title: 'Community, Holiday & Car Show Event Websites',
      description:
        'A website for any event: block parties, festivals, car shows, holiday and Halloween parties, Día de los Muertos and fundraisers. RSVP, map and more, free.',
      keywords: ['community event website', 'holiday party website', 'Christmas party invitation website', 'Halloween party website', 'car show website', 'block party page', 'festival event page'],
    },
    eyebrow: 'General event websites',
    h1: 'An event page for every gathering',
    lead:
      'Block parties, festivals, car shows, holiday parties, Halloween nights, Día de los Muertos celebrations, club meetups and fundraisers — share one clear link with the date, the place, the plan and an easy RSVP.',
    occasions: ['Block parties and street festivals', 'Car shows and club events', 'Christmas and holiday parties', 'Halloween parties', 'Día de los Muertos and cultural celebrations', 'Fundraisers, fairs and markets'],
    blocks: [
      {
        heading: 'Everything people need to show up',
        bullets: [
          'Date, time, venue and a map with directions.',
          'An RSVP form with guest counts so you can plan food and space.',
          'A program for the day — or the whole weekend.',
          'Custom sections for vendors, routes, parking and rules (Plus).',
          'A sponsors section to thank local businesses (Plus).',
          'Guest photo sharing by QR code at the entrance (Plus).',
        ],
      },
      {
        heading: 'Easy to share in the neighbourhood',
        paragraphs: [
          'One short link works in group chats, flyers, social posts and community newsletters. Add your hashtag to the share section, and print a QR code so people can scan it from a poster.',
        ],
      },
    ],
    featureSlugs: ['guest-photo-qr-code', 'custom-sections', 'event-reminder-emails', 'event-templates', 'event-page-translations', 'livestream'],
    faqs: [
      { q: 'Can I make a page for a public community event?', a: 'Yes. Anyone with the link can view your page and RSVP — share it in group chats, on social media or on flyers.' },
      { q: 'Do people need an account to RSVP?', a: 'No. Guests just open your link and fill in the form. Only you, the host, need an account.' },
      { q: 'Can I add vendors or a car show route?', a: 'Yes. With Plus, custom sections let you add any information with text and images, like vendor lists, maps or rules.' },
      { q: 'Is there a holiday party theme?', a: 'Yes. Christmas Party, White Christmas, Halloween Party and Día de los Muertos are designed for seasonal celebrations.' },
      { q: 'How much does it cost?', a: 'Creating a page is free. MyGala Plus is a one-time payment if you want premium features like guest photos and sponsors.' },
    ],
    cta: { title: 'Bring your community together', text: 'Pick a theme and share your event in minutes — free.' },
  },
];

export function getEventType(slug: string): EventType | undefined {
  return EVENT_TYPES.find((e) => e.slug === slug);
}

export function eventTypeForCategory(category: EventCategory): EventType | undefined {
  return EVENT_TYPES.find((e) => e.category === category);
}
