import { notFound } from 'next/navigation';
import { fetchUserPage, fetchUserPages } from '../lib/data';


interface EventData {
  id: string;
  user_id: string;
  slug: string;
  banner_image: string;
  heading: string;
  main_content: string;
  event_date: string;
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
}

async function fetchEventData(slug: string): Promise<EventData | null> {


  const res = await fetchUserPage(slug); // Fetch the data from your database

  //console.log("THE RECORD IS:" +  res.id);

  if (!res || res === undefined) {
    return null; // Return null if no data is found
  }

  // Map the result to the expected EventData structure
  const eventData: EventData = {
    id: res.id,
    user_id: res.user_id,
    slug: res.slug,
    banner_image: res.banner_image,
    heading: res.heading,
    main_content: res.main_content,
    event_date: res.event_date,
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
  };

  return eventData; // Return the event data
}

async function fetchAllEventSlugs(): Promise<{ slug: string }[]> {
 // Fetch all pages from the database
 const res = await fetchUserPages();

 // Check if the result is valid
 if (!res || res.length === 0) {
   return []; // Return an empty array if no data is found
 }

 // Map the result to an array of slugs
 const slugs = res.map((page) => ({
   slug: page.slug,
 }));

 return slugs; // Return the array of slugs
}

export async function generateStaticParams() {
  const events = await fetchAllEventSlugs();
  //console.log(events);
  return events.map((event) => ({
    slug: event.slug,
  }));
}

export default async function EventPage({ params }: { params: { slug: string } }) {
  console.log('PARAMS');
  console.log(params);
  const { slug } = params; // Ensures params is resolved before use

  const data = await fetchEventData(slug);
  //console.log(data);
  if (!data) {
    notFound(); // Trigger a 404 page
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{data.heading}</h1>
      <p className="text-gray-600 mb-4">{data.description}</p>
      <p className="text-gray-600 mb-4">
        <strong>Event Date:</strong> {data.event_date.toString()}
      </p>
      <p className="text-gray-600 mb-4">
        <strong>Location:</strong>{' '}
        {data.location === 'virtual'
          ? data.url
            ? <a href={data.url} target="_blank" className="text-indigo-600 underline">{data.url}</a>
            : 'Virtual Event'
          : `${data.unit_number}, ${data.unit_number || ''}, ${data.city}, ${data.country}`}
      </p>
      {data.location === 'address' && (
        <div className="text-gray-600">
          <p><strong>Street Address:</strong> {data.street_address}</p>
          {data.unit_number && <p><strong>Unit Number:</strong> {data.unit_number}</p>}
          <p><strong>Postal Code:</strong> {data.postal_code}</p>
          <p><strong>City:</strong> {data.city}</p>
          <p><strong>Country:</strong> {data.country}</p>
        </div>
      )}
    </div>
  );
}
 