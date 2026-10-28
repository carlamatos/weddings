import type { StartOccasion } from '@/app/lib/start-intent';
import type { Faq, SeoMeta, Step } from './types';
import { CELEBRATION_THEMES, THEME_CARDS } from './theme-cards';

// The "design your invitation" pages (/design-your-invitation, its
// Christmas, wedding and party versions): the try-it tool at the top
// (app/ui/marketing/try-invitation.tsx), then how it works, what you can
// change, the themes and questions — the words search engines read.

export type TryInvitationPage = {
  path: string;
  // What the new event opens on after sign-up: its invitation designer, or
  // (weddings, from /wedding-website) the page editor.
  intent: 'invitation' | 'website';
  saveLabel: string;
  // The fields' labels ("Event name" and "Event date" without them).
  nameLabel?: string;
  dateLabel?: string;
  // Sign up on the page itself, a live website preview with their names and
  // date, the website before the invitation (app/ui/marketing/try-invitation.tsx).
  inlineSignup?: boolean;
  liveWebsite?: boolean;
  websiteFirst?: boolean;
  occasion?: StartOccasion;
  defaultTheme: string;
  seo: SeoMeta;
  breadcrumb: string;
  // The tool's heading, intro and the event name field's example.
  eyebrow: string;
  h1: string;
  intro: string;
  example: string;
  app: { name: string; description: string }; // WebApplication structured data
  steps: Step[];
  blocks: { heading: string; paragraphs?: string[]; bullets?: string[] }[];
  themes: { heading: string; text: string; slugs?: string[] }; // no slugs: every theme
  faqs: Faq[];
  related: { heading: string; links: { label: string; href: string; text: string }[] };
};

const CHANGE_LATER = [
  'The wording: the line above the name, your message and the closing.',
  'The fonts for the event name and the text, from 14 choices.',
  'The text and accent colours, a background colour, or your own photo with a colour wash.',
  'A QR code that opens your event page, for printed invitations.',
];

const SHARED_FAQS: Faq[] = [
  { q: 'Do I need an account to try it?', a: 'No. Pick a design and type your event’s name and date to see your invitation and its website straight away. You create a free account only when you want to save it.' },
  { q: 'Is it really free?', a: 'Yes. Designing your invitation, your event page, your guest list, RSVPs and sending invitations by email, text or WhatsApp are free. Plus is an optional one-time upgrade per event for extras like email reminders and a custom domain.' },
  { q: 'Can I change the design after I sign up?', a: 'Yes, all of it: the wording, fonts, colours and background photo of your invitation, and the photos and sections of your website. You can also switch to another theme at any time.' },
  { q: 'How do I send the invitation to my guests?', a: 'Email it to the guests you tick on your guest list, with an RSVP button that opens your page, or tap Text or WhatsApp next to a guest’s phone number to send it from your own phone. You can also print it or save it as a PDF at 5×7 inches.' },
];

export const TRY_INVITATION_PAGES: Record<'default' | 'christmas' | 'wedding' | 'celebration', TryInvitationPage> = {
  default: {
    path: '/design-your-invitation',
    intent: 'invitation',
    saveLabel: 'Save my invitation',
    defaultTheme: 'the-day',
    seo: {
      title: 'Free Online Invitation Maker: Design Your Invitation',
      description: 'Design your invitation online for free. Pick a design, add your names and date, and see it instantly with a matching event website. No sign-up needed to try.',
      keywords: ['invitation maker', 'free online invitation maker', 'online invitations', 'digital invitations', 'wedding invitation maker', 'party invitation maker', 'design your own invitation'],
    },
    breadcrumb: 'Invitation maker',
    eyebrow: 'Free invitation maker',
    h1: 'Design your invitation online',
    intro: 'Pick a design, add the name and the date, and see your invitation and its matching website. No account needed to try it.',
    example: 'Sofia & James',
    app: {
      name: 'MyGala Invitation Maker',
      description: 'Free online invitation maker: choose a design, add your event’s name and date, and preview your invitation and matching event website. Send it by email, text or WhatsApp, or print it.',
    },
    steps: [
      { title: 'Pick a design', text: 'Choose from more than 20 themes for weddings, birthdays, baby showers, parties, business and community events. Each one is an invitation and a matching event website.' },
      { title: 'Add your names and date', text: 'Type your event’s name and date and watch your invitation update as you type.' },
      { title: 'Save it with a free account', text: 'Create your account with your email or Google. Your design, name and date come with you, so you only choose your page address.' },
      { title: 'Finish it and send it', text: 'Add the time and place, adjust the wording and colours, then email, text or WhatsApp it to your guests. They RSVP in one tap on your page.' },
    ],
    blocks: [
      {
        heading: 'An invitation and a website that match',
        paragraphs: [
          'Every MyGala invitation opens to its own event website in the same design, with your details, RSVPs, a countdown, photos and everything guests need to know. Guests tap the invitation, read about your event and reply in one place, and you see every answer in your guest list.',
        ],
      },
      {
        heading: 'Make it yours after you sign up',
        paragraphs: ['The invitation designer shows a live 5×7 preview as you work. You can change:'],
        bullets: CHANGE_LATER,
      },
      {
        heading: 'Send it any way you like',
        paragraphs: [
          'Email your invitation to the guests you choose, each greeted by name, with an RSVP button. Or send it as a text or WhatsApp message from your own phone, so it comes from your number. Prefer paper? Print it or save it as a PDF, with a QR code that opens your page.',
        ],
      },
    ],
    themes: { heading: 'Invitation designs to start from', text: 'See any design as a full event website before you choose it.' },
    faqs: [
      ...SHARED_FAQS,
      { q: 'What kinds of events can I make an invitation for?', a: 'Weddings, engagement parties, birthdays, baby and bridal showers, quinceañeras, anniversaries, holiday parties, conferences, galas, fundraisers and community events. Every theme works for any event; the gallery groups them by occasion.' },
    ],
    related: {
      heading: 'More from MyGala',
      links: [
        { label: 'Online invitations', href: '/features/invitations', text: 'How designing and sending invitations works.' },
        { label: 'Christmas party invitations', href: '/design-your-christmas-invitation', text: 'Try a Christmas invitation design.' },
        { label: 'Templates for every occasion', href: '/features/event-templates', text: 'Every theme, for every kind of event.' },
      ],
    },
  },

  christmas: {
    path: '/design-your-christmas-invitation',
    intent: 'invitation',
    saveLabel: 'Save my invitation',
    occasion: 'christmas',
    defaultTheme: 'christmas-party',
    seo: {
      title: 'Free Christmas Party Invitation Maker: Design Online',
      description: 'Design your Christmas party invitation online for free. Pick a festive design, add your party’s name and date, and see it instantly. No sign-up needed to try.',
      keywords: ['christmas party invitation', 'christmas invitation maker', 'free christmas invitations', 'online christmas invitations', 'holiday party invitation', 'office christmas party invitation'],
    },
    breadcrumb: 'Christmas invitation maker',
    eyebrow: 'Free Christmas invitation maker',
    h1: 'Design your Christmas party invitation',
    intro: 'Pick a festive design, add your party’s name and date, and see your invitation and its matching party page. No account needed to try it.',
    example: 'The Smiths’ Christmas Party',
    app: {
      name: 'MyGala Christmas Invitation Maker',
      description: 'Free online Christmas party invitation maker: choose a festive design, add your party’s name and date, and preview your invitation and matching party page. Send it by email, text or WhatsApp, or print it.',
    },
    steps: [
      { title: 'Pick a festive design', text: 'Start with Christmas Party, White Christmas, Merry or Gnomes, or any other theme. Each one is an invitation and a matching party page.' },
      { title: 'Add your party’s name and date', text: 'Type the name of your party and its date and watch your invitation update as you type.' },
      { title: 'Save it with a free account', text: 'Create your account with your email or Google. Your design, name and date come with you, so you only choose your page address.' },
      { title: 'Finish it and send it', text: 'Add the time and place, adjust the wording and colours, then email, text or WhatsApp it to your guests. They RSVP in one tap on your party page.' },
    ],
    blocks: [
      {
        heading: 'For every kind of Christmas party',
        paragraphs: [
          'Family Christmas dinners, office holiday parties, ugly sweater nights, cookie exchanges, Christmas Eve open houses and New Year’s gatherings. Every invitation opens to a party page in the same design, with the date and place, a countdown to the big day, RSVPs and photos, so guests have everything in one link.',
        ],
      },
      {
        heading: 'Make it yours after you sign up',
        paragraphs: ['The invitation designer shows a live 5×7 preview as you work. You can change:'],
        bullets: CHANGE_LATER,
      },
      {
        heading: 'Gift exchange and potluck on the same page',
        paragraphs: [
          'Hosting a Secret Santa? Add a gift exchange to your party page: guests sign up with their gift ideas, you draw names with one click, and each person finds out privately who they’re buying for. Planning a potluck? Let guests sign up for what they’ll bring, so you don’t end up with six desserts. Both come with Plus, a one-time upgrade for your event.',
        ],
      },
    ],
    themes: {
      heading: 'Christmas invitation designs',
      text: 'See any design as a full party page before you choose it. Every other theme works for a holiday party too.',
      slugs: ['christmas-party', 'white-christmas', 'merry', 'gnomes'],
    },
    faqs: [
      ...SHARED_FAQS,
      { q: 'Can I use it for an office Christmas party?', a: 'Yes. Name the party, add the date, time and venue, and send the invitation to your colleagues by email. Their replies appear in your guest list as they answer, and with Plus you can keep the page private with a password.' },
      { q: 'Can guests do a Secret Santa from the invitation?', a: 'Yes, with Plus. Add a gift exchange to your party page: guests sign up on the page with their gift ideas, you draw names with one click, and each person is told privately by email, text or WhatsApp.' },
    ],
    related: {
      heading: 'More for your Christmas party',
      links: [
        { label: 'Christmas invitations', href: '/christmas-invitations', text: 'Ideas and designs for Christmas party invitations.' },
        { label: 'Gift exchange (Secret Santa)', href: '/features/gift-exchange', text: 'Draw names for your Secret Santa online.' },
        { label: 'Potluck sign-up', href: '/features/potluck', text: 'Let guests sign up for what they’ll bring.' },
      ],
    },
  },

  wedding: {
    path: '/design-your-wedding-invitation',
    intent: 'website',
    saveLabel: 'Save my wedding website',
    nameLabel: 'Your names',
    dateLabel: 'Wedding date',
    inlineSignup: true,
    liveWebsite: true,
    websiteFirst: true,
    occasion: 'wedding',
    defaultTheme: 'the-day',
    seo: {
      title: 'Free Wedding Invitation Maker with a Matching Website',
      description: 'Design your wedding invitation and wedding website free. Pick a theme, add your names and date, and see both instantly. No sign-up needed to try.',
      keywords: ['wedding invitation maker', 'free wedding invitations', 'online wedding invitations', 'wedding website and invitations', 'digital wedding invitation', 'design your own wedding invitation'],
    },
    breadcrumb: 'Wedding invitation maker',
    eyebrow: 'Free wedding website & invitations',
    h1: 'Design your wedding invitation and website',
    intro: 'Pick a theme, add your names and wedding date, and watch your wedding website and invitation fill in. No account needed to try it.',
    example: 'Sofia & James',
    app: {
      name: 'MyGala Wedding Invitation Maker',
      description: 'Free online wedding invitation maker: choose a theme, add your names and wedding date, and preview your invitation and matching wedding website. Send it by email, text or WhatsApp, or print it.',
    },
    steps: [
      { title: 'Pick your wedding theme', text: 'Choose from our wedding themes: classic, romantic, rustic, botanical, coastal and more. Each one is a wedding website and a matching invitation.' },
      { title: 'Add your names and date', text: 'Type your names and your wedding date and watch your invitation update as you type.' },
      { title: 'Save it with a free account', text: 'Create your account with your email or Google. Your theme, names and date come with you, so you only choose your website’s address.' },
      { title: 'Finish your website and invite everyone', text: 'Add the venue, schedule and your story, then email, text or WhatsApp your invitation. Guests RSVP in one tap on your wedding website.' },
    ],
    blocks: [
      {
        heading: 'One design for your website and your invitations',
        paragraphs: [
          'Every MyGala wedding invitation opens into your wedding website in the same design: RSVPs with plus-ones and meal notes, your love story, the schedule, the venue with a map, a countdown and a photo wall where guests share their pictures. Guests need no account and no app, just your link.',
        ],
      },
      {
        heading: 'Make it yours after you sign up',
        paragraphs: ['The invitation designer shows a live 5×7 preview as you work. You can change:'],
        bullets: CHANGE_LATER,
      },
      {
        heading: 'Send it any way you like',
        paragraphs: [
          'Email your invitation to the guests you choose, each greeted by name, with an RSVP button. Or send it as a text or WhatsApp message from your own phone, so it comes from your number. Prefer paper? Print it or save it as a PDF, with a QR code that opens your wedding website.',
        ],
      },
    ],
    themes: { heading: 'Wedding themes', text: 'See any theme as a full wedding website before you choose it.', slugs: THEME_CARDS.filter((t) => t.category === 'wedding').map((t) => t.slug) },
    faqs: [
      ...SHARED_FAQS,
      { q: 'Can guests RSVP for their plus-ones?', a: 'Yes. Guests RSVP on your wedding website for themselves and the people with them, and you see every answer in your guest list.' },
    ],
    related: {
      heading: 'More for your wedding',
      links: [
        { label: 'Wedding websites', href: '/wedding-website', text: 'Every wedding theme, scrolling, with matching invitations.' },
        { label: 'Wedding colour palettes', href: '/wedding-colour-palette', text: 'Find the colours for your wedding.' },
        { label: 'Online invitations', href: '/features/invitations', text: 'How designing and sending invitations works.' },
      ],
    },
  },

  celebration: {
    path: '/design-your-party-invitation',
    intent: 'invitation',
    saveLabel: 'Save my invitation',
    dateLabel: 'Party date',
    inlineSignup: true,
    liveWebsite: true,
    websiteFirst: true,
    occasion: 'celebration',
    defaultTheme: 'christmas-party',
    seo: {
      title: 'Free Party Invitation Maker with a Matching Party Page',
      description: 'Design your party invitation free: Christmas, birthdays, baby showers or Halloween. Add the name and date and see your invitation and party page instantly.',
      keywords: ['party invitation maker', 'free party invitations', 'birthday invitation maker', 'baby shower invitation maker', 'halloween invitation maker', 'christmas party invitation maker'],
    },
    breadcrumb: 'Party invitation maker',
    eyebrow: 'Free party invitations',
    h1: 'Design your party invitation and party page',
    intro: 'Pick a theme, add your party’s name and date, and watch your party page and invitation fill in. No account needed to try it.',
    example: 'Emma’s 30th Birthday',
    app: {
      name: 'MyGala Party Invitation Maker',
      description: 'Free online party invitation maker for Christmas parties, birthdays, baby showers and Halloween: choose a theme, add the name and date, and preview your invitation and matching party page. Send it by email, text or WhatsApp, or print it.',
    },
    steps: [
      { title: 'Pick your party theme', text: 'Start with a Christmas, birthday, baby shower or Halloween theme, or any other. Each one is a party page and a matching invitation.' },
      { title: 'Add the name and date', text: 'Type your party’s name and date and watch your party page and invitation update as you type.' },
      { title: 'Save it with a free account', text: 'Create your account right on this page. Your theme, name and date are saved, and your party page is ready to finish.' },
      { title: 'Finish it and send it', text: 'Add the time and place, adjust the wording and colours, then email, text or WhatsApp your invitation. Guests RSVP in one tap on your party page.' },
    ],
    blocks: [
      {
        heading: 'For every celebration',
        paragraphs: [
          'Christmas dinners and office holiday parties, birthdays and milestone birthdays, baby showers and gender reveals, Halloween costume parties and Día de los Muertos gatherings, quinceañeras, sweet 16s and every get-together in between. Every invitation opens into a party page in the same design, with the date and place, a countdown, RSVPs and a photo wall, so guests have everything in one link.',
        ],
      },
      {
        heading: 'Make it yours after you sign up',
        paragraphs: ['The invitation designer shows a live 5×7 preview as you work. You can change:'],
        bullets: CHANGE_LATER,
      },
      {
        heading: 'Send it any way you like',
        paragraphs: [
          'Email your invitation to the guests you choose, each greeted by name, with an RSVP button. Or send it as a text or WhatsApp message from your own phone, so it comes from your number. Prefer paper? Print it or save it as a PDF, with a QR code that opens your party page.',
        ],
      },
    ],
    themes: { heading: 'Party themes', text: 'See any theme as a full party page before you choose it.', slugs: CELEBRATION_THEMES },
    faqs: [
      ...SHARED_FAQS,
      { q: 'What kinds of parties is it for?', a: 'Christmas and holiday parties, birthdays, baby showers, Halloween and Día de los Muertos, quinceañeras and sweet 16s, and any other celebration. Every theme works for any event; these are listed first.' },
      { q: 'Can I run a Secret Santa or a potluck from the party page?', a: 'Yes, with Plus. Add a gift exchange and guests sign up with gift ideas, then you draw names with one click. Add a potluck sign-up and guests choose what they’ll bring.' },
    ],
    related: {
      heading: 'More for your party',
      links: [
        { label: 'Party invitations', href: '/party-invitations', text: 'Every party theme, scrolling, with matching invitations.' },
        { label: 'Gift exchange (Secret Santa)', href: '/features/gift-exchange', text: 'Draw names for your Secret Santa online.' },
        { label: 'Potluck sign-up', href: '/features/potluck', text: 'Let guests sign up for what they’ll bring.' },
      ],
    },
  },
};
