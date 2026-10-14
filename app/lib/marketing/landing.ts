import type { SeoMeta } from './types';

// Ad landing pages (/events/<slug>/start): one focused sign-up page per
// event type that has a Google Ads campaign. The event type pages
// (/events/<slug>) stay the place for search; these pages only exist to turn
// a click on an ad into a free account.

export type LandingFeature = {
  icon: LandingIcon;
  title: string;
  text: string;
  plus?: boolean; // a Plus feature (one-time payment); otherwise free
};

export type LandingIcon =
  | 'rsvp' | 'guests' | 'countdown' | 'map' | 'program' | 'palette' | 'globe' | 'link' | 'photo'
  | 'mail' | 'camera' | 'video' | 'music' | 'bell' | 'gift' | 'sections' | 'lock' | 'domain' | 'potluck' | 'heart';

export type LandingPage = {
  slug: string; // the event type's slug: weddings, celebrations
  seo: SeoMeta;
  cta: string; // the main button: "Create my free wedding page"
  hero: { badge: string; tagline: string; headline: string; sub: string };
  wall: string[]; // theme slugs behind the banner (the ones with a cover photo)
  ticker: string[]; // the moving strip under the banner
  templates: { title: string; sub: string };
  demo: string; // theme for "See a live demo"
  // The animated "how it works" phone.
  steps: {
    theme: string; // the theme picked in step 2 and shown in step 4
    pickFrom: string[]; // the four thumbnails in step 2
    name: string; // typed in step 3
    date: string;
    place: string;
    link: string; // mygala.ca/<link>
    rsvps: { who: string; reply: string }[];
  };
  features: { title: string; sub: string; items: LandingFeature[] };
  occasions: { title: string; items: string[] };
  final: { title: string; text: string };
};

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: 'weddings',
    seo: {
      title: 'Free Wedding Website — RSVPs, Photos & More',
      description:
        'Create your wedding website free in minutes: beautiful templates, RSVPs with guest counts, countdown, schedule, map, guest photos, livestream and registry. No credit card.',
    },
    cta: 'Create my free wedding page',
    hero: {
      badge: 'Free wedding websites — sign up in seconds',
      tagline: 'A page as beautiful as your day.',
      headline: 'Your wedding website, ready in minutes.',
      sub: 'Pick a stunning template, add your names and date, and share one link with every guest. RSVPs, your schedule, the venue, photos and more, all in one place.',
    },
    wall: ['the-day', 'love', 'quiet-coastal', 'midnight-botanical', 'vilma', 'the-day', 'love', 'midnight-botanical', 'vilma', 'quiet-coastal', 'love', 'the-day'],
    ticker: ['RSVPs with guest counts', 'Countdown to the big day', 'Ceremony & reception map', 'Weekend schedule', 'Guest photo QR codes', 'Livestream for faraway family', 'Gift registry', 'Invitations by text, email & WhatsApp', 'English · Español · Français', 'Your own domain'],
    templates: {
      title: 'Wedding templates your guests will remember',
      sub: 'Every template comes with every feature. Tap one to open a full live demo, and switch any time without losing a word.',
    },
    demo: 'the-day',
    steps: {
      theme: 'the-day',
      pickFrom: ['the-day', 'love', 'midnight-botanical', 'quiet-coastal'],
      name: 'Charlotte & James',
      date: 'September 18, 2027',
      place: 'Niagara-on-the-Lake, ON',
      link: 'charlotte-and-james',
      rsvps: [
        { who: 'Emma & Noah', reply: 'Attending · 2 guests' },
        { who: 'Aunt Maria', reply: 'Attending · 1 guest' },
        { who: 'The Patels', reply: 'Attending · 4 guests' },
      ],
    },
    features: {
      title: 'Everything your wedding website needs',
      sub: 'Start with the free plan and add Plus only if you want the extras. It’s a single payment per wedding, never a subscription.',
      items: [
        { icon: 'rsvp', title: 'RSVPs with guest counts', text: 'Guests reply in seconds, for themselves and their plus-ones. See every answer instantly and export to a spreadsheet.' },
        { icon: 'guests', title: 'Guest list', text: 'Import guests from a spreadsheet or your phone’s contacts and see who has replied at a glance.' },
        { icon: 'countdown', title: 'Countdown', text: 'A live countdown to the big day, right at the top of your page.' },
        { icon: 'map', title: 'Ceremony & reception details', text: 'Date, time and venue with a map and directions, so nobody gets lost.' },
        { icon: 'program', title: 'Wedding-weekend schedule', text: 'From the welcome drinks to the farewell brunch, every moment in one clear program.' },
        { icon: 'photo', title: 'Your story & photo gallery', text: 'Tell how you met and show off your engagement photos.' },
        { icon: 'palette', title: 'Every template included', text: 'Switch templates any time. Your words and photos stay put.' },
        { icon: 'globe', title: 'English, Spanish & French', text: 'Publish your page in your family’s language, with every button and date translated.' },
        { icon: 'link', title: 'One easy link', text: 'mygala.ca/yournames. Put it in texts, invitations and your Instagram bio.' },
        { icon: 'mail', title: 'Invitations by email, text & WhatsApp', text: 'Send beautiful invitations to your whole guest list in a few taps.', plus: true },
        { icon: 'camera', title: 'Guest photos by QR code', text: 'Put a QR code on every table. Guests upload their photos from their phones, no app needed.', plus: true },
        { icon: 'video', title: 'Livestream the ceremony', text: 'Family who can’t travel can watch live on your page.', plus: true },
        { icon: 'gift', title: 'Gift registry', text: 'Link to any registry or store, with your own note about gifts.', plus: true },
        { icon: 'music', title: 'Song requests', text: 'Guests suggest the songs that will fill the dance floor.', plus: true },
        { icon: 'bell', title: 'Automatic reminders', text: 'Reminder emails go out before the big day, so nobody misses the shuttle.', plus: true },
        { icon: 'sections', title: 'Travel, hotels & dress code', text: 'Add your own sections for anything your guests need to know.', plus: true },
        { icon: 'lock', title: 'Password-protected page', text: 'Keep your page just for the people you invite.', plus: true },
        { icon: 'domain', title: 'Your own domain', text: 'Use an address like charlotteandjames.com, with SSL set up for you.', plus: true },
      ],
    },
    occasions: {
      title: 'Made for every part of your love story',
      items: ['Weddings', 'Elopements', 'Engagement parties', 'Rehearsal dinners', 'Destination weddings', 'Vow renewals', 'Anniversaries'],
    },
    final: {
      title: 'Your love story deserves a beautiful home.',
      text: 'Create your wedding website free today. It takes just a few minutes, and you can upgrade only if you need to.',
    },
  },
  {
    slug: 'celebrations',
    seo: {
      title: 'Free Party Page — Birthdays, Baby Showers & Quinceañeras',
      description:
        'Create a free party page in minutes for a birthday, baby shower, quinceañera or sweet 16: fun templates, RSVPs with guest counts, countdown, map, registry and guest photos.',
    },
    cta: 'Create my free party page',
    hero: {
      badge: 'Free party pages — sign up in seconds',
      tagline: 'Every milestone deserves a little magic.',
      headline: 'Your party page, ready in minutes.',
      sub: 'Birthdays, baby showers, quinceañeras and sweet 16s. Pick a fun template, add the details and share one link. RSVPs, the countdown, the map and the photos, all in one place.',
    },
    wall: ['alegria', 'baby-shower-girl', 'fun-party', 'baby-shower-boy', 'baby-shower-neutral', 'alegria', 'fun-party', 'baby-shower-girl', 'baby-shower-neutral', 'baby-shower-boy', 'alegria', 'fun-party'],
    ticker: ['RSVPs with guest counts', 'Party countdown', 'Venue map & directions', 'Party schedule', 'Baby shower registry', 'Guest photo QR codes', 'Song requests for the DJ', 'Potluck sign-up', 'English · Español · Français', 'Invitations by text, email & WhatsApp'],
    templates: {
      title: 'Party templates that set the mood',
      sub: 'Every template comes with every feature. Tap one to open a full live demo, and switch any time without losing a word.',
    },
    demo: 'balloons',
    steps: {
      theme: 'alegria',
      pickFrom: ['alegria', 'baby-shower-girl', 'fun-party', 'baby-shower-boy'],
      name: 'Sofía’s Quinceañera',
      date: 'June 12, 2027',
      place: 'San Antonio, TX',
      link: 'sofias-quince',
      rsvps: [
        { who: 'The Garcías', reply: 'Attending · 4 guests' },
        { who: 'Tía Lucía', reply: 'Attending · 2 guests' },
        { who: 'Mateo R.', reply: 'Attending · 1 guest' },
      ],
    },
    features: {
      title: 'Everything your party page needs',
      sub: 'Start with the free plan and add Plus only if you want the extras. It’s a single payment per event, never a subscription.',
      items: [
        { icon: 'rsvp', title: 'RSVPs with guest counts', text: 'Parents reply for the whole family in seconds. See every answer instantly and export to a spreadsheet.' },
        { icon: 'guests', title: 'Guest list', text: 'Import guests from a spreadsheet or your phone’s contacts and see who has replied at a glance.' },
        { icon: 'countdown', title: 'Countdown', text: 'A live countdown that builds the excitement.' },
        { icon: 'map', title: 'Date, venue & map', text: 'Everything guests need to find the party, with directions.' },
        { icon: 'program', title: 'Party schedule', text: 'Arrival, cake, games, the big reveal: the whole plan for the day.' },
        { icon: 'photo', title: 'Photo gallery', text: 'Share your favourite photos right on the page.' },
        { icon: 'palette', title: 'Every template included', text: 'Switch templates any time. Your words and photos stay put.' },
        { icon: 'globe', title: 'English, Spanish & French', text: 'Perfect for bilingual families. Every button, heading and date is translated.' },
        { icon: 'link', title: 'One easy link', text: 'mygala.ca/yourparty. Easy to share in group chats and on social media.' },
        { icon: 'mail', title: 'Invitations by email, text & WhatsApp', text: 'Send invitations to your whole guest list in a few taps.', plus: true },
        { icon: 'gift', title: 'Registry & wish list', text: 'Link to Amazon, Babylist or any store, with your own note about gifts.', plus: true },
        { icon: 'camera', title: 'Guest photos by QR code', text: 'Guests scan, snap and upload from their phones, no app needed.', plus: true },
        { icon: 'music', title: 'Song requests', text: 'Guests suggest songs for the DJ before the party.', plus: true },
        { icon: 'potluck', title: 'Potluck sign-up', text: 'Guests pick what they’ll bring, so you don’t end up with five cakes.', plus: true },
        { icon: 'bell', title: 'Automatic reminders', text: 'Reminder emails go out before the party, so nobody forgets.', plus: true },
        { icon: 'video', title: 'Livestream', text: 'Faraway family can watch the big moments live.', plus: true },
        { icon: 'sections', title: 'Your own sections', text: 'Add dress code, parking, the theme or anything else guests should know.', plus: true },
        { icon: 'lock', title: 'Password-protected page', text: 'Keep the party just for the people you invite.', plus: true },
      ],
    },
    occasions: {
      title: 'A page for every milestone',
      items: ['Birthdays', 'Kids’ parties', 'Baby showers', 'Gender reveals', 'Quinceañeras', 'Sweet 16s', 'Graduations', 'Retirements', 'Anniversaries'],
    },
    final: {
      title: 'Let’s get the party started.',
      text: 'Create your party page free today. It takes just a few minutes, and you can upgrade only if you need to.',
    },
  },
];

export function getLandingPage(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug);
}
