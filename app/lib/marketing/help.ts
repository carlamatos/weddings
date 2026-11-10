import type { SeoMeta } from './types';

// The help centre (/help and /help/<slug>): short how-to guides that each
// answer one question, grouped by the stage of planning. Facts (menus,
// buttons, limits, plans) mirror the dashboard and the feature pages in
// features.ts — update them together.
//
// Steps and tips may use the article markup: [link text](/path) and **bold**.

export type HelpCategory = { id: string; title: string; text: string };

export const HELP_CATEGORIES: HelpCategory[] = [
  { id: 'start', title: 'Getting started', text: 'Create your page, make it yours and publish it.' },
  { id: 'guests', title: 'Guests and invitations', text: 'Your guest list, invitations, sharing and RSVPs.' },
  { id: 'day', title: 'On the day', text: 'Guest photos, the photo slideshow, Find Your Table, the livestream and song requests.' },
  { id: 'planning', title: 'Planning', text: 'Your budget, your timeline and plans saved from the free tools.' },
  { id: 'extras', title: 'More sections', text: 'Registry, sponsors, potluck, gift exchange and your own sections.' },
  { id: 'account', title: 'Plans and your account', text: 'Plus, more than one event, and after the event.' },
];

export type HelpGuide = {
  slug: string;
  category: string;
  title: string; // the question, as hosts ask it
  summary: string; // one line for the list and the meta description
  plan?: 'Plus';
  intro?: string;
  steps: string[];
  tips?: string[];
  videoFrom?: string; // a feature slug whose how-to video plays on the guide
  dashboard?: { label: string; path: string }; // where it's done
  feature?: string; // the feature page with more detail
  related: string[]; // other guide slugs
};

export const HELP_GUIDES: HelpGuide[] = [
  // Getting started
  {
    slug: 'create-your-event-page',
    category: 'start',
    title: 'How do I create my event page?',
    summary: 'Sign up, give your event a name and your page is ready in a minute.',
    intro: 'All you need to start is a name for your event. The date, the place and everything else can come later.',
    steps: [
      'Sign up free with your email, Google, Apple or Facebook.',
      'Choose your type of event and give it a name. Pick the address you’d like, for example mygala.ca/emma-and-liam.',
      'Choose **Free** or **Plus**. You can start free and upgrade later; nothing you set up is lost.',
      'Your page opens in the dashboard with a theme picked for you. The checklist at the top of the menu shows what to add next.',
    ],
    tips: [
      'Every theme works for any kind of event, and you can change it any time.',
      'You can create as many event pages as you need. Each has its own address, guests and settings.',
    ],
    dashboard: { label: 'Sign up free', path: '/register' },
    related: ['add-your-event-details', 'change-your-theme', 'publish-your-page'],
  },
  {
    slug: 'add-your-event-details',
    category: 'start',
    title: 'How do I add the date, place and my own photos?',
    summary: 'Edit everything right on your page: the date, venue, welcome message, banner and gallery.',
    intro: 'You edit your page as guests will see it. Click any part of it in the editor to change it.',
    steps: [
      'Open **Edit Event Page** in the left menu.',
      'Add the **date, time and place**. For an online event, choose a virtual location and paste your meeting link.',
      'Click the top banner to upload your own photo, or keep the theme’s artwork.',
      'Write a **welcome message**: a few lines about your event and what guests should know.',
      'Add photos to your **gallery**: up to 8 on the free plan, up to 100 with Plus.',
      'Click **Preview page** to see exactly what guests will see.',
    ],
    tips: [
      'Click any section heading to write your own wording. Your headings stay if you change themes.',
      'Most sections have a show or hide switch, so you only show what you need.',
    ],
    dashboard: { label: 'Edit your page', path: '/dashboard/edit' },
    related: ['plan-your-event-program', 'change-your-theme', 'show-your-page-in-another-language'],
  },
  {
    slug: 'change-your-theme',
    category: 'start',
    title: 'How do I change my theme?',
    summary: 'Try a different design from the theme menu. Your text, photos and RSVPs stay as they are.',
    steps: [
      'Open your page in the dashboard.',
      'Use the **theme menu** at the top of the dashboard and pick a new theme.',
      'Your page changes straight away. Your details, photos, RSVPs and settings stay the same.',
      'Don’t like it? Pick another one, or go back. Nothing is lost.',
    ],
    tips: ['Not sure which to choose? [See every theme](/themes) as a full live page first.'],
    videoFrom: 'event-templates',
    feature: 'event-templates',
    related: ['add-your-event-details', 'design-your-invitation'],
  },
  {
    slug: 'publish-your-page',
    category: 'start',
    title: 'How do I publish my page?',
    summary: 'Confirm your email, then press Publish my page. Until then only you can see it.',
    intro: 'Pages made before you confirm your email address start as a **draft**: only you can see them, and guests who open the link see “not published yet”.',
    steps: [
      'Open the email we sent when you signed up and click the link to **confirm your email address**. Can’t find it? Check your spam folder, or ask for a new link from your dashboard.',
      'Sign in and open your page in the dashboard.',
      'Press **Publish my page** at the top of the dashboard.',
      'That’s it: guests can now open your page and RSVP. You can keep making changes after publishing.',
    ],
    tips: ['If you signed up with Google, Apple or Facebook, your email is already confirmed and your page is live from the start.'],
    dashboard: { label: 'Go to your dashboard', path: '/dashboard' },
    related: ['share-your-page', 'send-invitations', 'create-your-event-page'],
  },
  {
    slug: 'plan-your-event-program',
    category: 'start',
    title: 'How do I add a schedule to my page?',
    summary: 'List the moments of your event in the Event Program, with times and places.',
    steps: [
      'Choose **Event Program** in the left menu.',
      'Add each moment: a title (for example “Ceremony” or “Rehearsal dinner”), the start time, an optional end time and the place.',
      'Put them in order. Events over several days are grouped by day.',
      'Click **Preview page** to see your schedule on your page.',
    ],
    tips: ['Keep it short: guests mostly want to know when to arrive, when to eat and when it ends.'],
    dashboard: { label: 'Open the Event Program', path: '/dashboard' },
    related: ['add-your-event-details', 'add-custom-sections'],
  },
  {
    slug: 'show-your-page-in-another-language',
    category: 'start',
    title: 'Can my page be in Spanish or French?',
    summary: 'Show your page in English, Spanish or French; everything MyGala writes switches language.',
    steps: [
      'Open your page in the dashboard.',
      'Use the **language menu** in the top bar (on a phone, tap the menu button and find Language) and choose English, Español or Français.',
      'Buttons, forms, dates and headings on your page switch language. Rewrite your own text, like your welcome message and schedule, in that language too.',
      'Click **Preview page** to check it, then share your link as usual.',
    ],
    videoFrom: 'event-page-translations',
    feature: 'event-page-translations',
    related: ['add-your-event-details', 'design-your-invitation'],
  },

  // Guests and invitations
  {
    slug: 'add-your-guests',
    category: 'guests',
    title: 'How do I add my guests?',
    summary: 'Import guests from a spreadsheet or your phone’s contacts, or add them one by one.',
    steps: [
      'Choose **Guests & RSVPs** in the left menu.',
      'Add guests one by one with their name, email and phone, or import a spreadsheet (CSV) with many at once.',
      'On your phone, tap **Choose from my phone’s contacts** to pick people straight from your address book. On a computer, export your contacts as a .vcf file and upload it.',
      'Everyone on your list can now get your invitation, and their replies show up right beside their names.',
    ],
    tips: [
      'You don’t have to add guests first: share your page’s link, for example in a group chat, and everyone who RSVPs is added to your list automatically. Add guests yourself when you want to email or text each one their own invitation, see who hasn’t replied and send reminders.',
      'Count people, not invitations: a family of four is four guests.',
      'Not sure how many will come? Try the free [guest count planner](/guest-count-planner).',
    ],
    dashboard: { label: 'Open Guests & RSVPs', path: '/dashboard/guest-list' },
    related: ['send-invitations', 'manage-rsvps', 'seat-your-guests'],
  },
  {
    slug: 'design-your-invitation',
    category: 'guests',
    title: 'How do I design my invitation?',
    summary: 'Make an invitation that matches your page: wording, fonts, colours and background.',
    steps: [
      'Choose **Invite** in the left menu and scroll to **Send personal invitations**.',
      'Change the wording, fonts, colours and background. The details come from your page, so they always match.',
      'Save your design.',
      'Print it, save it as a PDF, or send it to your guests by email, text or WhatsApp. Printed invitations get a QR code that opens your page.',
    ],
    tips: ['Want to try it before signing up? Use the free [invitation maker](/design-your-invitation).'],
    dashboard: { label: 'Open Invite', path: '/dashboard/invitations' },
    feature: 'invitations',
    related: ['send-invitations', 'add-your-guests', 'change-your-theme'],
  },
  {
    slug: 'send-invitations',
    category: 'guests',
    title: 'How do I send invitations by email, text or WhatsApp?',
    summary: 'Email your guests from MyGala, or text them from your own phone, each with an RSVP button.',
    steps: [
      'Add your guests in **Guests & RSVPs** first.',
      'Open **Invite** and click **Send me a test** to see the email in your own inbox.',
      'Tick the guests you want and click **Email**. Each guest is greeted by name and gets an RSVP button.',
      'Or tap **Text** or **WhatsApp** next to a guest’s phone number. The message opens on your phone, so it comes from your number.',
      'Replies appear in **Guests & RSVPs** as guests answer.',
    ],
    tips: [
      'You need a confirmed email address to send invitations.',
      'Pick an RSVP deadline before you send. The free [RSVP deadline calculator](/rsvp-deadline-calculator) works it out for you.',
    ],
    dashboard: { label: 'Open Invite', path: '/dashboard/invitations' },
    feature: 'invitations',
    related: ['design-your-invitation', 'manage-rsvps', 'send-reminder-emails'],
  },
  {
    slug: 'share-your-page',
    category: 'guests',
    title: 'How do I share my page link?',
    summary: 'Share your link on social media, messaging apps or email, or print a QR code.',
    steps: [
      'Choose **Invite** in the left menu.',
      'Under **Share your link**, copy your link to paste in a group chat, text or email, or tap **WhatsApp** or **Text**. Open **More ways to share** for Facebook, Messenger, Telegram, X and more. The preview shows your top banner photo.',
      'At the bottom, under **Share section on your page**, add a hashtag for your event if you’d like guests to use one, or switch the Share section off.',
      'For printed signs and cards, use the QR code on your invitation.',
    ],
    tips: ['Is your page still a draft? [Publish it](/help/publish-your-page) first, or guests will see “not published yet”.'],
    dashboard: { label: 'Open Invite', path: '/dashboard/invitations' },
    related: ['send-invitations', 'publish-your-page', 'protect-your-page-with-a-password'],
  },
  {
    slug: 'how-guests-rsvp',
    category: 'guests',
    title: 'What do guests fill in when they RSVP?',
    summary: 'Name, email, yes or no, how many are coming, and optionally a phone number, meal choices, allergies and a note.',
    intro: 'Guests RSVP on your event page, with no account or app. The form is in your page’s language and matches your theme.',
    steps: [
      'Guests open your page and scroll to the RSVP form, or follow a link straight to it: in the top bar, click **Share** and choose the **RSVP form** tab.',
      'They type their **full name** and **email**, and a **phone number** if they like (it’s optional).',
      'They choose **joyfully accepts** or **regretfully declines**.',
      'If they’re coming, they pick the **number of guests**: just them, or up to 4 people in their party.',
      'If you ask for meal choices, each person in the party picks a **meal** and can note any **allergies or dietary needs**. Guests can also type the names of the people coming with them. See [How do guests choose their meal?](/help/ask-for-meal-choices)',
      'They can leave an optional **note for the hosts**, and tick whether they’d like **event updates by email**, such as your reminder emails.',
      'They click **Send RSVP** and see a thank-you message. Their reply appears straight away in **Guests & RSVPs**, and you get an email about it if notifications are on.',
    ],
    tips: [
      'A guest who changes their mind sends the form again with the same email address: their answer is updated, not counted twice.',
      'Turn on **Only guests on my guest list can RSVP** (under **RSVP form settings**) and the form only accepts emails on your list, so a forwarded link can’t add extra guests.',
      'Bigger party than 4? Add them in **Guests & RSVPs** and set the number yourself: a guest can bring up to 50 people there.',
      'Don’t want RSVPs on your page? Switch off **RSVP form visible on your page** at the top of **Guests & RSVPs**.',
    ],
    dashboard: { label: 'Open Guests & RSVPs', path: '/dashboard/guest-list' },
    feature: 'rsvp-meal-choices',
    related: ['manage-rsvps', 'ask-for-meal-choices', 'add-your-guests'],
  },
  {
    slug: 'manage-rsvps',
    category: 'guests',
    title: 'How do I see who’s coming?',
    summary: 'Every reply lands in Guests & RSVPs, with the head count, notes and a CSV download.',
    steps: [
      'Choose **Guests & RSVPs** in the left menu.',
      'See how many are attending, declining and still to reply, the total number of guests, and each reply with its party size, meal choices and note.',
      'Change a guest’s status yourself if they tell you in person.',
      'Under **RSVP form settings**, turn on email notifications to hear about each new reply. Click **Export CSV** to download everything for your caterer or seating plan.',
      'To hide the RSVP form from your page, switch off **RSVP form visible on your page** at the top.',
    ],
    tips: [
      'Turn on **Only guests on my guest list can RSVP** so a forwarded link can’t add extra guests.',
      'Guests who change their mind just send the form again with the same email; their answer is updated, not counted twice.',
    ],
    dashboard: { label: 'Open Guests & RSVPs', path: '/dashboard/guest-list' },
    related: ['how-guests-rsvp', 'ask-for-meal-choices', 'send-reminder-emails', 'seat-your-guests'],
  },
  {
    slug: 'ask-for-meal-choices',
    category: 'guests',
    title: 'How do guests choose their meal?',
    summary: 'Ask each guest to pick a meal and note allergies on the RSVP, then send the counts to your caterer.',
    intro: 'Meal choices are off until you switch them on. Guests don’t have to pick one: it’s optional on the form.',
    steps: [
      'Choose **Guests & RSVPs** in the left menu and, under **RSVP form settings**, tick **Ask guests to choose a meal**.',
      'Edit the meals guests choose from (chicken, fish, vegetarian and a kids’ meal to start), then click **Save meals**.',
      'Your RSVP form now asks each person coming for a meal and any allergies or dietary needs.',
      'Under **Meals for your caterer**, see the count per meal and everyone’s allergies. Click **Copy for the caterer** or **Download CSV**.',
    ],
    tips: [
      'A party of four gets four rows on the form, so each person picks their own meal.',
      'Seat your guests in **Find Your Table** and each table shows its meals, so the caterer knows what goes where.',
      'Write the meals in your page’s language. Renaming a meal doesn’t change what guests already chose.',
    ],
    dashboard: { label: 'Open Guests & RSVPs', path: '/dashboard/guest-list' },
    feature: 'rsvp-meal-choices',
    related: ['how-guests-rsvp', 'manage-rsvps', 'seat-your-guests'],
  },
  {
    slug: 'send-reminder-emails',
    category: 'guests',
    title: 'How do I send reminder emails to guests?',
    summary: 'Pick when reminders go out and MyGala sends them automatically.',
    plan: 'Plus',
    steps: [
      'Guests who RSVP with an email address and leave **receive event updates** ticked join your reminder list.',
      'Choose **Reminders** in the left menu.',
      'Tick when reminders should go out, from 1 month to 1 day before the event.',
      'Add a personal note (up to 1,000 characters) and check the preview.',
      'Save. Each reminder goes out on its own on the right day, as long as your event date is set.',
    ],
    dashboard: { label: 'Open Reminders', path: '/dashboard/reminders' },
    feature: 'event-reminder-emails',
    related: ['manage-rsvps', 'send-invitations'],
  },
  {
    slug: 'protect-your-page-with-a-password',
    category: 'guests',
    title: 'Can I make my page private?',
    summary: 'Add a password so only guests who have it can open your page.',
    plan: 'Plus',
    steps: [
      'Choose **Password** in the left menu.',
      'Pick a password that’s easy to share and type (at least 4 characters) and switch protection on.',
      'Add the password to your invitations, next to your link.',
    ],
    tips: ['Without a password, anyone with your link can see your page, so avoid posting details you’d rather keep private.'],
    dashboard: { label: 'Open Password', path: '/dashboard/password' },
    feature: 'password-protection',
    related: ['share-your-page', 'send-invitations'],
  },

  // On the day
  {
    slug: 'collect-guest-photos',
    category: 'day',
    title: 'How do guests share their photos?',
    summary: 'Print a QR code for your tables; guests scan it and upload photos from their phones.',
    steps: [
      'Choose **Guest Photos** in the left menu and switch the section on. Free pages hold up to 50 photos; Plus pages up to 500.',
      'Under **QR code for your tables**, edit the title and message, then pick 4 table cards or 1 large sign.',
      'Click **Print QR code**, or **Download PNG** to use the code in your own design. Test it with your phone first.',
      'Put the cards on the tables. Guests scan, upload, and every photo appears on your page’s photo wall.',
      'After the event, download all the photos at once from the same screen.',
    ],
    videoFrom: 'guest-photo-qr-code',
    dashboard: { label: 'Open Guest Photos', path: '/dashboard/guest-photos' },
    feature: 'guest-photo-qr-code',
    related: ['show-a-photo-slideshow', 'seat-your-guests', 'after-your-event'],
  },
  {
    slug: 'show-a-photo-slideshow',
    category: 'day',
    title: 'How do I show guests’ photos on a screen?',
    summary: 'Play a live slideshow of your guests’ photos on a TV or projector, with new photos appearing as they’re shared.',
    plan: 'Plus',
    intro: 'The photo slideshow plays every photo your guests share, full screen, and adds new ones as they arrive. A QR code in the corner invites everyone else to add theirs.',
    steps: [
      'Make sure **Guest Photos** is switched on, so guests can share their photos.',
      'Choose **Photo Slideshow** in the left menu and click **Open the slideshow**, or copy the link.',
      'On the computer connected to the TV or projector (or the smart TV’s browser), open the link and press **F** to fill the screen.',
      'Leave it running. New photos show up next, marked **Just shared**, and the slideshow loops through all of them.',
    ],
    tips: [
      'Move the mouse to pause, go back, or choose how long each photo stays on screen: 5, 8 or 12 seconds.',
      'Delete a photo in **Guest Photos** and it leaves the slideshow within a few seconds.',
      'You can try the slideshow before upgrading. Only you can see it until the event is on Plus.',
    ],
    dashboard: { label: 'Open Photo Slideshow', path: '/dashboard/slideshow' },
    feature: 'live-photo-slideshow',
    related: ['collect-guest-photos', 'seat-your-guests'],
  },
  {
    slug: 'seat-your-guests',
    category: 'day',
    title: 'How do guests find their table?',
    summary: 'Seat your guests, print a QR sign, and guests look up their table on their phone.',
    plan: 'Plus',
    steps: [
      'Add your guests in **Guests & RSVPs**: guests look up their table by the name on your list.',
      'Open **Find Your Table**, create your tables and drag your guests onto them, or use the list to type tables or paste your chart from a spreadsheet.',
      'Turn on **Let guests look up their table**.',
      'Print the QR sign (one large sign, or four smaller cards per page) or download the code as a PNG.',
      'Scan it with your phone to test, then put it at the entrance, the welcome table or the bar.',
    ],
    tips: ['You can seat everyone before upgrading. Only the guest lookup needs Plus.'],
    videoFrom: 'find-your-table',
    dashboard: { label: 'Open Find Your Table', path: '/dashboard/seating' },
    feature: 'find-your-table',
    related: ['add-your-guests', 'collect-guest-photos'],
  },
  {
    slug: 'livestream-your-event',
    category: 'day',
    title: 'How do I livestream my event?',
    summary: 'Show a YouTube, Vimeo, Twitch or Facebook stream on your page, or link to Zoom or Meet.',
    plan: 'Plus',
    steps: [
      'Schedule your stream on YouTube, Vimeo, Twitch, Facebook, Zoom or another service, and copy its link or embed code.',
      'Choose **Live Stream** in the left menu.',
      'Paste the link, choose **Video player on the page** or **A Watch live button**, and add an optional message.',
      'Click **Save live stream**, then **Preview page** to check it.',
    ],
    tips: ['Send a reminder email before the event so remote guests know when to join.'],
    dashboard: { label: 'Open Live Stream', path: '/dashboard/livestream' },
    feature: 'livestream',
    related: ['send-reminder-emails', 'collect-guest-photos'],
  },
  {
    slug: 'take-song-requests',
    category: 'day',
    title: 'Can guests request songs?',
    summary: 'Guests suggest songs on your page and you share the list with your DJ or band.',
    plan: 'Plus',
    steps: [
      'Choose **Song Requests** in the left menu and switch the section on.',
      'Guests add the songs they’d love to hear right on your page.',
      'See every request in your dashboard and pass the list to your DJ or band.',
    ],
    dashboard: { label: 'Open Song Requests', path: '/dashboard/song-requests' },
    related: ['plan-your-event-program', 'collect-guest-photos'],
  },

  // Planning
  {
    slug: 'track-your-budget',
    category: 'planning',
    title: 'How do I track my budget?',
    summary: 'Keep your budget in your dashboard: estimates, what you’ve spent, and payments as they come due.',
    intro: 'Plan your budget with the free wedding budget calculator and click **Save to my MyGala**, or start one in your dashboard.',
    steps: [
      'Choose **Budget** in the left menu. If you haven’t saved one yet, type your total and click **Start my budget**.',
      'Change any estimate to match your quotes, and enter what you’ve spent as you pay.',
      'For a deposit or a payment still to make, enter the amount in **Next payment** and its due date.',
      'When it’s paid, click **Mark as paid**. Everything saves as you type.',
    ],
    tips: [
      'We email you a week before each payment is due, and on the day.',
      'Saving a new plan from the calculator changes the estimates but keeps what you’ve spent, your payments and notes.',
      'Add your own categories with **Add a category**, and use the note under each one for the vendor’s name or contact.',
    ],
    dashboard: { label: 'Open Budget', path: '/dashboard/budget' },
    feature: 'wedding-budget-tracker',
    related: ['plan-your-rsvp-timeline', 'add-your-guests'],
  },
  {
    slug: 'plan-your-rsvp-timeline',
    category: 'planning',
    title: 'How do I get reminders for my RSVP dates?',
    summary: 'Save your RSVP dates from the free calculator and get an email on each one: invitations, deadline, final count.',
    steps: [
      'Open the free **RSVP deadline calculator**, enter your event date and click **Save to my MyGala**.',
      'Choose your event and click **Save**. Your dates appear under **Timeline** in the left menu.',
      'Leave **Email me on each date** ticked to get a short reminder the morning of each step.',
      'Tick off each step when it’s done, and its reminder won’t be sent.',
    ],
    tips: [
      'If you change your event’s date, the Timeline offers to move every date with it.',
      'Each step links to the screen where it’s done: invitations, reminders, RSVPs or seating.',
    ],
    dashboard: { label: 'Open Timeline', path: '/dashboard/timeline' },
    feature: 'rsvp-timeline-reminders',
    related: ['send-invitations', 'manage-rsvps', 'track-your-budget'],
  },

  // More sections
  {
    slug: 'add-a-registry',
    category: 'extras',
    title: 'How do I add a gift registry?',
    summary: 'Link to your registry on Amazon, Babylist, a store or your own page.',
    plan: 'Plus',
    steps: [
      'Choose **Registry** in the left menu.',
      'Paste your **registry link**: Amazon, Babylist, a store or your own page.',
      'Add an optional message (for example, that your presence is the best gift) and a button label.',
      'Save, then check it with **Preview page**.',
    ],
    dashboard: { label: 'Open Registry', path: '/dashboard/registry' },
    related: ['add-custom-sections', 'add-sponsors'],
  },
  {
    slug: 'add-custom-sections',
    category: 'extras',
    title: 'How do I add my own sections?',
    summary: 'Add sections for anything: travel, hotels, dress code, your story or FAQs.',
    plan: 'Plus',
    steps: [
      'Choose **Custom Sections** in the left menu.',
      'Give the section a title, then add text and image blocks and put them in order.',
      'Save, then click **Preview page** to see it on your page.',
    ],
    tips: ['Great for a dress code, hotels and travel, parking, or answers to guests’ common questions.'],
    dashboard: { label: 'Open Custom Sections', path: '/dashboard/custom-sections' },
    feature: 'custom-sections',
    related: ['add-a-registry', 'plan-your-event-program'],
  },
  {
    slug: 'add-sponsors',
    category: 'extras',
    title: 'How do I thank sponsors on my page?',
    summary: 'Show your sponsors with their name, logo and a short thank-you.',
    plan: 'Plus',
    steps: [
      'Choose **Sponsors** in the left menu.',
      'Click **Add a sponsor** and add their name, logo and a short description.',
      'Put them in order with the arrows. The section appears on your page once there’s at least one sponsor.',
    ],
    dashboard: { label: 'Open Sponsors', path: '/dashboard/sponsors' },
    related: ['add-custom-sections', 'add-a-registry'],
  },
  {
    slug: 'organize-a-potluck',
    category: 'extras',
    title: 'How do I organize a potluck?',
    summary: 'Guests sign up for what they’re bringing when they RSVP.',
    plan: 'Plus',
    steps: [
      'Choose **Potluck** in the left menu and switch the section on.',
      'Turn on **Show everyone’s entries on your page** if guests should see what others are bringing.',
      'Share your page. Guests sign up when they RSVP, and entries appear in your dashboard.',
      'Download every entry as a CSV for your shopping list.',
    ],
    dashboard: { label: 'Open Potluck', path: '/dashboard/potluck' },
    feature: 'potluck',
    related: ['manage-rsvps', 'run-a-gift-exchange'],
  },
  {
    slug: 'run-a-gift-exchange',
    category: 'extras',
    title: 'How do I run a Secret Santa gift exchange?',
    summary: 'Guests join on your page, you draw names, and everyone gets a private link.',
    plan: 'Plus',
    steps: [
      'Choose **Gift Exchange** in the left menu, switch the section on and add the budget, date and a note.',
      'Share your page so guests can sign up, or add people from your guest list. Add couples to **Keep apart**.',
      'Once at least three people have joined, click **Draw names**.',
      'Click **Email everyone**, or send each person their private link by text or WhatsApp.',
    ],
    videoFrom: 'gift-exchange',
    dashboard: { label: 'Open Gift Exchange', path: '/dashboard/gift-exchange' },
    feature: 'gift-exchange',
    related: ['organize-a-potluck', 'share-your-page'],
  },
  {
    slug: 'use-your-own-domain',
    category: 'extras',
    title: 'Can I use my own domain?',
    summary: 'Connect a domain you own, like emmaandliam.com, with two DNS records.',
    plan: 'Plus',
    steps: [
      'Register a domain at any registrar. Many cost about $10–20 per year.',
      'Choose **Domain** in the left menu and enter your domain.',
      'At your registrar, add the A and CNAME records shown in your dashboard.',
      'Wait for **Active**: MyGala checks the records and turns on SSL. Most domains are ready within an hour.',
    ],
    tips: ['Your MyGala link keeps working too.'],
    dashboard: { label: 'Open Domain', path: '/dashboard/domain' },
    feature: 'custom-domain',
    related: ['share-your-page'],
  },

  // Plans and your account
  {
    slug: 'upgrade-to-plus',
    category: 'account',
    title: 'What does Plus add, and how do I upgrade?',
    summary: 'A one-time payment per event page that unlocks reminders, Find Your Table and more.',
    intro: 'Plus is a one-time payment of $49.99 CAD (plus applicable tax) per event page. It’s not a subscription: nothing renews and no card is kept on file. It lasts 15 months.',
    steps: [
      'Set up any Plus feature on your free page first. They’re marked with a small sparkle in the menu, and only showing them to guests needs Plus.',
      'Click **Upgrade to Plus** from your dashboard or from Event pages.',
      'Pay securely with Stripe. Plus features switch on straight away, and anything you were turning on goes live.',
    ],
    tips: [
      'Plus adds automatic reminders, Find Your Table, the livestream, song requests, custom sections, sponsors, the registry, password protection, your own domain, up to 500 guest photos and a 100-photo gallery.',
      'When the 15 months end, your page stays online on the free plan unless you extend Plus.',
      'Compare the plans on the [pricing page](/pricing).',
    ],
    dashboard: { label: 'Go to your dashboard', path: '/dashboard' },
    related: ['manage-more-than-one-event', 'after-your-event'],
  },
  {
    slug: 'manage-more-than-one-event',
    category: 'account',
    title: 'Can I have more than one event?',
    summary: 'Create as many event pages as you like and switch between them.',
    steps: [
      'Your dashboard opens on **Event pages**, with every event you’ve made.',
      'Create a new event at any time. Each one has its own address, guest list and settings.',
      'Choose an event to open its menu. Each event is free or Plus on its own.',
    ],
    dashboard: { label: 'See your event pages', path: '/dashboard' },
    related: ['create-your-event-page', 'upgrade-to-plus'],
  },
  {
    slug: 'after-your-event',
    category: 'account',
    title: 'What happens to my page after the event?',
    summary: 'Your page stays online as a keepsake. Download the photos, or take it offline.',
    steps: [
      'Your page stays online as a keepsake for you and your guests.',
      'Download every guest photo at once from **Guest Photos**.',
      'Download your RSVPs as a CSV from **Guests & RSVPs**, handy for thank-you notes.',
      'Want it offline? Choose **Deactivate my page** from your profile menu; guests see “page unavailable” until you turn it back on. You can also delete a page for good.',
    ],
    dashboard: { label: 'Go to your dashboard', path: '/dashboard' },
    related: ['collect-guest-photos', 'manage-rsvps'],
  },
];

export const HELP_SEO: SeoMeta = {
  title: 'Help Centre: How to Use MyGala',
  description: 'Step-by-step help for your MyGala event page: create and publish your page, add guests, send invitations, collect RSVPs, guest photos and more.',
  keywords: ['mygala help', 'how to use mygala', 'event page help', 'wedding website help', 'how to send invitations', 'how to collect rsvps online'],
};

export function getHelpGuide(slug: string): HelpGuide | undefined {
  return HELP_GUIDES.find((g) => g.slug === slug);
}
