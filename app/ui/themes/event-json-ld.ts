import { absoluteUrl } from '@/app/lib/marketing/seo';

// schema.org Event data for a guest's event page, so search engines and AI
// assistants can read the event's name, dates and place without guessing
// from the layout. Render it with <JsonLd>. Pages a host keeps out of search
// are already marked noindex (withSearchVisibility), so this adds nothing
// they don't publish.
type EventFields = {
  heading: string;
  description?: string;
  eventDate?: string;
  eventTime?: string;
  eventEndDate?: string;
  eventEndTime?: string;
  location?: string;
  url?: string;
  venueName?: string;
  streetAddress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  image?: string;
  pageUrl?: string;
  language?: string;
};

// "2027-09-18" + "16:00:00" → "2027-09-18T16:00" (local time, as the host entered it).
function dateTime(date?: string, time?: string): string | undefined {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
  const hm = time?.match(/^(\d{2}):(\d{2})/);
  return hm ? `${date}T${hm[1]}:${hm[2]}` : date;
}

function plain(text?: string): string | undefined {
  const s = text?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return s ? s.slice(0, 500) : undefined;
}

export function eventJsonLd(e: EventFields) {
  const startDate = dateTime(e.eventDate, e.eventTime);
  if (!e.heading || !startDate) return null;
  const endDate = dateTime(e.eventEndDate || (e.eventEndTime ? e.eventDate : undefined), e.eventEndTime);
  const online = e.location === 'virtual' && !!e.url;
  const place = !online && (e.venueName || e.streetAddress || e.city)
    ? {
        '@type': 'Place',
        name: e.venueName || [e.city, e.country].filter(Boolean).join(', '),
        address: {
          '@type': 'PostalAddress',
          ...(e.streetAddress ? { streetAddress: e.streetAddress } : {}),
          ...(e.city ? { addressLocality: e.city } : {}),
          ...(e.postalCode ? { postalCode: e.postalCode } : {}),
          ...(e.country ? { addressCountry: e.country } : {}),
        },
      }
    : undefined;
  const image = e.image && !/\.(mp4|mov|webm|ogv)(\?|$)/i.test(e.image)
    ? (e.image.startsWith('/') ? absoluteUrl(e.image) : e.image)
    : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.heading,
    startDate,
    ...(endDate ? { endDate } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: online ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
    location: online ? { '@type': 'VirtualLocation', url: e.url } : place,
    ...(plain(e.description) ? { description: plain(e.description) } : {}),
    ...(image ? { image: [image] } : {}),
    ...(e.pageUrl ? { url: e.pageUrl } : {}),
    inLanguage: e.language || 'en',
  };
}
