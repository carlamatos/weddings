import type { StartOccasion } from '@/app/lib/start-intent';
import type { Faq, SeoMeta, Step } from './types';

// The two "design your invitation" pages (/design-your-invitation and
// /design-your-christmas-invitation): the try-it tool at the top
// (app/ui/marketing/try-invitation.tsx), then how it works, what you can
// change, the themes and questions — the words search engines read.

export type TryInvitationPage = {
  path: string;
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

export const TRY_INVITATION_PAGES: Record<'default' | 'christmas', TryInvitationPage> = {
  default: {
    path: '/design-your-invitation',
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
};
