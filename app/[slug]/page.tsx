import { notFound } from 'next/navigation';

interface EventData {
  title: string;
  description: string;
  eventDate: string;
  location: string;
  url?: string;
  streetAddress?: string;
  unitNumber?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

async function fetchEventData(slug: string): Promise<EventData | null> {
  // Replace with your backend logic to fetch event data
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${slug}`);
  if (!res.ok) {
    return null;
  }
  return res.json();
}

async function fetchAllEventSlugs(): Promise<{ slug: string }[]> {
  // Replace with your actual logic to fetch all event slugs
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events`);
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function generateStaticParams() {
  const events = await fetchAllEventSlugs();

  return events.map((event) => ({
    slug: event.slug,
  }));
}

export default async function EventPage({ params }: { params: { slug: string } }) {
  const data = await fetchEventData(params.slug);
  console.log(data);
  if (!data) {
    notFound(); // Trigger a 404 page
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{data.title}</h1>
      <p className="text-gray-600 mb-4">{data.description}</p>
      <p className="text-gray-600 mb-4">
        <strong>Event Date:</strong> {data.eventDate}
      </p>
      <p className="text-gray-600 mb-4">
        <strong>Location:</strong>{' '}
        {data.location === 'virtual'
          ? data.url
            ? <a href={data.url} target="_blank" className="text-indigo-600 underline">{data.url}</a>
            : 'Virtual Event'
          : `${data.streetAddress}, ${data.unitNumber || ''}, ${data.city}, ${data.country}`}
      </p>
      {data.location === 'address' && (
        <div className="text-gray-600">
          <p><strong>Street Address:</strong> {data.streetAddress}</p>
          {data.unitNumber && <p><strong>Unit Number:</strong> {data.unitNumber}</p>}
          <p><strong>Postal Code:</strong> {data.postalCode}</p>
          <p><strong>City:</strong> {data.city}</p>
          <p><strong>Country:</strong> {data.country}</p>
        </div>
      )}
    </div>
  );
}
