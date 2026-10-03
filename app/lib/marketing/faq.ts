import type { Faq, SeoMeta } from './types';

// The /faq page: the questions hosts get stuck on most, grouped by topic.
// Facts (prices, limits) mirror app/lib/plans.ts and the product.

export const FAQ_SEO: SeoMeta = {
  title: 'Event Website FAQ: RSVPs, Pricing & Photos',
  description:
    'Answers to common questions about creating an event website with MyGala: pricing, RSVPs, privacy, photos, livestream, reminders, languages and domains.',
  keywords: ['event website FAQ', 'how to make an event website', 'event RSVP questions', 'online invitation RSVP', 'event page pricing', 'MyGala help'],
};

export type FaqGroup = { id: string; title: string; faqs: Faq[] };

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    faqs: [
      { q: 'What is MyGala?', a: 'MyGala lets you create a website for your event in minutes — weddings, birthdays, baby showers, quinceañeras, conferences, galas, holiday parties, community events and more. Guests get one link with every detail, an RSVP form and everything else they need.' },
      { q: 'What kinds of events can I create a page for?', a: 'Any event. Themes are grouped into weddings, celebrations, business events and general events, but every theme works for any occasion and has the same features.' },
      { q: 'Do I need design or technical skills?', a: 'No. Pick a theme, fill in your details, and edit text right on the page. If you can write an email, you can build your event page.' },
      { q: 'How long does it take to set up?', a: 'Most hosts publish a first version in about 10 minutes and keep adding details as their plans come together.' },
      { q: 'Can I create more than one event?', a: 'Yes. Your dashboard opens on Event pages, where you can create a new event at any time and switch between them. Each event has its own address, guest list and settings, and is free or Plus on its own.' },
      { q: 'What will my page address be?', a: 'Your page lives at mygala.ca/your-name, using the address you choose when you create it. With Plus you can also connect your own domain.' },
      { q: 'Can I create pages for online or virtual events?', a: 'Yes. Choose a virtual location and add your meeting link, or add a livestream section with Plus.' },
    ],
  },
  {
    id: 'pricing',
    title: 'Plans & pricing',
    faqs: [
      { q: 'Is MyGala free?', a: 'Yes. Create as many event pages as you need for free, each with every theme, RSVPs with guest counts, the countdown, event details, the event program and a gallery of up to 8 photos.' },
      { q: 'What does Plus add?', a: 'Plus adds guest photo uploads with printable QR codes, the livestream section, song requests, automatic reminder emails, custom sections, sponsors, a registry section, a custom domain, a gallery of up to 100 photos, no MyGala branding and priority support.' },
      { q: 'How much is Plus, and is it a subscription?', a: 'Plus is a one-time payment of $49.99 per event page, so you only pay for the events that need it. It is not a subscription: there are no recurring charges and no card kept on file.' },
      { q: 'What happens when my 15 months of Plus end?', a: 'Your page stays online. The Plus features switch off and the page continues on the free plan until you extend Plus with another one-time payment.' },
      { q: 'Can I start free and upgrade later?', a: 'Yes. When you create an event you choose Free or Plus, and you can upgrade a free event at any time from Event pages. Everything you set up stays, and Plus features become available immediately.' },
      { q: 'How do I pay?', a: 'Payments are processed securely by Stripe. MyGala never sees or stores your card number.' },
    ],
  },
  {
    id: 'guests-rsvps',
    title: 'Guests & RSVPs',
    faqs: [
      { q: 'Do guests need an account to RSVP or upload photos?', a: 'No. Guests just open your link. Only you, the host, need an account.' },
      { q: 'How do guests RSVP?', a: 'They fill in the RSVP form on your page with their name, email, whether they’re attending, how many guests are coming and an optional note. Replies appear instantly in your dashboard.' },
      { q: 'Can one guest RSVP for a group or family?', a: 'Yes. The form asks how many guests are coming, so one person can reply for their whole party.' },
      { q: 'What if a guest needs to change their RSVP?', a: 'They can submit the form again with the same email address — their previous answer is updated rather than counted twice.' },
      { q: 'Can I download my guest list?', a: 'Yes. Export all RSVPs to a CSV file from the RSVP screen (under Guests), ready for a spreadsheet, seating plan or check-in list.' },
      { q: 'How do I set an RSVP deadline?', a: 'Mention your deadline in your page description or a custom section. Automatic reminder emails (Plus) are a good way to nudge guests before it.' },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & visibility',
    faqs: [
      { q: 'Who can see my event page?', a: 'Anyone with the link. Event pages are public web pages, so share the link with the people you want to invite and avoid posting details you’d rather keep private.' },
      { q: 'Can I take my page offline?', a: 'Yes. Deactivate your page from the dashboard at any time; visitors see a “page unavailable” message until you turn it back on.' },
      { q: 'Who can see my guests’ RSVPs and emails?', a: 'Only you. Guest details appear in your dashboard and are never shown on your public page or shared with advertisers.' },
      { q: 'Will my guests get spam?', a: 'No. Guests only receive reminder emails if you turn reminders on and they chose to receive updates, and every email has a one-click unsubscribe link.' },
    ],
  },
  {
    id: 'photos-media',
    title: 'Photos, video & livestream',
    faqs: [
      { q: 'What’s the difference between the gallery and guest photos?', a: 'The gallery is for photos you upload as the host. Guest photos (Plus) is a separate wall where guests upload their own photos from their phones.' },
      { q: 'How do guests upload photos during the event?', a: 'With Plus, print the guest photo QR code for your tables. Guests scan it with their phone camera and upload — no app needed.' },
      { q: 'Can I use a video as my banner?', a: 'Yes. Upload a photo or a short video for the top banner of your page.' },
      { q: 'Can I stream my event?', a: 'Yes, with Plus. Add a YouTube, Vimeo, Twitch or Facebook video to play on your page, or link to Zoom, Google Meet or any other service.' },
    ],
  },
  {
    id: 'customizing',
    title: 'Customizing your page',
    faqs: [
      { q: 'Can I change my theme later?', a: 'Yes, as often as you like. Your text, photos, RSVPs and settings stay the same — only the design changes.' },
      { q: 'Can I hide sections I don’t need?', a: 'Yes. Most sections, like the RSVP form, event program, guest photos and share section, have a show/hide switch in the dashboard.' },
      { q: 'Can I change the section headings?', a: 'Yes. Click a heading in the page editor and type your own wording. Your headings are kept if you switch themes.' },
      { q: 'Which languages are available?', a: 'Event pages can be shown in English, Spanish or French. Everything MyGala writes on the page switches language; your own text stays as you wrote it.' },
      { q: 'Can I use my own domain?', a: 'Yes, with Plus. Connect a domain you own by adding two DNS records; SSL is set up automatically.' },
    ],
  },
  {
    id: 'after',
    title: 'After the event',
    faqs: [
      { q: 'What happens to my page after the event?', a: 'It stays online as a keepsake for you and your guests. You can deactivate it at any time.' },
      { q: 'Can I download the photos guests shared?', a: 'Yes. Download every guest photo at once from the Guest Photos screen in your dashboard.' },
      { q: 'How do I contact support?', a: 'Email info@mygala.ca or use the contact form. Plus members get priority support.' },
    ],
  },
];
