import type { EventProgramItem, GuestSong } from '@/app/lib/definitions';
import type { ThemeProps } from './types';

// Sample content for the showcase previews at /themes/<slug>. Every theme is
// rendered from its real component with this content, so no standalone,
// reusable copy of a theme's markup is published.
type DemoContent = Omit<ThemeProps, 'demo' | 'isLoggedIn'>;

// [date, name, start, end, location]
type ProgramRow = [string, string, string, string | null, string | null];

function program(rows: ProgramRow[]): EventProgramItem[] {
  return rows.map(([event_date, name, start_time, end_time, location], i) => ({
    id: `demo-${i + 1}`, user_page_id: 0, event_date, name, start_time, end_time, location,
  }));
}

function songs(list: Array<[string, string, string]>): GuestSong[] {
  return list.map(([song_title, artist, requester_name], i) => ({
    id: `demo-${i + 1}`, user_page_id: 0, song_title, artist, requester_name, ip_address: null, created_at: '',
  }));
}

// Shared by every demo: paid features on (shown in preview mode), English.
function demo(slug: string, content: DemoContent): DemoContent {
  return {
    language: 'en',
    location: 'address',
    isPaid: true,
    galleryToken: 'demo',
    registryButtonLink: 'https://mygala.ca',
    shareUrl: `https://mygala.ca/themes/${slug}`,
    ...content,
  };
}

const COFFEE_STORY =
  'We met on a rainy Tuesday at a coffee shop that no longer exists, both reaching for the last almond croissant. Five years, two apartments, and one very stubborn golden doodle later, we’re ready to say “I do” surrounded by the people who’ve shaped our story.';

export const THEME_DEMOS: Record<string, DemoContent> = {
  // ─── Weddings ───
  'the-day': demo('the-day', {
    heading: 'Charlotte & James',
    heroEyebrow: 'Together with their families',
    description: 'We met on a rainy afternoon in a little bookshop by the sea, and have been writing our story together ever since. We would be honoured to have you with us as we begin our next chapter.',
    eventDate: '2027-09-18', eventTime: '16:00', eventEndTime: '23:00',
    venueName: 'The Prince of Wales Gardens', streetAddress: '14 Queen Street', city: 'Niagara-on-the-Lake', country: 'ON',
    formattedAddress: '14 Queen Street, Niagara-on-the-Lake, ON',
    userEmail: 'hello@charlotteandjames.example',
    registryDescription: 'Your presence is the greatest gift. For those who wish, we have a small registry.',
    eventProgram: program([
      ['2027-09-18', 'Ceremony', '16:00', null, 'The Rose Garden'],
      ['2027-09-18', 'Cocktail hour', '17:00', null, 'The Terrace'],
      ['2027-09-18', 'Dinner & toasts', '18:30', null, 'The Grand Hall'],
      ['2027-09-18', 'First dance & dancing', '20:30', '23:00', 'The Grand Hall'],
    ]),
    guestSongs: songs([['At Last', 'Etta James', 'Aunt Margaret'], ['La Vie en Rose', 'Louis Armstrong', 'Oliver']]),
    shareHashtag: 'CharlotteAndJames',
  }),
  love: demo('love', {
    heading: 'Isabella & Mateo',
    heroEyebrow: 'Together with their families',
    description: 'From a chance meeting at a friend’s dinner party to a lifetime of adventures together, we can’t wait to celebrate our love with the people who mean the most to us. Thank you for being part of our story.',
    eventDate: '2027-06-05', eventTime: '15:00', eventEndTime: '23:30',
    venueName: 'Rosewood Estate Winery', streetAddress: '2 Vineyard Lane', city: 'Kelowna', country: 'BC',
    formattedAddress: '2 Vineyard Lane, Kelowna, BC',
    userEmail: 'hello@isabellaandmateo.example',
    registryDescription: 'Your love and presence are all we wish for. For those who would like to, we have a small registry.',
    eventProgram: program([
      ['2027-06-05', 'Ceremony', '15:00', null, 'The Rose Garden'],
      ['2027-06-05', 'Cocktails', '16:00', '17:30', 'The Terrace'],
      ['2027-06-05', 'Dinner & toasts', '18:00', null, 'The Barrel Room'],
      ['2027-06-05', 'First dance & dancing', '20:30', '23:30', 'The Barrel Room'],
    ]),
    guestSongs: songs([['Perfect', 'Ed Sheeran', 'Lucia'], ['Can’t Help Falling in Love', 'Elvis Presley', 'Abuelo Tomás']]),
    shareHashtag: 'IsabellaAndMateo',
  }),
  'terracotta-harvest': demo('terracotta-harvest', {
    heading: 'Elena & Marcus',
    heroEyebrow: 'Together with their families',
    description: `${COFFEE_STORY} We can’t wait to celebrate with you among the orchard trees this September.`,
    eventDate: '2027-09-19', eventTime: '16:00', eventEndTime: '23:00',
    venueName: 'Maple Ridge Orchard Estate', streetAddress: '22550 River Rd', city: 'Maple Ridge', country: 'BC',
    formattedAddress: '22550 River Rd, Maple Ridge, BC',
    userEmail: 'hello@elenaandmarcus.example',
    registryDescription: 'Having you there is the best gift. For those who have asked, we have put together a small registry.',
    eventProgram: program([
      ['2027-09-18', 'Welcome drinks', '19:00', '22:00', 'The Cider House'],
      ['2027-09-19', 'Ceremony', '16:00', null, 'The Orchard'],
      ['2027-09-19', 'Harvest dinner', '18:00', null, 'The Long Table'],
      ['2027-09-19', 'Dancing under the lights', '20:30', '23:00', 'The Barn'],
    ]),
    guestSongs: songs([['At Last', 'Etta James', 'Grandma Rosa'], ['September', 'Earth, Wind & Fire', 'Theo']]),
    shareHashtag: 'ElenaAndMarcus',
  }),
  'midnight-botanical': demo('midnight-botanical', {
    heading: 'Sofia & James',
    heroEyebrow: 'Save the date',
    description: `${COFFEE_STORY} We can’t wait to celebrate with you this November evening.`,
    eventDate: '2026-11-07', eventTime: '18:00', eventEndTime: '23:30',
    venueName: 'Hycroft Manor', streetAddress: '1489 McRae Ave', city: 'Vancouver', country: 'BC',
    formattedAddress: '1489 McRae Ave, Vancouver, BC',
    userEmail: 'hello@sofiaandjames.example',
    registryDescription: 'Your presence is the greatest gift. For those who wish, we have a small registry.',
    eventProgram: program([
      ['2026-11-06', 'Welcome cocktails', '19:00', '22:00', 'The Library Bar'],
      ['2026-11-07', 'Ceremony', '18:00', null, 'The Conservatory'],
      ['2026-11-07', 'Candlelit dinner', '19:30', null, 'The Great Hall'],
      ['2026-11-07', 'Dancing', '21:30', '23:30', 'The Great Hall'],
    ]),
    guestSongs: songs([['At Last', 'Etta James', 'Uncle Paolo'], ['La Vie en Rose', 'Édith Piaf', 'Clara']]),
    shareHashtag: 'SofiaAndJames2026',
  }),
  'quiet-coastal': demo('quiet-coastal', {
    heading: 'Nora + Theo',
    heroEyebrow: 'together with their families',
    description: `${COFFEE_STORY} We can’t wait to celebrate with you on the coast.`,
    eventDate: '2027-06-13', eventTime: '16:00', eventEndTime: '22:30',
    venueName: 'Chesterman Beach', streetAddress: '1367 Chesterman Beach Rd', city: 'Tofino', country: 'BC',
    formattedAddress: '1367 Chesterman Beach Rd, Tofino, BC',
    userEmail: 'hello@noraandtheo.example',
    registryDescription: 'Your presence is the best gift. For those who wish, we have a small registry.',
    eventProgram: program([
      ['2027-06-11', 'Welcome bonfire', '19:00', '22:00', 'Chesterman Beach'],
      ['2027-06-13', 'Ceremony', '16:00', null, 'The Dunes'],
      ['2027-06-13', 'Seafood dinner', '17:30', null, 'The Driftwood Lodge'],
      ['2027-06-13', 'Dancing', '20:00', '22:30', 'The Driftwood Lodge'],
    ]),
    guestSongs: songs([['At Last', 'Etta James', 'Mom'], ['Banana Pancakes', 'Jack Johnson', 'Sam']]),
    shareHashtag: 'NoraAndTheo2027',
  }),
  vilma: demo('vilma', {
    heading: 'Isabella & William',
    heroEyebrow: 'Together with their families',
    description: `${COFFEE_STORY} We can’t wait to celebrate with you.`,
    eventDate: '2027-06-13', eventTime: '17:00', eventEndTime: '23:30',
    venueName: 'Hycroft Manor', streetAddress: '1489 McRae Ave', city: 'Vancouver', country: 'BC',
    formattedAddress: '1489 McRae Ave, Vancouver, BC',
    userEmail: 'hello@isabellaandwilliam.example',
    registryDescription: 'Your presence is the greatest gift. For those who wish, we have a small registry.',
    eventProgram: program([
      ['2027-06-12', 'Rehearsal dinner', '18:30', '21:30', 'The Garden Room'],
      ['2027-06-13', 'Ceremony', '17:00', null, 'The Rose Terrace'],
      ['2027-06-13', 'Reception & dinner', '18:30', null, 'The Ballroom'],
      ['2027-06-13', 'Dancing', '21:00', '23:30', 'The Ballroom'],
    ]),
    guestSongs: songs([['At Last', 'Etta James', 'Aunt June'], ['A Thousand Years', 'Christina Perri', 'Emma']]),
    shareHashtag: 'IsabellaAndWilliam',
  }),

  // ─── Celebrations ───
  alegria: demo('alegria', {
    heading: 'Sofia',
    heroEyebrow: 'Join us in celebrating',
    description:
      "Fifteen years of laughter, dreams, and a whole lot of love brought us to this day. Sofia is stepping into a new chapter, and we couldn't be more proud of the young woman she's become. Join us as we celebrate her with a day full of family, music, and joy.",
    eventDate: '2027-06-12', eventTime: '13:00', eventEndTime: '23:00',
    venueName: 'Mission Concepción', streetAddress: '807 Mission Rd', city: 'San Antonio', country: 'TX',
    formattedAddress: 'Mission Concepción, 807 Mission Rd, San Antonio, TX',
    userEmail: 'hello@sofiasquince.example',
    registryDescription: 'Your presence is the best gift. If you would like to bring something, we have put together a small list.',
    eventProgram: program([
      ['2027-06-12', 'Mass', '13:00', null, 'Mission Concepción'],
      ['2027-06-12', 'Court photos', '15:00', null, 'Mission Concepción'],
      ['2027-06-12', 'Reception & dancing', '18:00', '23:00', 'The Argyle Ballroom'],
    ]),
    guestSongs: songs([['Quinceañera', 'Thalía', 'Abuela'], ['Dancing Queen', 'ABBA', 'Mateo']]),
    shareHashtag: 'SofiasQuince',
  }),
  'fun-party': demo('fun-party', {
    heading: 'The Big Sweet 16',
    heroEyebrow: "Let's get this party started",
    description: 'Neon lights, loud music, and sixteen years of pure main-character energy. This is not a quiet dinner — it’s a full-on dance floor, a photo booth people actually want to use, and a night nobody’s going to forget. Come dressed to be seen.',
    eventDate: '2027-08-08', eventTime: '19:00', eventEndTime: '00:00',
    venueName: 'The Deck at Island Gardens', streetAddress: '888 MacArthur Causeway', city: 'Miami', country: 'FL',
    formattedAddress: '888 MacArthur Causeway, Miami, FL',
    userEmail: 'party@thebigsweet16.example',
    registryDescription: 'No pressure at all — but if you’re looking for ideas, here’s a peek at what would make her year.',
    eventProgram: program([
      ['2027-08-08', 'Doors open + photo booth', '19:00', null, 'The Deck'],
      ['2027-08-08', 'Grand entrance', '20:30', null, 'Main floor'],
      ['2027-08-08', 'DJ & dancing', '21:00', '00:00', 'Main floor'],
    ]),
    guestSongs: songs([['Espresso', 'Sabrina Carpenter', 'Mia'], ['Blinding Lights', 'The Weeknd', 'Jayden']]),
    shareHashtag: 'BigSweet16',
  }),
  balloons: demo('balloons', {
    heading: "Liam's 7th Birthday Bash",
    heroEyebrow: "It's party time",
    description: 'Liam turns seven this year, and he’s decided the only proper way to celebrate is balloons — as many as possible. Come blow out candles, pop a few, and help us celebrate seven whole years of Liam!',
    eventDate: '2026-11-14', eventTime: '13:00', eventEndTime: '16:00',
    venueName: 'Maple Grove Park Pavilion', streetAddress: '482 Maple Grove Ave', city: 'Austin', country: 'TX',
    formattedAddress: '482 Maple Grove Ave, Austin, TX',
    userEmail: 'hello@liamturns7.example',
    registryDescription: 'No gifts needed — but if you’re looking for ideas, here’s a peek at what Liam’s hoping for.',
    eventProgram: program([
      ['2026-11-14', 'Balloon games & face painting', '13:00', null, 'Maple Grove Park Pavilion'],
      ['2026-11-14', 'Cake & candles', '14:30', null, 'Pavilion'],
      ['2026-11-14', 'Piñata & goodbye', '15:30', '16:00', 'Pavilion'],
    ]),
    guestSongs: songs([['Happy', 'Pharrell Williams', 'Liam'], ['Can’t Stop the Feeling!', 'Justin Timberlake', 'Ava']]),
    shareHashtag: 'LiamTurns7',
  }),
  'baby-shower-girl': demo('baby-shower-girl', {
    heading: "Emma's Baby Shower",
    heroEyebrow: "It's a girl!",
    description: 'Our sweet baby girl is almost here, and we couldn’t wait to celebrate with the people we love most. Join us for an afternoon of tea, treats, games and plenty of cuddles-to-be as we get ready to welcome her home.',
    eventDate: '2027-04-17', eventTime: '14:00', eventEndTime: '17:00',
    venueName: 'The Garden Room', streetAddress: '1234 Maple Ave', city: 'Vancouver', country: 'BC',
    formattedAddress: '1234 Maple Ave, Vancouver, BC',
    userEmail: 'hello@emmasbabyshower.example',
    registryDescription: 'Your love is the best gift. If you’d like to bring something for baby, we’ve put together a little registry.',
    eventProgram: program([
      ['2027-04-17', 'Welcome & tea', '14:00', null, 'The Garden Room'],
      ['2027-04-17', 'Baby shower games', '14:45', null, 'Garden patio'],
      ['2027-04-17', 'Opening gifts', '15:45', null, 'The Garden Room'],
      ['2027-04-17', 'Cake & well-wishes', '16:30', '17:00', 'The Garden Room'],
    ]),
    guestSongs: songs([['Isn’t She Lovely', 'Stevie Wonder', 'Grandpa Joe'], ['Twinkle Twinkle Little Star', 'Lullaby', 'Aunt Lily']]),
    shareHashtag: 'WelcomeBabyEmma',
  }),
  'baby-shower-neutral': demo('baby-shower-neutral', {
    heading: "Sam & Alex's Baby Shower",
    heroEyebrow: 'Baby on the way!',
    description: 'Boy or girl? We’re keeping it a surprise! Join us for an afternoon of brunch, games and good wishes as we get ready to welcome our little one. Bring your best guess — we’ll find out together.',
    eventDate: '2027-05-22', eventTime: '13:00', eventEndTime: '16:00',
    venueName: 'The Sunroom', streetAddress: '22 Harbour Rd', city: 'Victoria', country: 'BC',
    formattedAddress: '22 Harbour Rd, Victoria, BC',
    userEmail: 'hello@babysamalex.example',
    registryDescription: 'Your presence is the best gift! If you’d like to bring something for baby, here is our little list.',
    eventProgram: program([
      ['2027-05-22', 'Welcome & brunch', '13:00', null, 'The Sunroom'],
      ['2027-05-22', 'Guess the baby games', '14:00', null, 'Garden'],
      ['2027-05-22', 'Opening gifts', '15:00', null, 'The Sunroom'],
      ['2027-05-22', 'Cake & well-wishes', '15:45', '16:00', 'The Sunroom'],
    ]),
    guestSongs: songs([['Here Comes the Sun', 'The Beatles', 'Nana'], ['Twinkle Twinkle Little Star', 'Lullaby', 'Jordan']]),
    shareHashtag: 'BabySamAlex',
  }),
  'baby-shower-boy': demo('baby-shower-boy', {
    heading: "Baby Noah's Shower",
    heroEyebrow: "It's a boy!",
    description: 'Our little boy is almost here, and we couldn’t wait to celebrate with the people we love most. Join us for an afternoon of games, treats and good wishes as we get ready to welcome Noah home.',
    eventDate: '2027-06-12', eventTime: '14:00', eventEndTime: '17:00',
    venueName: 'The Blue Room', streetAddress: '88 River Park Dr', city: 'Calgary', country: 'AB',
    formattedAddress: '88 River Park Dr, Calgary, AB',
    userEmail: 'hello@babynoah.example',
    registryDescription: 'Your presence is the best gift! If you’d like to bring something for baby, here is our little list.',
    eventProgram: program([
      ['2027-06-12', 'Welcome & treats', '14:00', null, 'The Blue Room'],
      ['2027-06-12', 'Baby shower games', '14:45', null, 'Garden'],
      ['2027-06-12', 'Opening gifts', '15:45', null, 'The Blue Room'],
      ['2027-06-12', 'Cake & well-wishes', '16:30', '17:00', 'The Blue Room'],
    ]),
    guestSongs: songs([['Beautiful Boy', 'John Lennon', 'Grandma Ruth'], ['Twinkle Twinkle Little Star', 'Lullaby', 'Uncle Ben']]),
    shareHashtag: 'WelcomeBabyNoah',
  }),

  // ─── Business events ───
  summit: demo('summit', {
    heading: 'Annual Leadership Summit',
    heroEyebrow: "You're invited",
    description: 'Leaders from across the industry come together for two days of ideas, connection, and forward thinking. This year’s summit focuses on resilient growth in a changing market — real case studies, candid panels, and the kind of conversations that don’t happen on a stage.',
    eventDate: '2027-04-14', eventTime: '09:00', eventEndDate: '2027-04-15', eventEndTime: '14:00',
    venueName: 'The Driskill Grand Ballroom', streetAddress: '604 Brazos St', city: 'Austin', country: 'TX',
    formattedAddress: '604 Brazos St, Austin, TX',
    userEmail: 'hello@leadershipsummit.example',
    registryDescription: 'This year’s summit is made possible by the partners who back the work our community does all year round.',
    eventProgram: program([
      ['2027-04-14', 'Registration & coffee', '09:00', null, 'Grand Ballroom Foyer'],
      ['2027-04-14', 'Opening keynote', '10:00', null, 'Grand Ballroom'],
      ['2027-04-15', 'Panel: Resilient growth', '09:30', null, 'Grand Ballroom'],
      ['2027-04-15', 'Closing lunch', '12:30', '14:00', 'Terrace'],
    ]),
    guestSongs: songs([['Circles', 'Post Malone', 'Dana'], ['Levitating', 'Dua Lipa', 'Marcus']]),
    shareHashtag: 'LeadershipSummit2027',
  }),
  nexus: demo('nexus', {
    heading: 'Nexus Team Offsite 2027',
    heroEyebrow: "You're invited",
    description: 'Two days away from the inbox to align on where we’re headed. We’ll review the year, set the roadmap together, break into teams to tackle the big questions, and close it all out with a dinner worth staying for.',
    eventDate: '2027-05-20', eventTime: '09:00', eventEndDate: '2027-05-21', eventEndTime: '21:00',
    venueName: 'The Riverside Collective', streetAddress: '120 Harbor St', city: 'Seattle', country: 'WA',
    formattedAddress: '120 Harbor St, Seattle, WA',
    userEmail: 'offsite@nexus.example',
    registryDescription: 'Slides, pre-reads, and everything else you’ll want before day one.',
    eventProgram: program([
      ['2027-05-20', 'Kickoff & strategy review', '09:00', null, 'Main Hall'],
      ['2027-05-20', 'Team breakouts', '13:00', null, 'Breakout Rooms'],
      ['2027-05-21', 'Roadmap presentations', '10:00', null, 'Main Hall'],
      ['2027-05-21', 'Closing dinner', '18:00', '21:00', 'The Riverside Collective'],
    ]),
    guestSongs: songs([['Feel Good Inc.', 'Gorillaz', 'Priya'], ['Good as Hell', 'Lizzo', 'Sam']]),
    shareHashtag: 'NexusOffsite2027',
  }),
  'dinner-gala': demo('dinner-gala', {
    heading: 'The Annual Gala Dinner',
    heroEyebrow: "You're cordially invited",
    description: 'A black-tie evening honoring another year of partnership, progress, and the people who made it possible. Join us for dinner, a few words from the people doing the work, and a night worth dressing up for.',
    eventDate: '2027-03-20', eventTime: '18:30', eventEndTime: '23:30',
    venueName: 'The Grand Ballroom', streetAddress: '1 Harbourfront Plaza', city: 'Toronto', country: 'ON',
    formattedAddress: '1 Harbourfront Plaza, Toronto, ON',
    userEmail: 'gala@theannualdinner.example',
    registryDescription: 'This evening is made possible by the partners who support the work we do all year.',
    eventProgram: program([
      ['2027-03-20', 'Cocktail reception', '18:30', null, 'The Grand Ballroom'],
      ['2027-03-20', 'Dinner & remarks', '19:30', null, 'The Grand Ballroom'],
      ['2027-03-20', 'Live music & dancing', '21:30', '23:30', 'The Grand Ballroom'],
    ]),
    guestSongs: songs([['Fly Me to the Moon', 'Frank Sinatra', 'Eleanor'], ['At Last', 'Etta James', 'Richard']]),
    shareHashtag: 'AnnualGala2027',
  }),

  // ─── General events ───
  community: demo('community', {
    heading: 'Maple Street Block Party',
    heroEyebrow: "You're part of it",
    description: 'One Saturday a year, the whole street shuts down for food, music, and neighbors old and new. It started as a handful of families on a porch and grew into the thing everyone waits for all summer. Come hungry, stay late.',
    eventDate: '2027-06-19', eventTime: '12:00', eventEndTime: '22:00',
    venueName: 'Maple Street', streetAddress: '400 Maple Street', city: 'Portland', country: 'OR',
    formattedAddress: '400 Maple Street, Portland, OR',
    userEmail: 'hello@maplestreetblockparty.example',
    registryDescription: 'Bringing a dish, lending a hand, or chipping in for supplies — here’s how to get involved.',
    eventProgram: program([
      ['2027-06-19', 'Potluck & grill', '12:00', null, 'Maple Street'],
      ['2027-06-19', "Kids' games", '14:00', null, 'North end of the block'],
      ['2027-06-19', 'Live music', '18:00', '22:00', 'Maple Street'],
    ]),
    guestSongs: songs([['Lovely Day', 'Bill Withers', 'The Garcias'], ['Good Vibrations', 'The Beach Boys', 'Mr. Patel']]),
    shareHashtag: 'MapleStreetParty',
  }),
  'antique-cars': demo('antique-cars', {
    heading: 'Maple Ridge Classic Car Show',
    heroEyebrow: 'Antique & Classic',
    description: 'Fifty years of chrome, curves and horsepower. Collectors and enthusiasts from across the valley roll in with everything from pre-war roadsters to 1970s muscle. Stroll the lot, talk shop with the owners, and stay for live music, food trucks and the awards.',
    eventDate: '2027-06-19', eventTime: '10:00', eventEndTime: '16:00',
    venueName: 'Memorial Peace Park', streetAddress: '11925 Haney Pl', city: 'Maple Ridge', postalCode: 'V2X 6G2', country: 'BC',
    formattedAddress: '11925 Haney Pl, Maple Ridge, BC V2X 6G2',
    userEmail: 'hello@mapleridgecarshow.example',
    registryDescription: 'The show is run by volunteers and local sponsors. Showing a car, donating a prize, or lending a hand — here’s how to be part of it.',
    eventProgram: program([
      ['2027-06-19', 'Show car registration & parking', '08:00', null, 'North gate'],
      ['2027-06-19', 'Gates open to the public', '10:00', null, 'Main lot'],
      ['2027-06-19', 'Parade of classics', '12:30', null, 'Haney Place loop'],
      ['2027-06-19', "People's Choice awards", '15:00', '16:00', 'Bandstand'],
    ]),
    guestSongs: songs([['Little Deuce Coupe', 'The Beach Boys', 'Earl'], ['Mustang Sally', 'Wilson Pickett', 'Denise']]),
    shareHashtag: 'MapleRidgeCarShow',
  }),
  'christmas-party': demo('christmas-party', {
    heading: 'The Holiday Party',
    heroEyebrow: "You're invited",
    description: 'Grab your coziest sweater and join us for an evening of mulled wine, festive treats, carols by the tree and a little gift exchange. It wouldn’t be Christmas without you!',
    eventDate: '2026-12-19', eventTime: '18:30', eventEndTime: '23:30',
    venueName: 'The Chalet', streetAddress: '12 Spruce Lane', city: 'Banff', country: 'AB',
    formattedAddress: '12 Spruce Lane, Banff, AB',
    userEmail: 'hosts@holidayparty.example',
    registryDescription: 'Bring a wrapped gift (around $25) for our Secret Santa exchange!',
    eventProgram: program([
      ['2026-12-19', 'Mulled wine & welcome', '18:30', null, 'By the fireplace'],
      ['2026-12-19', 'Holiday dinner', '19:30', null, 'Dining room'],
      ['2026-12-19', 'Secret Santa', '21:00', null, 'By the tree'],
      ['2026-12-19', 'Carols & cocoa', '22:00', '23:30', 'Living room'],
    ]),
    guestSongs: songs([['All I Want for Christmas Is You', 'Mariah Carey', 'Holly'], ['Jingle Bell Rock', 'Bobby Helms', 'Nick']]),
    shareHashtag: 'HolidayParty2026',
  }),
};
