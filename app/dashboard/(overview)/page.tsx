import '@/app/ui/wedding.css';
import { auth } from '@/auth';
import { fetchUserPageById } from '@/app/lib/data';
import ImageUpload from '@/app/ui/image';
import EditableHeading from '@/app/ui/heading';
import EditableDescription from '@/app/ui/description';
import RegistrySection from '@/app/ui/dashboard/registry-section';
import VenueSection from '@/app/ui/dashboard/venue-section';
import EventFooter from '@/app/ui/dashboard/event-footer';

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;
  const userPage = userId ? await fetchUserPageById(userId) : undefined;

  return (
    <main className="wedding-page">

      <EditableHeading defaultHeading={userPage?.heading || ''} />

      <ImageUpload defaultImage={userPage?.banner_image || ''} />

      <EditableDescription defaultDescription={userPage?.description || ''} />

      <RegistrySection
        defaultImage={userPage?.section_2_image || ''}
        defaultDescription={userPage?.section_2_description || ''}
        defaultButtonText={userPage?.section_2_button_text || 'View Registry'}
        defaultButtonLink={userPage?.section_2_button_link || ''}
      />

      {userPage && (
        <VenueSection
          location={userPage.location}
          streetAddress={userPage.street_address}
          unitNumber={userPage.unit_number}
          city={userPage.city}
          postalCode={userPage.postal_code}
          country={userPage.country}
          placeId={userPage.place_id}
          formattedAddress={userPage.formatted_address}
        />
      )}

      <EventFooter
        eventDate={userPage?.event_date}
        eventTime={userPage?.event_time}
      />

    </main>
  );
}
