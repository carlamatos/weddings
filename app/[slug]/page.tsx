import { notFound } from 'next/navigation';
import Image from 'next/image';
import { fetchUserPage, fetchUserPages } from '../lib/data';
import '@/app/ui/wedding.css';

interface EventData {
  id: string;
  user_id: string;
  slug: string;
  banner_image: string;
  heading: string;
  main_content: string;
  event_date: string;
  event_time?: string;
  event_theme?: string;
  location: string;
  user_email: string;
  description: string;
  created_at: string;
  url?: string;
  street_address?: string;
  unit_number?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  place_id?: string;
  formatted_address?: string;
  section_2_image?: string;
  section_2_description?: string;
  section_2_button_text?: string;
  section_2_button_link?: string;
}

async function fetchEventData(slug: string): Promise<EventData | null> {
  const res = await fetchUserPage(slug);
  if (!res) return null;
  return {
    id: res.id,
    user_id: res.user_id,
    slug: res.slug,
    banner_image: res.banner_image,
    heading: res.heading,
    main_content: res.main_content,
    event_date: res.event_date,
    event_time: res.event_time || undefined,
    event_theme: res.event_theme || undefined,
    location: res.location,
    user_email: res.user_email,
    description: res.description,
    created_at: res.created_at,
    url: res.url || undefined,
    street_address: res.street_address || undefined,
    unit_number: res.unit_number || undefined,
    postal_code: res.postal_code || undefined,
    city: res.city || undefined,
    country: res.country || undefined,
    place_id: res.place_id || undefined,
    formatted_address: res.formatted_address || undefined,
    section_2_image: res.section_2_image || undefined,
    section_2_description: res.section_2_description || undefined,
    section_2_button_text: res.section_2_button_text || undefined,
    section_2_button_link: res.section_2_button_link || undefined,
  };
}

export async function generateStaticParams() {
  const res = await fetchUserPages();
  if (!res || res.length === 0) return [];
  return res.map((page) => ({ slug: page.slug }));
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const data = await fetchEventData(slug);
  if (!data) notFound();

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapSrc = data.place_id
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=place_id:${data.place_id}`
    : data.formatted_address
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(data.formatted_address)}`
    : null;

  const formattedDate = data.event_date
    ? new Date(data.event_date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      }).toUpperCase()
    : '';

  const formattedTime = data.event_time
    ? new Date(`1970-01-01T${data.event_time}`).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true,
      })
    : '';

  const registryImage = data.section_2_image || '/images/themes/wedding/registry.png';

  return (
    <div className="wedding-page">

      {/* Heading */}
      <div className="wedding-heading-section">
        <h1 className="wedding-heading">{data.heading}</h1>
      </div>

      {/* Banner */}
      <div className="wedding-banner-section">
        <div className="banner_wrap">
          <Image
            src={data.banner_image || '/images/themes/wedding/banner.png'}
            width={2000}
            height={760}
            className="top_img"
            alt={data.heading}
          />
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <div className="wedding-description-section">
          <p className="wedding-description">{data.description}</p>
        </div>
      )}

      {/* Registry */}
      <div className="wedding-registry-section">
        <div
          className="registry-image-wrap"
          style={{ backgroundImage: `url(${registryImage})` }}
        >
          <div className="registry-overlay">
            <h2 className="registry-title">REGISTRY</h2>
            {data.section_2_description && (
              <p className="registry-description">{data.section_2_description}</p>
            )}
            {data.section_2_button_link && (
              <a
                href={data.section_2_button_link}
                target="_blank"
                rel="noopener noreferrer"
                className="registry-button"
              >
                {data.section_2_button_text || 'View Registry'}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Venue */}
      {data.location === 'address' && (
        <div className="wedding-venue-section">
          <h2 className="venue-title">VENUE LOCATION</h2>
          <div className="venue-inner">
            <div className="venue-address">
              {data.street_address && <p>{data.street_address}</p>}
              {data.unit_number && <p>{data.unit_number}</p>}
              {data.city && <p>{data.city}</p>}
              {data.postal_code && <p>{data.postal_code}</p>}
              {data.country && <p>{data.country}</p>}
            </div>
            {mapSrc && (
              <iframe
                src={mapSrc}
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '0.5rem' }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="wedding-footer">
        {formattedDate && <p className="footer-date">{formattedDate}</p>}
        {formattedTime && <p className="footer-time">{formattedTime}</p>}
      </footer>

    </div>
  );
}
