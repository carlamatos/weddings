import type { ContentBlock, Faq, SeoMeta } from './types';

// Blog articles for the marketing site (/blog and /blog/[slug]). Newest
// first: the blog index lists them in this order.

// A section of an article. `checklist` shows its bullets as tick boxes.
export type ArticleSection = ContentBlock & { checklist?: boolean };

export type BlogPost = {
  slug: string;
  seo: SeoMeta;
  eyebrow: string;
  title: string; // the article's <h1>
  lead: string;
  summary: string; // card text on the blog index
  published: string; // YYYY-MM-DD
  readMinutes: number;
  sections: ArticleSection[];
  faqs: Faq[];
  related: string[]; // feature slugs
  cta: { title: string; text: string };
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'wedding-planning-checklist',
    seo: {
      title: 'How to Make a Wedding Planning Checklist (Month by Month)',
      description:
        'Build a wedding planning checklist that works: set your priorities, plan backwards from the date, and follow a month-by-month timeline from 12 months out to the day after.',
      keywords: ['wedding planning checklist', 'wedding checklist', 'wedding planning timeline', 'how to plan a wedding', 'wedding to-do list', 'month by month wedding checklist'],
    },
    eyebrow: 'Wedding planning',
    title: 'How to make a wedding planning checklist (month by month)',
    lead:
      'A good checklist turns a wedding from one enormous job into a series of small, clear tasks. Here’s how to build one around your own date, budget and priorities, plus a month-by-month timeline you can copy and adapt.',
    summary: 'Set your priorities, plan backwards from the date, and follow a month-by-month timeline from 12 months out to the day after.',
    published: '2026-10-15',
    readMinutes: 9,
    sections: [
      {
        heading: 'Why a checklist makes wedding planning easier',
        paragraphs: [
          'Most wedding stress doesn’t come from any single task. It comes from carrying dozens of them in your head at once and never being sure what’s been forgotten. A checklist moves all of that onto paper, puts it in order and shows you exactly what needs doing this month and what can wait.',
          'It also makes the work easy to share. When every task has a deadline and an owner, partners, family and friends can pick things up without a long conversation each time.',
        ],
      },
      {
        heading: 'Step 1: Agree on the big three — date, budget and guest count',
        paragraphs: [
          'Almost every decision on your list depends on three things: when the wedding is, how much you can spend, and roughly how many people you’ll invite. Settle these first, even as a range, before you add anything else.',
          'Your guest count drives the size of the venue and the catering bill. Your budget decides which vendors are realistic. Your date sets every deadline on the checklist.',
        ],
        bullets: [
          'Pick a target date, or a season with two or three backup dates.',
          'Set a total budget, and decide who is contributing and how much.',
          'Draft a first guest list, split into “must invite” and “would like to invite”.',
        ],
      },
      {
        heading: 'Step 2: Choose your priorities',
        paragraphs: [
          'No wedding gets everything. Ask each partner to pick the three things that matter most to them: the food, the photos, the music, the venue, the dress or suit, the guest experience. Where your lists overlap, spend more time and money. Where they don’t, keep it simple.',
          'Write your priorities at the top of your checklist. When a decision gets hard later, they’ll tell you where to compromise.',
        ],
      },
      {
        heading: 'Step 3: Plan backwards from the date',
        paragraphs: [
          'Start with your wedding day and work backwards. Some tasks have long lead times: popular venues and photographers book up early, attire can take months to order and alter, and guests need plenty of notice to travel. Put those near the top. Tasks that depend on final numbers, like seating charts and catering counts, belong near the end.',
          'For each task, write down three things: what it is, when it’s due and who’s responsible. A task without a deadline tends to drift; a task without an owner tends not to happen.',
        ],
      },
      {
        heading: 'Step 4: Pick a tool you’ll actually use',
        paragraphs: [
          'The best checklist is the one you’ll open every week. A shared spreadsheet or notes app works well for couples who like to tick things off together. A printed list on the fridge works for others. Whatever you choose, keep one master list rather than tasks scattered across messages and emails.',
          'Keep your guest-facing details in one place too. A wedding website gives guests a single link for the date, venue, schedule, dress code and RSVP, so you spend less time answering the same questions, and RSVPs arrive in a list you can export instead of in dozens of separate messages.',
        ],
      },
      {
        heading: '12 or more months before',
        checklist: true,
        bullets: [
          'Set the budget and draft the guest list.',
          'Choose your priorities and the overall style of the wedding.',
          'Research and book the ceremony and reception venues.',
          'Decide whether you’ll hire a wedding planner or coordinator.',
          'Book your officiant.',
          'Choose your wedding party.',
          'Start a wedding website so guests have one place to find every detail.',
        ],
      },
      {
        heading: '9 to 12 months before',
        checklist: true,
        bullets: [
          'Book the photographer and videographer.',
          'Book the caterer, if your venue doesn’t provide one.',
          'Book the band or DJ.',
          'Start shopping for the dress, suit or other wedding attire.',
          'Send save-the-dates, especially for a destination wedding or a long weekend.',
          'Reserve a block of hotel rooms for out-of-town guests.',
        ],
      },
      {
        heading: '6 to 9 months before',
        checklist: true,
        bullets: [
          'Book the florist, the cake or dessert maker, and rentals.',
          'Choose attire for the wedding party.',
          'Set up your gift registry and add it to your wedding website.',
          'Plan the honeymoon and check that passports are valid.',
          'Book hair and makeup.',
          'Arrange transportation for the day.',
        ],
      },
      {
        heading: '4 to 6 months before',
        checklist: true,
        bullets: [
          'Order or design your invitations.',
          'Plan the ceremony with your officiant: readings, music and vows.',
          'Book the rehearsal dinner venue.',
          'Order wedding rings.',
          'Schedule a cake tasting and a menu tasting.',
          'Decide whether you’ll livestream the ceremony for guests who can’t travel.',
        ],
      },
      {
        heading: '2 to 3 months before',
        checklist: true,
        bullets: [
          'Send invitations with a clear RSVP deadline, about three to four weeks before the wedding.',
          'Schedule attire fittings.',
          'Finalize the menu and the drinks.',
          'Confirm the schedule for the day with your venue and vendors.',
          'Apply for your marriage licence; requirements and waiting periods vary by province, state and country.',
          'Buy gifts for the wedding party and anyone who’s helping out.',
        ],
      },
      {
        heading: '1 month before',
        checklist: true,
        bullets: [
          'Follow up with guests who haven’t replied.',
          'Give final numbers to the caterer and venue.',
          'Make the seating chart.',
          'Send a reminder to guests with the time, address, parking and dress code.',
          'Write your vows and any speeches.',
          'Share the day’s timeline with the wedding party and every vendor.',
          'Prepare final payments and tips in labelled envelopes.',
        ],
      },
      {
        heading: 'The week of the wedding',
        checklist: true,
        bullets: [
          'Confirm arrival times with every vendor.',
          'Pick up attire and do a final try-on.',
          'Pack an emergency kit: safety pins, stain remover, pain relievers, phone chargers.',
          'Hand off day-of tasks so you’re not the one solving problems.',
          'Hold the rehearsal and rehearsal dinner.',
          'Get some sleep.',
        ],
      },
      {
        heading: 'After the wedding',
        checklist: true,
        bullets: [
          'Return rentals and settle any final bills.',
          'Collect the photos guests took, while everyone still remembers to share them.',
          'Send thank-you notes.',
          'Change your name on official documents, if you’re changing it.',
          'Review and save vendor contracts and receipts.',
        ],
      },
      {
        heading: 'Tips for keeping your checklist on track',
        bullets: [
          'Review the list together once a week, even for ten minutes.',
          'Break big tasks into small ones: “invitations” becomes design, proofread, print, address and post.',
          'Add the real deadlines from your vendor contracts as soon as you sign them.',
          'Leave a little buffer before the wedding; something always takes longer than expected.',
          'Cross things off. Seeing progress is half the point.',
        ],
      },
    ],
    faqs: [
      { q: 'How far in advance should I start planning a wedding?', a: 'Many couples start about 12 to 18 months ahead, which gives the most choice of venues and vendors. A smaller wedding can come together in a few months; start with the venue and the tasks with the longest lead times, and compress the rest of the timeline.' },
      { q: 'What should be the first thing on a wedding checklist?', a: 'Agree on your budget, a rough guest count and a target date. Nearly every other decision, from the venue to the catering, depends on those three.' },
      { q: 'When should we send wedding invitations?', a: 'Invitations usually go out about six to eight weeks before the wedding, or earlier for a destination wedding, with an RSVP deadline three to four weeks before the day so you have time to give the caterer final numbers.' },
      { q: 'How can I keep track of RSVPs?', a: 'Collect them in one place. A wedding website with an RSVP form gathers every reply, guest count and message into a single list you can export, instead of tracking answers across texts, emails and phone calls.' },
    ],
    related: ['event-templates', 'invitations', 'event-reminder-emails', 'guest-photo-qr-code', 'livestream', 'custom-domain'],
    cta: { title: 'Put your guest details in one place', text: 'Create a free wedding website for your date, venue, schedule and RSVPs, and share one link with every guest.' },
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

// "October 15, 2026" — parsed as a calendar date so no time zone shifts it.
export function formatPostDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
