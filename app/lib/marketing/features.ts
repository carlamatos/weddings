import type { ContentBlock, Faq, SeoMeta, Step } from './types';

// The feature pages under /features/<slug>. Order here is the order of the
// Features menu and the /features index. Facts (limits, plans, services)
// mirror the product — update both together.

export type Feature = {
  slug: string;
  navLabel: string; // menu + cards
  plan: 'Free' | 'Plus';
  seo: SeoMeta;
  eyebrow: string;
  h1: string;
  lead: string; // hero paragraph
  summary: string; // one-liner for cards and the /features index
  highlights: { title: string; text: string }[];
  blocks: ContentBlock[];
  steps: Step[];
  faqs: Faq[];
  cta: { title: string; text: string };
  related: string[]; // other feature slugs
};

export const FEATURES: Feature[] = [
  {
    slug: 'guest-photo-qr-code',
    navLabel: 'Guest Photo QR Code',
    plan: 'Plus',
    seo: {
      title: 'Guest Photo Upload QR Code for Events',
      description:
        'Print a QR code for your tables so guests upload photos from their phones — no app, no account. Collect every photo on one page and download them all.',
      keywords: ['guest photo upload QR code', 'event photo sharing QR code', 'QR code table cards', 'collect guest photos', 'wedding photo QR code', 'party photo sharing', 'event photo wall'],
    },
    eyebrow: 'Guest photo QR code',
    h1: 'Collect every guest’s photos with one QR code on the table',
    lead:
      'Your guests take hundreds of photos at your event — and most of them never reach you. Print a MyGala QR code, place it on the tables, and guests upload their photos straight from their phone camera to your event page. No app to install, no account to create.',
    summary: 'Printable table cards that open your event’s photo upload page — no app, no sign-up for guests.',
    highlights: [
      { title: 'No app, no sign-up', text: 'Guests scan with their phone camera and upload in the browser. Nothing to install, nothing to remember.' },
      { title: 'Ready-to-print cards', text: 'Print four table cards per page or one large sign for the entrance or photo booth. Add your own title and message.' },
      { title: 'Every photo in one place', text: 'Photos appear on your event page’s Guest Photo Wall, and you can download all of them at once.' },
    ],
    blocks: [
      {
        heading: 'How the guest photo QR code works',
        paragraphs: [
          'Every MyGala Plus event page has a Guest Photo Wall: a section where guests can share photos and browse everyone else’s. The QR code is a shortcut to it. When a guest scans the code, their phone opens your event page and jumps straight to the upload button.',
          'Guests can pick several photos at once from their camera roll. MyGala resizes large photos on the guest’s phone before uploading, so it works even on slow venue Wi-Fi, and the photos show up on the wall right away.',
        ],
      },
      {
        heading: 'Made for any kind of event',
        bullets: [
          'Weddings and engagement parties — a card on every reception table.',
          'Birthdays, quinceañeras, sweet 16s and baby showers — one sign by the cake.',
          'Conferences, galas and company parties — on each table and at registration.',
          'Community fairs, car shows and holiday parties — at the entrance and the main stage.',
        ],
      },
      {
        heading: 'What you can customize',
        bullets: [
          'The title on the card — your event name is filled in for you.',
          'A short message, such as “Share your photos with us!”',
          'The layout: 4 table cards per page (cut along the dashed lines) or 1 large sign per page.',
          'Prefer to design your own? Download the QR code as a high-resolution PNG and add it to your own signs or programs.',
        ],
        paragraphs: [
          'If your page uses your own domain, the QR code uses it too, so the address printed under the code matches the one on your invitations.',
        ],
      },
      {
        heading: 'Keep control of the photos',
        bullets: [
          'Up to 500 guest photos per event page.',
          'Delete any photo from your dashboard at any time.',
          'Download every photo in one click to keep after the event.',
          'Hide the Guest Photo Wall whenever you like — for example, until the event starts.',
        ],
      },
    ],
    steps: [
      { title: 'Upgrade your page to Plus', text: 'The Guest Photo Wall and its QR code are part of MyGala Plus — a one-time payment, no subscription.' },
      { title: 'Open Guest Photos', text: 'In your dashboard, choose Guest Photos in the left menu and make sure the section is switched on.', dashboard: '/dashboard/guest-photos', linkLabel: 'Open Guest Photos' },
      { title: 'Customize your card', text: 'Under “QR code for your tables”, edit the title and message, then pick 4 table cards or 1 large sign.' },
      { title: 'Print or download', text: 'Click Print QR code, or Download PNG to use the code in your own design. Test it with your phone before printing a full batch.' },
      { title: 'Place the cards and collect', text: 'Put a card on every table. After the event, download all the photos from the same Guest Photos screen.' },
    ],
    faqs: [
      { q: 'Do guests need to download an app to upload photos?', a: 'No. The QR code opens your event page in the phone’s web browser. Guests tap the upload button and choose photos — no app and no account.' },
      { q: 'Does the QR code work with iPhone and Android?', a: 'Yes. Any recent iPhone or Android phone can scan a QR code with the built-in camera app.' },
      { q: 'How many photos can guests upload?', a: 'Each Plus event page holds up to 500 guest photos. Guests can select several photos at once.' },
      { q: 'Can I remove a photo a guest uploaded?', a: 'Yes. You can delete any photo from the Guest Photos screen in your dashboard, and it disappears from your page.' },
      { q: 'How do I get all the photos after the event?', a: 'Open Guest Photos in your dashboard and use the download button to save every photo at once.' },
      { q: 'Can I use the QR code on my own signs or programs?', a: 'Yes. Download it as a high-resolution PNG and place it in any design. It always points to your event page’s photo section.' },
      { q: 'What happens if I print the QR code and then change my page?', a: 'The code points to your event page address, so changing themes, text or photos doesn’t affect it. Only changing the page address or removing your custom domain would.' },
    ],
    cta: { title: 'Never miss a guest’s photo again', text: 'Create your free event page, upgrade to Plus when you’re ready, and print your table cards in minutes.' },
    related: ['livestream', 'custom-sections', 'custom-domain'],
  },

  {
    slug: 'livestream',
    navLabel: 'Livestream',
    plan: 'Plus',
    seo: {
      title: 'Livestream Your Event on Your Event Page',
      description:
        'Add a livestream to your event page: embed YouTube, Vimeo, Twitch or Facebook video, or link to Zoom and Google Meet so remote guests can watch live.',
      keywords: ['event livestream page', 'embed livestream on event website', 'wedding livestream link', 'virtual event guests', 'stream event online', 'YouTube live event page', 'Zoom event link'],
    },
    eyebrow: 'Livestream section',
    h1: 'Bring remote guests into the room with a live stream on your event page',
    lead:
      'Not everyone can travel to your event. Add a Live Stream section to your MyGala page and guests who can’t be there in person can watch along from anywhere — right on the same page they used to RSVP.',
    summary: 'Embed a YouTube, Vimeo, Twitch or Facebook stream, or link to Zoom and Google Meet.',
    highlights: [
      { title: 'Plays on your page', text: 'YouTube, Vimeo, Twitch and Facebook videos play inside your event page — guests don’t have to leave.' },
      { title: 'Works with any service', text: 'Zoom, Google Meet, Instagram Live or any other link shows as a clear “Watch live” button.' },
      { title: 'One place for everything', text: 'Guests find the schedule, the venue and the stream in one link they already have.' },
    ],
    blocks: [
      {
        heading: 'How the livestream section works',
        paragraphs: [
          'You stream with whatever service you already use. In your dashboard, paste the link to the stream — or the embed code the service gives you — and MyGala adds a Live Stream section to your event page, right after your date and location.',
          'When the link comes from a service that allows embedding, the video plays inside your page. For everything else, guests see a “Watch live” button that opens the stream in a new tab. You can also choose to always show the button instead of the player.',
        ],
      },
      {
        heading: 'Supported streaming services',
        bullets: [
          'YouTube — videos, YouTube Live links and channel live links play on your page.',
          'Vimeo — videos and Vimeo live events play on your page.',
          'Twitch — channels and past broadcasts play on your page.',
          'Facebook — public Facebook videos and live videos play on your page.',
          'Zoom, Google Meet, Microsoft Teams, Instagram Live and any other https link — shown as a “Watch live” button.',
        ],
      },
      {
        heading: 'Ideas for every occasion',
        bullets: [
          'Weddings: stream the ceremony for grandparents and friends overseas.',
          'Memorials and celebrations of life: let family join from afar.',
          'Conferences and town halls: share the keynote with remote attendees.',
          'Graduations, recitals, religious ceremonies and community events.',
        ],
      },
      {
        heading: 'Tell guests when to tune in',
        paragraphs: [
          'Add an optional message above the player — for example, “The ceremony streams live from 3:30 PM Pacific” — and change the button label if you like. The section’s heading is translated automatically into the language of your page, and you can rename it in the page editor.',
        ],
      },
    ],
    steps: [
      { title: 'Set up your stream', text: 'Schedule your stream on YouTube, Vimeo, Twitch, Facebook, Zoom or another service and copy its link or embed code.' },
      { title: 'Open Live Stream', text: 'In your dashboard, choose Live Stream in the left menu.', dashboard: '/dashboard/livestream', linkLabel: 'Open Live Stream' },
      { title: 'Paste the link', text: 'Paste the link or embed code, choose “Video player on the page” or “A Watch live button”, and add an optional message.' },
      { title: 'Save and check your page', text: 'Click Save live stream, then open your page with Preview page to see exactly what guests will see.' },
      { title: 'Share it', text: 'Guests already have your page link. Send a reminder email before the event so remote guests know when to join.' },
    ],
    faqs: [
      { q: 'Does MyGala stream the video?', a: 'No. You stream with a service like YouTube, Vimeo, Twitch, Facebook or Zoom, and MyGala shows that stream on your event page.' },
      { q: 'Can I embed a Zoom or Google Meet call on my page?', a: 'Zoom and Google Meet don’t allow their calls to be embedded in other websites, so MyGala shows a “Watch live” button that opens the call in a new tab.' },
      { q: 'Can I paste an iframe embed code?', a: 'Yes. Paste the embed code from YouTube, Vimeo or Facebook and MyGala keeps only the video address from it.' },
      { q: 'Should I paste the link before the stream starts?', a: 'Yes. Most services give you the link when you schedule the stream. Add it ahead of time so it’s on your page when guests arrive.' },
      { q: 'Can I hide the live stream section?', a: 'Yes. Switch the section off in your dashboard at any time — for example, after the event — without deleting the link.' },
      { q: 'Is the livestream section available on the free plan?', a: 'The Live Stream section is part of MyGala Plus, a one-time payment that unlocks every premium feature for 15 months.' },
    ],
    cta: { title: 'Let everyone be part of the day', text: 'Create your event page and add your live stream in under a minute.' },
    related: ['event-reminder-emails', 'event-page-translations', 'guest-photo-qr-code'],
  },

  {
    slug: 'event-page-translations',
    navLabel: 'Translations (EN · ES · FR)',
    plan: 'Free',
    seo: {
      title: 'Event Pages in English, Spanish & French',
      description:
        'Publish your event page in English, Spanish or French. Buttons, headings, the RSVP form, dates and reminder emails switch language. Free on every plan.',
      keywords: ['Spanish event website', 'French event website', 'bilingual wedding website', 'multilingual event page', 'event RSVP in Spanish', 'quinceañera website Spanish', 'site web événement français'],
    },
    eyebrow: 'Event page translations',
    h1: 'Your event page in English, Spanish or French',
    lead:
      'Your guests should feel at home on your event page. Choose English, Spanish (Español) or French (Français) and MyGala translates every part of the page it writes — headings, buttons, the RSVP form, dates and countdown — and sends reminder emails in the same language.',
    summary: 'Switch every heading, button, RSVP form, date and reminder email to Spanish or French.',
    highlights: [
      { title: 'Three languages', text: 'English, Spanish and French, with dates and times written the way each language writes them.' },
      { title: 'One click to switch', text: 'Change the language from your dashboard at any time. Your own content stays exactly as you wrote it.' },
      { title: 'Free on every plan', text: 'Translations are included on the free plan and on Plus.' },
    ],
    blocks: [
      {
        heading: 'What gets translated',
        bullets: [
          'Section headings: details, schedule, RSVP, gallery, photos, registry, sponsors and more.',
          'Buttons and links, such as “RSVP”, “Get directions” and “Watch live”.',
          'The RSVP form: labels, attending and declining options, guest count and confirmation messages.',
          'Dates, times and the countdown (days, hours, minutes, seconds).',
          'Reminder emails to guests (Plus), including the subject line and unsubscribe link.',
        ],
      },
      {
        heading: 'What stays as you wrote it',
        paragraphs: [
          'Your own words — the event name, description, schedule items, custom sections and messages — are shown exactly as you typed them. Write them in the language of your guests, or in two languages side by side for a bilingual crowd.',
          'Want different wording for a heading? Click it in the page editor and type your own. Custom headings are kept even if you switch themes.',
        ],
      },
      {
        heading: 'Perfect for bilingual families and international events',
        bullets: [
          'Quinceañeras, baptisms and family celebrations with Spanish-speaking guests.',
          'Weddings where the families speak different languages.',
          'Canadian events that need a French version.',
          'Conferences and community events with international attendees.',
        ],
      },
    ],
    steps: [
      { title: 'Open your page editor', text: 'Log in and open Edit Page for your event.', dashboard: '/dashboard/edit', linkLabel: 'Open the page editor' },
      { title: 'Pick a language', text: 'Use the language menu in the top bar of the dashboard and choose English, Español or Français.' },
      { title: 'Write your own text in that language', text: 'Update your description, schedule and any custom sections so everything matches.' },
      { title: 'Preview and share', text: 'Click Preview page to check the result, then share your link as usual.' },
    ],
    faqs: [
      { q: 'Which languages are available?', a: 'English, Spanish (Español) and French (Français).' },
      { q: 'Is the translation automatic for my own text?', a: 'No. MyGala translates everything it writes on the page. Your own text — like your description and schedule — is shown exactly as you typed it, so you stay in control of the wording.' },
      { q: 'Can guests switch the language themselves?', a: 'Each event page is shown in one language that you choose. For mixed audiences, many hosts write their own text in both languages.' },
      { q: 'Are reminder emails translated too?', a: 'Yes. Reminder emails are sent in the language of your event page.' },
      { q: 'Does changing the language affect my RSVPs?', a: 'No. Your guest list, RSVPs, photos and settings stay the same. Only the page’s built-in wording changes.' },
      { q: 'Is it free?', a: 'Yes. Translations are included on every plan, including the free plan.' },
    ],
    cta: { title: 'Welcome every guest in their language', text: 'Create your free event page and choose English, Spanish or French.' },
    related: ['event-reminder-emails', 'event-templates', 'custom-sections'],
  },

  {
    slug: 'event-reminder-emails',
    navLabel: 'Email Reminders',
    plan: 'Plus',
    seo: {
      title: 'Automatic Event Reminder Emails for Guests',
      description:
        'Send automatic reminder emails to guests a month, a week or a day before your event, with your own note. No spreadsheets, no copy-pasting addresses.',
      keywords: ['event reminder emails', 'automatic guest reminders', 'RSVP reminder email', 'wedding reminder email', 'party reminder email', 'event email reminders before event'],
    },
    eyebrow: 'Email reminders',
    h1: 'Automatic reminder emails, so no guest forgets your event',
    lead:
      'Choose when reminders go out — from a month before to the day before — write a personal note once, and MyGala emails every guest who asked for updates. Each email includes the date, time, venue and a link back to your event page.',
    summary: 'Email guests automatically before the event — a month, a week or a day ahead.',
    highlights: [
      { title: 'Set it once', text: 'Pick your timings and write your note. MyGala sends each reminder on the right day, automatically.' },
      { title: 'Only to guests who opted in', text: 'Guests choose to receive updates when they RSVP. Everyone can unsubscribe with one click.' },
      { title: 'In your page’s language', text: 'Reminders are sent in English, Spanish or French to match your event page.' },
    ],
    blocks: [
      {
        heading: 'How reminder emails work',
        paragraphs: [
          'When guests RSVP on your event page, they can tick “receive event updates” — it’s ticked by default. Those guests are your reminder list. You choose one or more timings in your dashboard, and MyGala sends each reminder on the right day, counted back from your event date.',
          'Guests who declined don’t get reminders, and each guest receives each reminder only once, even if they RSVP’d more than once with the same email.',
        ],
      },
      {
        heading: 'Choose when reminders are sent',
        bullets: ['1 month in advance', '3 weeks in advance', '2 weeks in advance', '1 week in advance', '3 days in advance', '1 day in advance'],
        paragraphs: ['Pick as many as you like. Popular choices are one week and one day before.'],
      },
      {
        heading: 'What guests receive',
        bullets: [
          'A subject line like “Reminder: Maple Street Block Party is next week”, in your page’s language.',
          'Your personal note — directions, parking, what to bring, dress code or anything else.',
          'The event date, time and venue.',
          'A button back to your event page, and a one-click unsubscribe link.',
        ],
        paragraphs: ['Your dashboard shows a preview of the email, how many guests will receive it, and which reminders have already been sent.'],
      },
    ],
    steps: [
      { title: 'Collect RSVPs with emails', text: 'Guests who RSVP on your page with an email address and leave “receive event updates” ticked join your reminder list.' },
      { title: 'Open Reminders', text: 'In your dashboard, choose Reminders in the left menu.', dashboard: '/dashboard/reminders', linkLabel: 'Open Reminders' },
      { title: 'Pick your timings', text: 'Tick when reminders should go out — from 1 month to 1 day before the event.' },
      { title: 'Write your note', text: 'Add a personal message (up to 1,000 characters) and check the email preview.' },
      { title: 'Save — and relax', text: 'MyGala sends each reminder automatically on the right day. Make sure your event date is set on your page.' },
    ],
    faqs: [
      { q: 'Who receives the reminder emails?', a: 'Guests who RSVP’d on your page with an email address, kept “receive event updates” ticked, and didn’t decline.' },
      { q: 'Can I send a reminder right now?', a: 'Reminders are scheduled: you choose how long before the event each one goes out, and MyGala sends it on that day.' },
      { q: 'What if I change my event date?', a: 'Reminders follow the date on your page. Update the date and the remaining reminders move with it.' },
      { q: 'Can guests stop receiving reminders?', a: 'Yes. Every reminder includes a one-click unsubscribe link.' },
      { q: 'Which email address are reminders sent from?', a: 'Reminders are sent by MyGala from no-reply@mygala.ca, with your event name and note in the email.' },
      { q: 'Are reminders included in the free plan?', a: 'Event reminders are part of MyGala Plus, a one-time payment — no monthly subscription.' },
    ],
    cta: { title: 'Fewer no-shows, zero chasing', text: 'Create your event page, collect RSVPs, and let reminders go out on their own.' },
    related: ['event-page-translations', 'livestream', 'custom-sections'],
  },

  {
    slug: 'event-templates',
    navLabel: 'Templates for Every Occasion',
    plan: 'Free',
    seo: {
      title: 'Event Website Templates for Every Occasion',
      description:
        'Choose from 21 event website templates for weddings, birthdays, baby showers, quinceañeras, conferences, galas and holiday parties. Switch anytime, free.',
      keywords: ['event website templates', 'party website template', 'wedding website template', 'birthday invitation website', 'baby shower website', 'conference website template', 'holiday party website'],
    },
    eyebrow: 'Templates for every occasion',
    h1: 'An event website template for every occasion',
    lead:
      'Weddings, birthdays, baby showers, quinceañeras, conferences, galas, holiday parties, car shows and neighbourhood festivals — MyGala has a designed template for each, with the same complete set of tools behind every one.',
    summary: '21 designed themes for weddings, celebrations, business and general events.',
    highlights: [
      { title: 'Designed for the occasion', text: 'Each theme has its own colours, fonts and animations made for a specific kind of event.' },
      { title: 'Same tools in every theme', text: 'RSVP, countdown, schedule, map, gallery and every Plus feature work in every template.' },
      { title: 'Switch anytime', text: 'Change themes in one click. Your text, photos, RSVPs and settings stay put.' },
    ],
    blocks: [
      {
        heading: 'Templates by type of event',
        bullets: [
          'Weddings: The Day, Love, Terracotta Harvest, Midnight Botanical, Quiet Coastal and Vilma.',
          'Celebrations: Alegría, Fun Party, Balloons, and Girl, Boy and Neutral Baby Shower.',
          'Business events: Summit, Nexus and Dinner Gala.',
          'General events: Community Day, Antique Cars, Christmas Party, White Christmas, Día de los Muertos and Halloween Party.',
        ],
      },
      {
        heading: 'Everything every template includes',
        bullets: [
          'A full-width banner — upload your own photo or video, or keep the theme’s artwork.',
          'Event details with date, time, venue, address and a map with directions.',
          'A live countdown to your event.',
          'An RSVP form with guest count, plus a guest list you can export to CSV.',
          'An event program for one day or several.',
          'A photo gallery and a share section for social media.',
          'Plus features such as guest photos, live stream, registry, custom sections and sponsors.',
        ],
      },
      {
        heading: 'Edit right on the page',
        paragraphs: [
          'The page editor shows your page exactly as guests will see it. Click a heading, a date or the description to edit it in place, and switch sections on or off from the dashboard menu.',
        ],
      },
    ],
    steps: [
      { title: 'Browse the templates', text: 'Open any theme from the homepage to see a full live preview with sample content.' },
      { title: 'Create your page', text: 'Sign up free, choose your type of event and a theme, and fill in the basics.', dashboard: '/dashboard/setup', linkLabel: 'Start your page' },
      { title: 'Make it yours', text: 'Upload a banner photo, write your description and add your schedule in the page editor.' },
      { title: 'Change your mind anytime', text: 'Use the theme menu at the top of the dashboard to try a different look — nothing is lost.', dashboard: '/dashboard/edit', linkLabel: 'Open the page editor' },
    ],
    faqs: [
      { q: 'Are all templates free?', a: 'Yes. Every theme is available on the free plan. Plus unlocks extra features, not extra themes.' },
      { q: 'Can I use a wedding theme for a different kind of event?', a: 'Yes. Categories are suggestions — any theme works for any event, and every theme has the same features.' },
      { q: 'Will I lose my content if I switch themes?', a: 'No. Your text, photos, guest list and settings stay the same. Only the design changes.' },
      { q: 'Can I use my own photo or video in the banner?', a: 'Yes. Upload a photo or a short video for the top banner, or keep the theme’s default artwork.' },
      { q: 'Do the templates work on phones?', a: 'Yes. Every theme is designed to look good on phones, tablets and computers — most guests will open your link on their phone.' },
    ],
    cta: { title: 'Find the look that fits your event', text: 'Pick a template, add your details, and share your page today — free.' },
    related: ['custom-sections', 'event-page-translations', 'custom-domain'],
  },

  {
    slug: 'custom-sections',
    navLabel: 'Custom Sections',
    plan: 'Plus',
    seo: {
      title: 'Custom Sections & Sponsors for Event Pages',
      description:
        'Add your own sections to your event page — travel, dress code, parking, menus, speakers — plus sponsors and a gift registry, with text and images.',
      keywords: ['custom event page sections', 'event website sponsors section', 'event FAQ section', 'wedding travel information page', 'event dress code', 'gift registry link', 'event sponsors page'],
    },
    eyebrow: 'Custom sections',
    h1: 'Add the information your guests actually ask about',
    lead:
      'Every event has its own questions: where to park, which hotel to book, what to wear, who’s speaking, who’s sponsoring. Custom sections let you add your own titled sections of text and images to your event page — plus dedicated Sponsors and Registry sections.',
    summary: 'Add up to three sections of your own, plus Sponsors and Registry.',
    highlights: [
      { title: 'Your own sections', text: 'Up to three custom sections, each with a title and any mix of text and images.' },
      { title: 'Sponsors', text: 'Thank up to 30 sponsors with their logo and a short description.' },
      { title: 'Registry', text: 'Link to your gift registry or wish list, with your own message about gifts.' },
    ],
    blocks: [
      {
        heading: 'How custom sections work',
        paragraphs: [
          'Each custom section has an optional title and a stack of up to 20 blocks — paragraphs of text or images — in the order you choose. Custom sections appear on your page right after the date and location, where guests look for practical details.',
          'Sections that are empty don’t show, and you can hide all custom sections with one switch while you work on them.',
        ],
      },
      {
        heading: 'Ideas for custom sections',
        bullets: [
          'Travel & accommodation: hotels, room blocks, airport and shuttle details.',
          'Dress code and what to bring.',
          'Parking, accessibility and venue entrances.',
          'Menu, dietary options and kids’ activities.',
          'Speakers, performers or the band line-up.',
          'Vendor booths, exhibitors or the car show route.',
          'Our story, the wedding party or the honoree’s highlights.',
        ],
      },
      {
        heading: 'Sponsors section',
        paragraphs: [
          'Perfect for galas, fundraisers, conferences, school events and community fairs. Add each sponsor’s logo or photo with a short description of up to 280 characters, choose a background colour for transparent logos, and drag them into order. Up to 30 sponsors per page.',
        ],
      },
      {
        heading: 'Registry section',
        paragraphs: [
          'Add a link to your registry or wish list — Amazon, Babylist, a store or your own page — with your own button label and a message, such as “Your presence is the best gift” or details about a fund. Great for weddings, baby showers and birthdays.',
        ],
      },
    ],
    steps: [
      { title: 'Open Custom Sections', text: 'In your dashboard, choose Custom Sections in the left menu.', dashboard: '/dashboard/custom-sections', linkLabel: 'Open Custom Sections' },
      { title: 'Add a title and blocks', text: 'Give the section a title, then add text and image blocks and put them in order.' },
      { title: 'Add sponsors or a registry', text: 'Use the Sponsors and Registry screens in the same menu for those sections.', dashboard: '/dashboard/sponsors', linkLabel: 'Open Sponsors' },
      { title: 'Preview and publish', text: 'Save, then click Preview page to see your new sections on your event page.' },
    ],
    faqs: [
      { q: 'How many custom sections can I add?', a: 'Up to three custom sections, each with up to 20 text or image blocks, plus the Sponsors and Registry sections.' },
      { q: 'Where do custom sections appear on my page?', a: 'Right after your date and location. Sponsors appear after the gallery, and the registry has its own section.' },
      { q: 'Can I add images to a custom section?', a: 'Yes. Upload images and place them between paragraphs in any order.' },
      { q: 'Can I hide a section temporarily?', a: 'Yes. Each section type has a show/hide switch, so you can prepare content before revealing it.' },
      { q: 'Are custom sections included in the free plan?', a: 'Custom sections, sponsors and the registry are part of MyGala Plus, a one-time payment.' },
    ],
    cta: { title: 'Answer guests’ questions before they ask', text: 'Create your event page and add the sections your event needs.' },
    related: ['event-templates', 'guest-photo-qr-code', 'custom-domain'],
  },

  {
    slug: 'custom-domain',
    navLabel: 'Custom Domain',
    plan: 'Plus',
    seo: {
      title: 'Custom Domain for Your Event Website',
      description:
        'Connect your own domain, like smithreunion.com, to your event page. Step-by-step DNS setup, free SSL, and your MyGala link keeps working.',
      keywords: ['custom domain event website', 'wedding website custom domain', 'event page own domain', 'connect domain to event website', 'event website DNS setup'],
    },
    eyebrow: 'Custom domain',
    h1: 'Put your event on your own domain',
    lead:
      'Make your event easy to remember and type: connect a domain like smithreunion.com or acmesummit2027.com to your MyGala page. Guests see your domain in the address bar, the page is secured with a free SSL certificate, and your MyGala link keeps working too.',
    summary: 'Connect a domain like yourevent.com to your page, with free SSL.',
    highlights: [
      { title: 'Your name, your link', text: 'A short, memorable address for invitations, signs and QR codes.' },
      { title: 'Free SSL', text: 'Your domain is secured with HTTPS automatically once it’s connected.' },
      { title: 'Any registrar', text: 'Buy your domain anywhere — Namecheap, GoDaddy, Cloudflare, Google-hosted or your local registrar.' },
    ],
    blocks: [
      {
        heading: 'How custom domains work',
        paragraphs: [
          'You buy a domain from any domain registrar, then point it at MyGala by adding two DNS records in your registrar’s settings. MyGala checks the records, issues an SSL certificate, and from then on anyone who visits your domain sees your event page.',
          'Your share links, social previews and table QR codes switch to your domain automatically once it’s active.',
        ],
      },
      {
        heading: 'The DNS records you’ll add',
        bullets: [
          'An A record for the root domain (@) pointing to the IP address shown in your dashboard.',
          'A CNAME record for www pointing to the address shown in your dashboard.',
          'Adding both is recommended, so the domain works with and without “www”.',
        ],
        paragraphs: ['DNS changes usually take minutes, but can take up to 48 hours. Your dashboard shows “Pending DNS” until the domain is verified, then “Active”.'],
      },
      {
        heading: 'Choosing a good event domain',
        bullets: [
          'Keep it short and easy to spell out loud: names, year, or event name.',
          'Avoid hyphens and numbers that sound like words (“4” vs “for”).',
          'A .com is easiest for guests to remember; country domains like .ca work too.',
        ],
      },
    ],
    steps: [
      { title: 'Buy a domain', text: 'Register a domain at any registrar. Many cost about $10–20 per year.' },
      { title: 'Open Domain', text: 'In your dashboard, choose Domain in the left menu and enter your domain.', dashboard: '/dashboard/domain', linkLabel: 'Open Domain settings' },
      { title: 'Add the DNS records', text: 'At your registrar, add the A and CNAME records shown in your dashboard.' },
      { title: 'Wait for “Active”', text: 'MyGala verifies the records and turns on SSL. Most domains are ready within an hour.' },
      { title: 'Share your new link', text: 'Use your domain on invitations, signs and QR codes. Your MyGala link keeps working too.' },
    ],
    faqs: [
      { q: 'Do I have to buy the domain from MyGala?', a: 'No. Buy it from any registrar you like — you keep full ownership of your domain.' },
      { q: 'How long does it take for my domain to work?', a: 'Usually minutes to an hour after you add the DNS records, but DNS changes can take up to 48 hours.' },
      { q: 'Is HTTPS included?', a: 'Yes. MyGala issues a free SSL certificate for your domain once the DNS records are verified.' },
      { q: 'Will my MyGala link stop working?', a: 'No. Your mygala.ca link keeps working, and share links switch to your domain once it’s active.' },
      { q: 'Can I use a subdomain like party.mydomain.com?', a: 'The dashboard is set up for a root domain and its www version. Contact us if you need a different setup.' },
      { q: 'What happens to my domain if my Plus term ends?', a: 'Your page stays live at its mygala.ca address. Extend Plus to bring your custom domain back.' },
    ],
    cta: { title: 'Give your event its own address', text: 'Create your page, upgrade to Plus, and connect your domain in minutes.' },
    related: ['guest-photo-qr-code', 'event-templates', 'custom-sections'],
  },
];

export function getFeature(slug: string): Feature | undefined {
  return FEATURES.find((f) => f.slug === slug);
}
