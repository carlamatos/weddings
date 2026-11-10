import { redirectToDefaultPage } from '@/app/lib/dashboard';

// Old URL: RSVP is part of Guests & RSVPs now (the guest-list screen).
export default function Page() {
  return redirectToDefaultPage('/guest-list');
}
