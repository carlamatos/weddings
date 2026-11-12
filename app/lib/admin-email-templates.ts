// Ready-made emails for the admin email sender (/admin/email). Each is a
// starting point: the admin can edit the subject, text and button before
// sending. No server-only imports — the composer (a client component) reads
// these too.
//
// Text format: a blank line starts a new paragraph, a single line break stays
// a line break, and web addresses become links. Placeholders in {braces} are
// filled in for each person (ADMIN_EMAIL_PLACEHOLDERS).

export const ADMIN_EMAIL_AUDIENCES = {
  all: { label: 'Everyone', hint: 'Every account.' },
  no_guests: { label: 'Pages with no guests yet', hint: 'They made a page but haven’t added any guests.' },
  draft: { label: 'Draft pages', hint: 'Verified accounts whose page is still a draft.' },
  free_with_guests: { label: 'Free pages with guests', hint: 'Live pages with at least one guest, not on Live Party.' },
  upcoming: { label: 'Events in the next 30 days', hint: 'Live free pages whose event date is within 30 days.' },
  no_page: { label: 'No page yet', hint: 'Signed up but never created a page.' },
} as const;
export type AdminEmailAudience = keyof typeof ADMIN_EMAIL_AUDIENCES;

export function isAdminEmailAudience(v: unknown): v is AdminEmailAudience {
  return typeof v === 'string' && Object.hasOwn(ADMIN_EMAIL_AUDIENCES, v);
}

// Where the email's button goes.
export const ADMIN_EMAIL_BUTTON_LINKS = {
  dashboard: 'Their dashboard',
  page: 'Their event page',
  features: 'MyGala features',
  none: 'No button',
} as const;
export type AdminEmailButtonLink = keyof typeof ADMIN_EMAIL_BUTTON_LINKS;

export function isAdminEmailButtonLink(v: unknown): v is AdminEmailButtonLink {
  return typeof v === 'string' && Object.hasOwn(ADMIN_EMAIL_BUTTON_LINKS, v);
}

export const ADMIN_EMAIL_PLACEHOLDERS = [
  { key: '{first_name}', hint: 'Their first name, or “there” when we don’t have one' },
  { key: '{page_name}', hint: 'Their event page’s title' },
  { key: '{event_date}', hint: 'Their event date, e.g. “Saturday, December 12”' },
  { key: '{page_link}', hint: 'Their event page’s address' },
  { key: '{plus_price}', hint: 'The Live Party price, e.g. “$49.99 CAD + tax”' },
] as const;

export type AdminEmailTemplate = {
  id: string;
  name: string;
  description: string;
  audience: AdminEmailAudience;
  subject: string;
  body: string;
  buttonLabel: string;
  buttonLink: AdminEmailButtonLink;
};

export const ADMIN_EMAIL_TEMPLATES: AdminEmailTemplate[] = [
  {
    id: 'setup-help',
    name: 'Need a hand setting up?',
    description: 'A personal offer of help for people who made a page but haven’t added guests.',
    audience: 'no_guests',
    subject: 'Can I help you set up {page_name}?',
    body: `Hi {first_name},

Thank you so much for creating {page_name} with MyGala. It truly means a lot to have you with us.

I noticed your page doesn’t have any guests yet, so I wanted to reach out personally in case you’d like a hand. Whether it’s choosing a theme, adding your guest list or sending your first invitations, I’d be happy to help.

If you have a question, or if anything felt confusing, simply reply to this email. I read every message and will get back to you within one business day.

Wishing you a wonderful celebration,`,
    buttonLabel: 'Continue setting up my page',
    buttonLink: 'dashboard',
  },
  {
    id: 'draft-reminder',
    name: 'Your page is still a draft',
    description: 'A gentle reminder that their page isn’t published yet, so guests can’t see it.',
    audience: 'draft',
    subject: '{page_name} is ready when you are',
    body: `Hi {first_name},

Thank you for building {page_name} on MyGala. We’re so glad you’re here.

Your page is still saved as a draft, which means only you can see it for now. Whenever you’re ready for your guests to open it and RSVP, just sign in and press “Publish my page” at the top of your dashboard. It only takes a moment, and you can keep making changes afterwards.

If anything is holding you back, simply reply to this email. I’d be glad to help.

Warm regards,`,
    buttonLabel: 'Publish my page',
    buttonLink: 'dashboard',
  },
  {
    id: 'event-coming-up',
    name: 'Your event is coming up',
    description: 'For events in the next few weeks: the Live Party features that help most on the day.',
    audience: 'upcoming',
    subject: '{page_name} is almost here',
    body: `Hi {first_name},

{page_name} is coming up on {event_date}, and we’re delighted that MyGala is part of it.

As the day gets closer, a few features can make things even easier for you and your guests:
• Event reminders, sent to your guests automatically before the day
• Find Your Table, so guests can scan a QR code and see where they’re seated
• Unlimited guest photos, all gathered in one place for you to keep
• Song requests, so your DJ knows what everyone wants to hear

These are part of MyGala Live Party, a single payment of {plus_price} for your event, with no subscription. You can add it any time from your dashboard.

And if you have any questions at all, simply reply to this email. I’m always happy to help.

With warm wishes for your event,`,
    buttonLabel: 'See what Live Party adds',
    buttonLink: 'dashboard',
  },
  {
    id: 'whats-new',
    name: 'What’s new at MyGala',
    description: 'An update about recent improvements. Edit the list to match what’s new.',
    audience: 'all',
    subject: 'What’s new at MyGala',
    body: `Hi {first_name},

I hope you’re doing well! I wanted to share a few things we’ve added to MyGala recently, all made with your celebrations in mind:
• Short how-to videos for each feature, so you can see exactly where to click
• Event pages in English, Spanish or French, for guests who prefer another language
• Find Your Table: guests scan a QR code at the entrance, type their name and see their table

We’re a small team, and many of these ideas came from people like you. If there’s something you’d love to see next, simply reply to this email. We read every message.

Thank you for being part of MyGala,`,
    buttonLabel: 'Open my dashboard',
    buttonLink: 'dashboard',
  },
  {
    id: 'feedback',
    name: 'One quick question',
    description: 'Asks for honest feedback in a single reply. No button, so it feels like a personal note.',
    audience: 'all',
    subject: 'A quick question from MyGala',
    body: `Hi {first_name},

Thank you for giving MyGala a try. It really means a lot to a small team like ours.

We’d love to make MyGala better for you, so may I ask one quick question: what’s the one thing that would make planning your event easier?

There’s no wrong answer, and even a single sentence helps. Simply reply to this email. Every reply is read personally.

Thank you so much for your time, and congratulations on your celebration!

Kind regards,`,
    buttonLabel: '',
    buttonLink: 'none',
  },
  {
    id: 'blank',
    name: 'Write your own',
    description: 'A blank email with just the greeting.',
    audience: 'all',
    subject: '',
    body: `Hi {first_name},

`,
    buttonLabel: '',
    buttonLink: 'none',
  },
];

// The sign-off under every email (editable in the composer).
export const ADMIN_EMAIL_DEFAULT_SIGNATURE = 'Carla\nMyGala';

export const ADMIN_EMAIL_SUBJECT_MAX = 150;
export const ADMIN_EMAIL_BODY_MAX = 5000;
export const ADMIN_EMAIL_BUTTON_MAX = 40;
export const ADMIN_EMAIL_SIGNATURE_MAX = 200;
// Recipients per send. Resend's daily quota counts every email, so this
// also keeps one click from using a whole day's allowance.
export const ADMIN_EMAIL_MAX_RECIPIENTS = 100;
