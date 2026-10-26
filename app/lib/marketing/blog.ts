import type { StartOccasion } from '@/app/lib/start-intent';
import type { Faq, SeoMeta } from './types';

// Blog articles for the marketing site (/blog and /blog/[slug]). Newest
// first: the blog index lists them in this order. A post with its own
// `path` is a guide with its own page (e.g. /how-to-create-a-wedding-website)
// instead of /blog/[slug]; it's still listed on the blog.
//
// Text in paragraphs, lists and notes may use two bits of markup:
// [link text](/path) for a link and **bold** for emphasis.

export type ArticleBlock =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'checklist'; items: string[] } // shown as tick boxes
  | { type: 'note'; text: string } // a highlighted tip
  | { type: 'image'; src: string; alt: string; caption?: string }
  // A MyGala screenshot, shown whole and zoomable; narrow for tall ones.
  | { type: 'screenshot'; src: string; alt: string; caption: string; width: number; height: number; narrow?: boolean }
  // A one-line "Try it free" sign-up link; occasion starts sign-up with that occasion's themes.
  | { type: 'try'; text: string; occasion?: StartOccasion }
  | { type: 'templates'; slugs: string[] } // live theme previews
  | { type: 'cta'; title: string; text: string; button: string }; // sign-up box

export type ArticleSection = { heading?: string; blocks: ArticleBlock[] };

export type BlogPost = {
  slug: string;
  path?: string; // its own page, in place of /blog/[slug]
  seo: SeoMeta;
  eyebrow: string;
  title: string; // the article's <h1>
  lead: string;
  summary: string; // card text on the blog index
  cardImage: string; // card photo on the blog index
  published: string; // YYYY-MM-DD
  readMinutes: number;
  sections: ArticleSection[];
  faqs?: Faq[];
  related: string[]; // feature slugs
  cta: { title: string; text: string };
};

const WEDDINGS = '/events/weddings';

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-create-a-wedding-website',
    path: '/how-to-create-a-wedding-website',
    seo: {
      title: 'How to Create a Wedding Website: A Step-by-Step Guide',
      description:
        'How to create a wedding website in four steps, with screenshots: pick a template, add your date and venue, set up RSVPs and share your link. Free to start on MyGala.',
      keywords: ['how to create a wedding website', 'create a wedding website', 'how to create a wedding website for free', 'wedding website step by step', 'wedding website with RSVP', 'free wedding website'],
    },
    eyebrow: 'Step-by-step guide',
    title: 'How to create a wedding website',
    lead:
      'You can create a wedding website in about 20 minutes. This guide walks through the four steps on MyGala, with a screenshot of each one: pick a template, add your date and venue, set up RSVPs and share your link.',
    summary: 'The four steps, with screenshots: pick a template, add your date and venue, set up RSVPs and share your link.',
    cardImage: '/images/guides/how-to-create-a-wedding-website/step-2-what-guests-see.webp',
    published: '2026-10-25',
    readMinutes: 6,
    sections: [
      {
        blocks: [
          { type: 'p', text: 'We’ll follow one couple, Emma and Liam, as they make their page. Before you start, have your names, your wedding date and the venue’s address handy. Your guest list can come later.' },
        ],
      },
      {
        heading: 'Step 1: Pick a template',
        blocks: [
          { type: 'p', text: 'Every wedding website starts from a template. MyGala has 8 wedding designs, from ivory peonies to a candlelit forest, and each one comes with a [matching invitation](/features/invitations). Every template has the same features, so choose on looks alone. You can switch to another design at any time without losing your details.' },
          { type: 'screenshot', src: '/images/guides/how-to-create-a-wedding-website/step-1-choose-a-template.webp', width: 1600, height: 1000, alt: 'The MyGala theme gallery filtered to Weddings, showing The Day, Love and Nature, each with its invitation and website side by side and a Choose button', caption: 'The theme gallery: each wedding design shows its invitation and its website side by side.' },
          { type: 'p', text: 'Next, add your names and the date, and choose your web address. MyGala suggests a few from your names, such as **mygala.ca/emma-and-liam**. As you type, you see your invitation and your website update in the preview.' },
          { type: 'screenshot', src: '/images/guides/how-to-create-a-wedding-website/step-1-names-date-address.webp', width: 1600, height: 1000, alt: 'The MyGala setup screen with the event name Emma & Liam, the date June 12, 2027, a choice of page addresses, and live previews of the invitation and website', caption: 'Your names, the date and your web address, with a live preview of your invitation and website.' },
          { type: 'try', occasion: 'wedding', text: 'Pick your template and see your names on it' },
        ],
      },
      {
        heading: 'Step 2: Add your date, venue and directions',
        blocks: [
          { type: 'p', text: 'Your page opens in the editor. Click any text, button or photo on it to change it. A short checklist on the left suggests what to do next, starting with the time and place.' },
          { type: 'p', text: 'Add the start and end time, then the venue’s name and address. Start typing the address and pick it from the list: that also sets the city and country on your banner, and gives guests a **Get directions** link to the map.' },
          { type: 'screenshot', src: '/images/guides/how-to-create-a-wedding-website/step-2-date-and-location.webp', width: 1000, height: 1202, narrow: true, alt: 'The Edit the date & location dialog in MyGala with the date June 12, 2027, a 4:00 PM start and 11:00 PM end, and the venue Casa Loma at 1 Austin Terrace, Toronto', caption: 'The date and location editor: the time, the venue and its address.' },
          { type: 'p', text: 'Here’s what guests see on their phone: your names and date on the banner, then the ceremony details with the venue, the address and directions.' },
          { type: 'screenshot', src: '/images/guides/how-to-create-a-wedding-website/step-2-what-guests-see.webp', width: 1600, height: 1150, alt: 'Two phones showing Emma and Liam’s wedding website: the banner with their names, date and RSVP button, and the Date & location section for Casa Loma with a Get directions link', caption: 'What guests see: the banner, then the date, venue and directions.' },
          { type: 'note', text: 'Got a ceremony, cocktail hour and dinner? Add each one to your **event program** so guests know when and where to be all day.' },
          { type: 'try', occasion: 'wedding', text: 'Add your venue and see it on your page' },
        ],
      },
      {
        heading: 'Step 3: Set up RSVPs',
        blocks: [
          { type: 'p', text: 'RSVPs are switched on from the start. Guests fill in a short form on your website: their name and email, whether they’re coming, how many people are in their party, and a note for you, which is a handy place for meal requests and allergies.' },
          { type: 'screenshot', src: '/images/guides/how-to-create-a-wedding-website/step-3-rsvp-form.webp', width: 1000, height: 1150, narrow: true, alt: 'The RSVP form on a phone, with fields for full name, email, phone, will you attend, number of guests and a note for the couple, and a Send RSVP button', caption: 'The RSVP form guests fill in on your website.' },
          { type: 'p', text: 'Every reply lands on your RSVP page, with the number attending, the number declining and the total head count. You can also:' },
          {
            type: 'list',
            items: [
              '**Get an email** each time someone replies or changes their reply.',
              '**Accept replies only from guests on your guest list,** so a forwarded link can’t add extra guests.',
              '**Export every reply to a spreadsheet** to send final numbers to your caterer.',
            ],
          },
          { type: 'screenshot', src: '/images/guides/how-to-create-a-wedding-website/step-3-rsvp-replies.webp', width: 1600, height: 1000, alt: 'The MyGala RSVP page showing 5 attending, 1 declining and 10 total guests, with each reply listed by name, status, guest count and note', caption: 'Every reply in one place, with the head count and each guest’s note.' },
          { type: 'note', text: 'Set your RSVP deadline about 3 to 4 weeks before the wedding, so you have time to give final numbers to your caterer and venue.' },
          { type: 'try', occasion: 'wedding', text: 'Turn on RSVPs for your wedding' },
        ],
      },
      {
        heading: 'Step 4: Share your link',
        blocks: [
          { type: 'p', text: 'When your page is ready, click **Share** at the top of the editor. Copy your link, or send it straight to WhatsApp, Facebook, email or a text message. Guests just open the link: they don’t need an app or an account.' },
          { type: 'screenshot', src: '/images/guides/how-to-create-a-wedding-website/step-4-share-your-link.webp', width: 1600, height: 1000, alt: 'The MyGala Share menu open over Emma and Liam’s page, with a Copy link button and options for WhatsApp, Facebook, X, LinkedIn, Telegram, Email and Text message', caption: 'The Share menu: copy your link or send it by WhatsApp, email or text.' },
          { type: 'p', text: 'For something more formal, design an [invitation](/features/invitations) that matches your website. Change the wording, fonts and colours, then send it by email, text message or WhatsApp, or print it. A QR code on the invitation takes guests straight to your RSVP form.' },
          { type: 'screenshot', src: '/images/guides/how-to-create-a-wedding-website/step-4-matching-invitation.webp', width: 1600, height: 1000, alt: 'The MyGala invitation designer with Emma and Liam’s details, editable wording, and a preview of the matching invitation with a QR code', caption: 'The invitation designer: an invitation that matches your website, with a QR code for RSVPs.' },
          { type: 'try', occasion: 'wedding', text: 'Create your wedding website and share it today' },
        ],
      },
      {
        heading: 'Before you share it',
        blocks: [
          {
            type: 'checklist',
            items: [
              'Open your page on your phone the way a guest would',
              'Check the date, the times and the venue’s address',
              'Send yourself a test RSVP to make sure it reaches you',
              'Add your welcome message and a banner photo you love',
              'Put the link on your save-the-dates and invitations',
            ],
          },
          { type: 'note', text: 'Not sure what else to put on your page? See [what to include on a wedding website](/blog/how-to-make-a-wedding-website), from the schedule to the registry and travel details.' },
        ],
      },
    ],
    faqs: [
      { q: 'Can I create a wedding website for free?', a: 'Yes. On MyGala you can create and share a wedding website for free, with every template, RSVPs, the guest list, the countdown, the date and venue details and the schedule. Invitations by email, text and WhatsApp are free too. MyGala Plus, a one-time payment per wedding website, adds extras like reminders, the registry section and your own domain.' },
      { q: 'How long does it take to create a wedding website?', a: 'About 20 minutes for the essentials: pick a template, add your names, date and venue, and turn on RSVPs. You can keep adding details, photos and the schedule as your plans come together.' },
      { q: 'Can I change my template later?', a: 'Yes. You can switch to another design at any time, and your names, date, venue, RSVPs and other details stay as they are.' },
      { q: 'Do guests need an app or an account to RSVP?', a: 'No. Guests open your link in any browser on their phone or computer and fill in the RSVP form. Nothing to download and no account to create.' },
      { q: 'Can guests RSVP for their whole family?', a: 'Yes. The RSVP form asks how many people are in each guest’s party, so one person can reply for everyone, and your RSVP page shows the total head count.' },
    ],
    related: ['event-templates', 'invitations', 'event-reminder-emails', 'guest-photo-qr-code', 'custom-sections', 'custom-domain'],
    cta: { title: 'Create your wedding website', text: 'Pick a template, add your date and venue, turn on RSVPs and share one link with every guest. It’s free to start.' },
  },
  {
    slug: 'wedding-planning-checklist',
    seo: {
      title: 'The Complete Wedding Planning Checklist',
      description:
        'A month-by-month wedding planning checklist, from the first budget conversation 12+ months out to the thank-you notes, with tips to keep it all on track.',
      keywords: ['wedding planning checklist', 'wedding checklist', 'wedding planning timeline', 'how to plan a wedding', 'wedding to-do list', 'month by month wedding checklist'],
    },
    eyebrow: 'Wedding planning',
    title: 'The Complete Wedding Planning Checklist',
    lead:
      'Most weddings take 12 to 18 months to plan, and the couples who enjoy that stretch are usually the ones who break it into small, timed steps. This checklist walks you from the first budget conversation to the thank-you notes, grouped by how far out each task should happen.',
    summary: 'From the first budget conversation to the thank-you notes: every wedding planning task, grouped by how far out it should happen.',
    cardImage: '/images/themes/the-day/arch.jpeg',
    published: '2026-10-15',
    readMinutes: 8,
    sections: [
      {
        blocks: [
          { type: 'p', text: 'Treat the timeline as a guide, not a rulebook. If you’re planning in six months, start at the top anyway and work through the earlier sections quickly. Popular venues and vendors book first, so those come before anything decorative.' },
        ],
      },
      {
        heading: '12+ months before: lay the foundation',
        blocks: [
          { type: 'p', text: 'Every later decision depends on three numbers: your budget, your guest count and your date. Settle those first.' },
          {
            type: 'checklist',
            items: [
              'Talk through your vision together: size, style, season, formal or relaxed',
              'Set a total budget and agree who is contributing what',
              'Draft a rough guest list to get a working headcount',
              'Decide whether you’ll use a wedding planner or day-of coordinator',
              'Choose two or three possible dates',
              'Tour venues and book your ceremony and reception spaces',
              'Start a shared spreadsheet or planning tool for budget, guests and vendors',
              'Ask your wedding party',
              'Look into wedding insurance',
            ],
          },
          { type: 'image', src: '/images/themes/the-day/arch.jpeg', alt: 'A floral ceremony arch facing rows of white chairs on a garden lawn' },
          { type: 'p', text: 'Once the venue is signed, your date is real. Everything else books around it.' },
        ],
      },
      {
        heading: '9 to 12 months before: book the big vendors',
        blocks: [
          { type: 'p', text: 'The vendors who can only work one wedding per day fill their calendars first. Secure them now.' },
          {
            type: 'checklist',
            items: [
              'Book your photographer and videographer',
              'Book your caterer, if the venue doesn’t provide one',
              'Book your band or DJ',
              'Start shopping for wedding attire; gowns can take 6 to 9 months to arrive',
              `Create a [wedding website](${WEDDINGS}) with your date, venue, travel details and FAQs`,
              'Reserve hotel room blocks for out-of-town guests',
              'Book an engagement photo session, if you want one',
              'Send save-the-dates, especially for destination or holiday weddings',
            ],
          },
          { type: 'note', text: `A [wedding website](${WEDDINGS}) saves you dozens of repeat questions later. Share the link on your save-the-dates so guests know where to look.` },
        ],
      },
      {
        heading: '6 to 9 months before: shape the look and feel',
        blocks: [
          { type: 'p', text: 'With the major pieces booked, this stretch is about style and guest experience.' },
          {
            type: 'checklist',
            items: [
              'Book your officiant and talk through the ceremony structure',
              'Hire a florist and decide on bouquets, centrepieces and ceremony flowers',
              'Choose wedding party attire and share ordering deadlines',
              `Set up your gift registry and add it to your [website](${WEDDINGS})`,
              'Book hair and makeup artists and schedule trials',
              'Plan the rehearsal dinner and book its venue',
              'Start planning your honeymoon and check passport expiry dates',
              'Book any extras: photo booth, lighting, lawn games, a videographer if not done yet',
            ],
          },
          { type: 'image', src: '/images/themes/love/photo-1.jpeg', alt: 'A bride holding a bouquet of blush and cream roses', caption: 'Bouquets, centrepieces and ceremony flowers are decided in this stretch.' },
        ],
      },
      {
        heading: '3 to 6 months before: lock in the details',
        blocks: [
          { type: 'p', text: 'This is when the smaller, practical pieces fall into place.' },
          {
            type: 'checklist',
            items: [
              'Order invitations and other stationery: programs, menus, place cards',
              'Finalize the guest list and collect mailing addresses',
              'Choose and order wedding rings, allowing time for sizing or engraving',
              'Hold a tasting and order your cake or desserts',
              'Book rentals: tables, chairs, linens, tents, tableware',
              'Arrange transportation for the couple, wedding party and guests if needed',
              'Check marriage licence requirements where you’re marrying, including wait periods and ID',
              'Buy shoes and accessories and schedule your first dress fitting',
              'Choose ceremony readings and start writing vows if you’re writing your own',
            ],
          },
          { type: 'image', src: '/images/themes/the-day/photo-1.jpeg', alt: 'Two wedding rings resting in an open palm', caption: 'Order rings early enough to allow for sizing or engraving.' },
        ],
      },
      {
        heading: '1 to 3 months before: invitations out, plans firm up',
        blocks: [
          { type: 'p', text: 'Invitations usually go out 6 to 8 weeks ahead, with an RSVP deadline about 3 to 4 weeks before the wedding.' },
          {
            type: 'checklist',
            items: [
              'Mail invitations and set your RSVP deadline',
              'Draft a day-of timeline with your planner, venue and photographer',
              'Give your photographer a shot list of must-have family groupings',
              'Send your DJ or band your must-play and do-not-play songs',
              'Buy gifts for your wedding party and parents',
              'Have your final hair and makeup trial',
              'Apply for your marriage licence within its valid window',
              'Plan any welcome bags for out-of-town guests',
              'Follow up with guests who haven’t RSVP’d',
            ],
          },
          { type: 'image', src: '/images/themes/nature/rsvp.jpeg', alt: 'A flat lay of wedding shoes, a bow tie, rings and a card reading “Our Wedding” beside cream roses', caption: 'Invitations go out 6 to 8 weeks before the day.' },
        ],
      },
      {
        heading: 'The final weeks: confirm everything',
        blocks: [
          { type: 'p', text: 'The goal now is to hand off as much as possible so you can be present on the day.' },
          { type: 'h3', text: '2 to 4 weeks before' },
          {
            type: 'checklist',
            items: [
              'Give final headcount to your caterer and venue',
              'Create the seating chart and order escort or place cards',
              'Confirm arrival times, addresses and contacts with every vendor',
              'Have your final dress or suit fitting',
              'Break in your wedding shoes',
              'Prepare tip and final-payment envelopes, labelled by vendor',
            ],
          },
          { type: 'h3', text: 'The week of' },
          {
            type: 'checklist',
            items: [
              'Share the day-of timeline with your wedding party and vendors',
              'Assign a point person to handle vendor questions on the day',
              'Pack an emergency kit: safety pins, stain remover, pain relievers, phone charger',
              'Pack for your honeymoon',
              'Attend the rehearsal and rehearsal dinner',
              'Get a good night’s sleep before the big day',
            ],
          },
          { type: 'image', src: '/images/themes/midnight-botanical/wedding_reception.jpg', alt: 'A reception table set with white plates, menus and a centrepiece of white flowers and greenery', caption: 'Final headcount, seating chart and place cards come together in the last weeks.' },
        ],
      },
      {
        heading: 'After the wedding',
        blocks: [
          {
            type: 'checklist',
            items: [
              'Return rentals and borrowed items',
              'Send thank-you notes within about three months',
              'File your signed marriage licence, if your officiant doesn’t',
              'Update your name on ID and accounts, if you’re changing it',
              'Leave reviews for the vendors you loved',
              'Preserve your dress and bouquet, if you’d like to keep them',
            ],
          },
        ],
      },
      {
        heading: 'A few tips to make it easier',
        blocks: [
          { type: 'p', text: '**Keep everything in one place.** A single shared document or planning tool for guests, budget, contracts and deadlines prevents the scramble of searching through emails.' },
          { type: 'p', text: '**Add a 10 to 15 percent buffer to your budget.** Small costs like postage, tips, alterations and last-minute rentals add up fast.' },
          { type: 'p', text: '**Delegate early.** Give trusted friends or family specific jobs, so the day runs without needing you to manage it.' },
          { type: 'image', src: '/images/themes/midnight-botanical/wedding_toast.png', alt: 'A couple and their guests raising glasses of champagne in a toast' },
          { type: 'p', text: 'Most of all, protect a little time for each other. The checklist exists to serve the day, not the other way around.' },
        ],
      },
    ],
    related: ['event-templates', 'invitations', 'event-reminder-emails', 'guest-photo-qr-code', 'livestream', 'custom-domain'],
    cta: { title: 'Put your guest details in one place', text: 'Create a free wedding website for your date, venue, schedule and RSVPs, and share one link with every guest.' },
  },
  {
    slug: 'how-to-make-a-wedding-website',
    seo: {
      title: 'What to Include on a Wedding Website: The Complete Checklist',
      description:
        'What to include on a wedding website: the essentials every guest looks for (date, venue, schedule, RSVP), the extras they’ll thank you for, and a checklist to tick off.',
      keywords: ['what to include on a wedding website', 'what to put on a wedding website', 'wedding website checklist', 'wedding website ideas', 'wedding website sections', 'wedding website templates'],
    },
    eyebrow: 'Wedding websites',
    title: 'What to include on a wedding website',
    lead:
      'A wedding website is the one link your guests come back to from the save-the-date to the morning after. Here’s everything it should include, so guests never have to text you for the address again.',
    summary: 'The essentials every guest looks for, the extras they’ll thank you for, and a checklist to tick off.',
    cardImage: '/images/themes/love/aisle.jpeg',
    published: '2026-08-20',
    readMinutes: 7,
    sections: [
      {
        heading: 'Why you need a wedding website',
        blocks: [
          { type: 'p', text: 'Paper invitations have room for the date, the venue and an RSVP card. Your guests need much more than that: where to stay, what to wear, when the shuttle leaves, whether kids are invited and where to find the registry. A [wedding website](/events/weddings) puts all of it in one place, and you can update it any time without reprinting anything.' },
          { type: 'p', text: 'It saves you time too. Instead of answering the same questions by text, you send a link. Instead of tracking RSVPs across emails and phone calls, every reply lands in one guest list.' },
          { type: 'note', text: 'Haven’t made yours yet? Our [step-by-step guide to creating a wedding website](/how-to-create-a-wedding-website) walks through it with screenshots, from picking a template to sharing your link.' },
          { type: 'image', src: '/images/themes/love/aisle.jpeg', alt: 'A seaside ceremony aisle lined with chairs and gold flower stands, leading to a floral arch by the ocean', caption: 'Destination or local, guests need the same details in one place.' },
        ],
      },
      {
        heading: 'The essentials every wedding website should include',
        blocks: [
          { type: 'p', text: 'These are the sections guests look for first. Each one is included free on every MyGala [wedding website](/events/weddings).' },
          {
            type: 'list',
            items: [
              '**Your names, date and a welcome message.** The banner is the first thing guests see, so use a photo you love and a line or two about your story.',
              '**A countdown** to the big day, which guests (and you) will check more often than you’d think.',
              '**Ceremony and reception details,** with the time, venue, address and a map with directions.',
              '**The schedule.** An event program for the day, or for the whole weekend from the welcome drinks to the farewell brunch.',
              '**An RSVP form** with guest counts, so one person can reply for their whole party. Replies arrive in your guest list, which you can export to a spreadsheet. You can also import your guest list from a spreadsheet or your contacts.',
              '**A photo gallery** of your engagement photos or favourite moments together.',
              '**Your language.** Show the page in English, French or Spanish with [translations](/features/event-page-translations), so every family can read it.',
            ],
          },
          { type: 'image', src: '/images/themes/nature/photo-1.jpeg', alt: 'An outdoor forest ceremony with draped fabric arch, string lights, candles and wooden chairs', caption: 'Add the venue with a map, so guests can find a ceremony even in the woods.' },
        ],
      },
      {
        heading: 'The extras guests will thank you for',
        blocks: [
          { type: 'p', text: 'These features make the weeks before the wedding, and the day itself, easier for everyone. They come with MyGala Plus, a one-time payment per wedding website.' },
          {
            type: 'list',
            items: [
              '**Travel, hotels, dress code and FAQs** in [custom sections](/features/custom-sections) written your way.',
              '**A registry section** that links to any store or registry site, with your own message about gifts.',
              '**[Invitations](/features/invitations)** that match your website, sent by email, text or WhatsApp, with a one-tap RSVP.',
              '**[Reminder emails](/features/event-reminder-emails)** that go out automatically a month, a week or a day before.',
              '**[Guest photo QR codes](/features/guest-photo-qr-code)** for the reception tables, so guests can upload their photos to your page with no app.',
              '**A [livestream](/features/livestream)** of the ceremony for family who can’t travel, plus song requests for the DJ.',
              '**[Password protection](/features/password-protection),** if you’d like only invited guests to see the page.',
            ],
          },
          { type: 'cta', title: 'Start your wedding website today', text: 'Every template, RSVPs, the schedule and the countdown are free. Add Plus only when you need it.', button: 'Create your wedding website' },
        ],
      },
      {
        heading: 'A design that matches your wedding',
        blocks: [
          { type: 'p', text: 'The design sets the mood before guests read a word. Choose one that suits your venue and style, from classic ivory florals to a candlelit forest or a breezy beach ceremony. On MyGala every [wedding template](/features/event-templates) includes every feature, so you choose on looks alone, and you can switch designs at any time without losing your details.' },
          { type: 'templates', slugs: ['the-day', 'love', 'nature', 'quiet-coastal', 'midnight-botanical', 'vilma'] },
          { type: 'p', text: 'Open any template above for a full live preview of how your page will look to guests.' },
          { type: 'cta', title: 'Create your wedding website', text: 'Pick a template, add your names and date, and your page is ready to share. It’s free to start.', button: 'Create your wedding website' },
        ],
      },
      {
        heading: 'A web address that’s easy to type',
        blocks: [
          { type: 'p', text: 'Your web address is what goes on your save-the-dates and invitations, so keep it short and easy to type. Every MyGala page gets a free address like **mygala.ca/emma-and-liam**. If you’d like your own, such as emmaandliam.com, you can connect a [custom domain](/features/custom-domain) with Plus.' },
        ],
      },
      {
        heading: 'Check it, then share the link',
        blocks: [
          { type: 'p', text: 'Before you share, open your page on your phone the way a guest would. Check the date, the times and the addresses, and send a test RSVP to make sure it reaches you.' },
          { type: 'p', text: 'Then share the link everywhere: on your save-the-dates and invitations, in your group chats and by email. Set your RSVP deadline about 3 to 4 weeks before the wedding so you have time to give final numbers to your caterer.' },
          { type: 'image', src: '/images/themes/midnight-botanical/wedding_venue.jpg', alt: 'A garden ceremony with pink drapes over a wooden arch and white chairs on the lawn' },
        ],
      },
      {
        heading: 'Your wedding website checklist',
        blocks: [
          {
            type: 'checklist',
            items: [
              'Choose a template that matches your wedding',
              'Pick a short web address, or connect your own domain',
              'Add your names, date, banner photo and welcome message',
              'Add the ceremony and reception details with the map',
              'Add the schedule for the day or the weekend',
              'Turn on RSVPs and import your guest list',
              'Add travel, hotel, dress code and registry details',
              'Choose your page’s language',
              'Preview it on your phone and send a test RSVP',
              'Share the link on your save-the-dates and invitations',
            ],
          },
          { type: 'note', text: 'Planning the rest of the wedding too? Our [complete wedding planning checklist](/blog/wedding-planning-checklist) covers every task from 12 months out to the thank-you notes.' },
        ],
      },
    ],
    faqs: [
      { q: 'How much does a wedding website cost?', a: 'A MyGala wedding website is free to create and share, with every template, RSVPs, the guest list, the countdown, event details and the schedule. Invitations by email, text and WhatsApp are free too. MyGala Plus is a one-time payment per wedding website (not a subscription) that adds features like reminders, livestream, the registry section, a custom domain and room for up to 500 guest photos (free pages get 50).' },
      { q: 'What should the first section of a wedding website say?', a: 'Your names, the date and the city, with a photo you love and a line or two of welcome. Guests should see at a glance whose wedding it is and when, with an RSVP button close by.' },
      { q: 'When should our wedding website go live?', a: 'Ideally before your save-the-dates go out, about 8 to 12 months before the wedding, so you can put the link on them. Start with the date and location, and add the rest as you book it.' },
      { q: 'Can we keep our wedding website after the wedding?', a: 'Yes. Your page stays online as a keepsake after the wedding.' },
    ],
    related: ['event-templates', 'invitations', 'guest-photo-qr-code', 'event-reminder-emails', 'custom-sections', 'custom-domain'],
    cta: { title: 'Create your wedding website', text: 'Pick a wedding template, add your details and share one link with every guest. It’s free to start.' },
  },
];

// Only the posts that live under /blog/[slug].
export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug && !p.path);
}

export function postPath(post: BlogPost): string {
  return post.path ?? `/blog/${post.slug}`;
}

// "October 15, 2026" — parsed as a calendar date so no time zone shifts it.
export function formatPostDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

// Markup removed: "[text](/path)" becomes "text", "**bold**" becomes "bold".
export function plainText(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '');
}

// Every word of an article, for the site search.
export function postText(post: BlogPost): string[] {
  return post.sections.flatMap((s) => [
    s.heading ?? '',
    ...s.blocks.flatMap((b) => {
      switch (b.type) {
        case 'p': case 'h3': case 'note': return [plainText(b.text)];
        case 'list': case 'checklist': return b.items.map(plainText);
        case 'image': return [b.alt, b.caption ?? ''];
        case 'screenshot': return [b.alt, b.caption];
        case 'cta': return [b.title, b.text];
        default: return [];
      }
    }),
  ]);
}
